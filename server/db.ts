import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, gte, lte, ne, sql } from "drizzle-orm";
import { InsertUser, users, empleados, planesSustitucion, InsertPlanSustitucion, PlanSustitucion, planesSuccesion, planesAccion, seguimientoPlanes, InsertSeguimientoPlan, SeguimientoPlan, sucesionPuestos, InsertSucesionPuesto, SucesionPuesto, historialSucesores } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Re-export types for convenience
export type { Empleado, InsertEmpleado, PlanSustitucion, InsertPlanSustitucion, SeguimientoPlan, InsertSeguimientoPlan } from "../drizzle/schema";

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Inicializar base de datos de forma síncrona para evitar problemas en tests
export function initDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Helpers para empleados
export async function getAllEmpleados() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(empleados);
}

export async function getEmpleadosByDepartamento(departamento: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(empleados).where(eq(empleados.departamento, departamento));
}

export async function searchEmpleados(query: string) {
  const db = await getDb();
  if (!db) return [];
  // Búsqueda simple por nombre o cédula
  const results = await db.select().from(empleados);
  const lowerQuery = query.toLowerCase();
  return results.filter(
    (e) =>
      e.nombre.toLowerCase().includes(lowerQuery) ||
      e.cedula.toLowerCase().includes(lowerQuery) ||
      e.cargo.toLowerCase().includes(lowerQuery)
  );
}

export async function getDepartamentos() {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(empleados);
  const depts = new Set(results.map((e) => e.departamento));
  return Array.from(depts).sort();
}

export async function getSedes() {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(empleados);
  const sedes = new Set(results.map((e) => e.sede));
  return Array.from(sedes).sort();
}

export async function getAreas() {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(empleados);
  const areas = new Set(results.map((e) => e.area));
  return Array.from(areas).sort();
}

export async function getCargos() {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(empleados);
  const cargos = new Set(results.map((e) => e.cargo));
  return Array.from(cargos).sort();
}

export async function getEmpleadoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(empleados).where(eq(empleados.id, id));
  return result.length > 0 ? result[0] : null;
}

// Helpers para planes de sustitución
export async function getAllPlanes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(planesSustitucion);
}

export async function createPlan(plan: InsertPlanSustitucion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(planesSustitucion).values(plan);
  const createdPlan = await db.select().from(planesSustitucion).where(eq(planesSustitucion.id, result[0].insertId)).limit(1);
  
  if (!createdPlan[0]) throw new Error("Failed to create plan");
  
  // Calcular analisis de riesgo automatico
  const planWithRisk = await calcularAnalisisRiesgo(createdPlan[0]);
  
  // Actualizar el plan con los valores de riesgo calculados
  await db
    .update(planesSustitucion)
    .set({
      cargoUnico: planWithRisk.cargoUnico,
      cantidadPersonasMismoCargo: planWithRisk.cantidadPersonasMismoCargo,
      riesgoContinuidad: planWithRisk.riesgoContinuidad,
      poolPotencial: planWithRisk.poolPotencial,
      riesgoCritico: planWithRisk.riesgoCritico,
      prioridadSucesion: planWithRisk.prioridadSucesion,
    })
    .where(eq(planesSustitucion.id, createdPlan[0].id));
  
  // Crear registro en planesSuccesion SOLO si es puesto clave
  if (plan.puestoClave === "Si") {
    // Verificar si hay datos de sucesión (nuevo flujo)
    const tieneSucesion = (plan as any).sucesion && (plan as any).sucesion.aplicaSucesion === "Si";
    
    // Determinar el reemplazo a usar: sucesor (si aplica) o reemplazo operativo
    const reemplazoParaSuccesion = tieneSucesion ? (plan as any).sucesion.sucesor : (plan.reemplazo || "");
    
    // Calcular riesgo: sin sucesor/reemplazo = Alto, con sucesor/reemplazo = Bajo
    const sinCobertura = !reemplazoParaSuccesion || reemplazoParaSuccesion.trim() === "" || reemplazoParaSuccesion.toUpperCase() === "NO APLICA";
    const riesgoContinuidad = sinCobertura ? "Alto" : "Bajo";
    const prioridadSucesion = "Alta"; // Siempre Alta para puestos clave
    
    // Crear registro en planesSuccesion
    const planSuccesionResult = await db.insert(planesSuccesion).values({
      planSustitucionId: createdPlan[0].id,
      departamento: plan.departamento,
      cargo: plan.cargo,
      colaborador: plan.colaborador,
      reemplazo: reemplazoParaSuccesion,
      riesgoContinuidad: riesgoContinuidad as "Alto" | "Medio" | "Bajo",
      riesgoCritico: plan.riesgoCritico || "No",
      prioridadSucesion: prioridadSucesion as "Alta" | "Media" | "Baja",
      estado: "Pendiente",
      usuario: plan.usuario,
    });
    
    // Si hay datos de sucesión, crear registro en sucesion_puestos
    if (tieneSucesion) {
      const sucesionData = (plan as any).sucesion;
      await db.insert(sucesionPuestos).values({
        planSustitucionId: createdPlan[0].id,
        puestoClave: plan.colaborador,
        departamentoPuestoClave: plan.departamento,
        cargoPuestoClave: plan.cargo,
        sucesor: sucesionData.sucesor,
        departamentoSucesor: sucesionData.departamentoSucesor,
        cargoSucesor: sucesionData.cargoSucesor,
        aplicaSucesion: "Si",
        usuario: plan.usuario,
      });
      
      // Registrar en historial de sucesores (auditoría)
      await db.insert(historialSucesores).values({
        sucesionPuestoId: planSuccesionResult[0].insertId,
        sucesorAnterior: "",
        sucesorNuevo: sucesionData.sucesor,
        motivo: "Creación inicial de sucesión",
        usuario: plan.usuario,
      });
    }
  }
  
  return { success: true, plan: planWithRisk };
}

export async function updatePlan(id: number, plan: Partial<InsertPlanSustitucion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Actualizar el plan de sustitución
  await db.update(planesSustitucion).set(plan).where(eq(planesSustitucion.id, id));
  
  // Si es puesto clave, actualizar también en planesSuccesion
  if (plan.puestoClave === "Si") {
    // Calcular riesgo: sin reemplazo = Alto, con reemplazo = Bajo
    const sinReemplazo = !plan.reemplazo || plan.reemplazo.trim() === "" || plan.reemplazo.toUpperCase() === "NO APLICA";
    const riesgoContinuidad = sinReemplazo ? "Alto" : "Bajo";
    const prioridadSucesion = "Alta"; // Siempre Alta para puestos clave
    
    // Actualizar o crear registro en planesSuccesion
    const existingRecord = await db.select().from(planesSuccesion).where(eq(planesSuccesion.planSustitucionId, id));
    
    if (existingRecord.length > 0) {
      // Actualizar registro existente
      await db.update(planesSuccesion).set({
        reemplazo: plan.reemplazo || "",
        riesgoContinuidad: riesgoContinuidad as "Alto" | "Medio" | "Bajo",
        prioridadSucesion: prioridadSucesion as "Alta" | "Media" | "Baja",
      }).where(eq(planesSuccesion.planSustitucionId, id));
    } else {
      // Crear nuevo registro si no existe
      const planRecord = await db.select().from(planesSustitucion).where(eq(planesSustitucion.id, id));
      if (planRecord.length > 0) {
        const p = planRecord[0];
        await db.insert(planesSuccesion).values({
          planSustitucionId: id,
          departamento: p.departamento,
          cargo: p.cargo,
          colaborador: p.colaborador,
          reemplazo: plan.reemplazo || "",
          riesgoContinuidad: riesgoContinuidad as "Alto" | "Medio" | "Bajo",
          riesgoCritico: p.riesgoCritico || "No",
          prioridadSucesion: prioridadSucesion as "Alta" | "Media" | "Baja",
          estado: "Pendiente",
          usuario: p.usuario,
        });
      }
    }
  } else if (plan.puestoClave === "No") {
    // Si se desmarca como puesto clave, eliminar de planesSuccesion
    await db.delete(planesSuccesion).where(eq(planesSuccesion.planSustitucionId, id));
  }
  
  return { success: true };
}

export async function deletePlan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Primero eliminar registros en planesSuccesion vinculados
  await db.delete(planesSuccesion).where(eq(planesSuccesion.planSustitucionId, id));
  
  // Luego eliminar el plan de sustitución
  return db.delete(planesSustitucion).where(eq(planesSustitucion.id, id))
}

export async function getPlanById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(planesSustitucion).where(eq(planesSustitucion.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function getPlansByDepartamento(departamento: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(planesSustitucion).where(eq(planesSustitucion.departamento, departamento));
}

export async function getPlanStats() {
  const db = await getDb();
  if (!db) return { totalPlanes: 0, puestosClaveCount: 0, departamentosConCobertura: 0, departamentosSinCobertura: [] };

  const planes = await db.select().from(planesSustitucion);
  const empleadosList = await db.select().from(empleados);

  const totalPlanes = planes.length;
  const puestosClaveCount = planes.filter((p) => p.puestoClave === "Si").length;

  const departamentosConPlanes = new Set(planes.map((p) => p.departamento));
  const todosDepartamentos = new Set(empleadosList.map((e) => e.departamento));

  const departamentosSinCobertura = Array.from(todosDepartamentos).filter(
    (d) => !departamentosConPlanes.has(d)
  );

  return {
    totalPlanes,
    puestosClaveCount,
    departamentosConCobertura: departamentosConPlanes.size,
    departamentosSinCobertura,
  };
}

export async function getPlanesGroupedByDepartamento() {
  const db = await getDb();
  if (!db) return {};
  const planes = await db.select().from(planesSustitucion);
  const grouped: Record<string, number> = {};
  planes.forEach((p) => {
    grouped[p.departamento] = (grouped[p.departamento] || 0) + 1;
  });
  return grouped;
}

export async function getEmpleadosByCargoAndDepartamento(cargo: string, departamento: string) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(empleados);
  return results.filter((e) => e.cargo === cargo && e.departamento === departamento);
}

// Funciones para usuarios locales
import { usuariosLocales, type InsertUsuarioLocal, type UsuarioLocal } from "../drizzle/schema";
import bcrypt from "bcrypt";

export async function createUsuarioLocal(data: InsertUsuarioLocal): Promise<UsuarioLocal> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(data.contraseña, 10);

  const result = await db.insert(usuariosLocales).values({
    ...data,
    contraseña: hashedPassword,
  });

  const usuario = await db
    .select()
    .from(usuariosLocales)
    .where(eq(usuariosLocales.usuario, data.usuario))
    .limit(1);

  return usuario[0]!;
}

export async function getUsuarioLocalByUsuario(usuario: string): Promise<UsuarioLocal | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(usuariosLocales)
    .where(eq(usuariosLocales.usuario, usuario))
    .limit(1);

  return result[0];
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function getAllUsuariosLocales(): Promise<UsuarioLocal[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(usuariosLocales).where(eq(usuariosLocales.activo, 1));
}

export async function updateUsuarioLocal(id: number, data: Partial<InsertUsuarioLocal>): Promise<UsuarioLocal | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const updateData: any = { ...data };
  if (data.contraseña) {
    updateData.contraseña = await bcrypt.hash(data.contraseña, 10);
  }

  await db.update(usuariosLocales).set(updateData).where(eq(usuariosLocales.id, id));

  const result = await db.select().from(usuariosLocales).where(eq(usuariosLocales.id, id)).limit(1);

  return result[0];
}

export async function deleteUsuarioLocal(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(usuariosLocales).set({ activo: 0 }).where(eq(usuariosLocales.id, id));
}

// Re-export types
export type { UsuarioLocal, InsertUsuarioLocal } from "../drizzle/schema";

// Función para importar empleados desde Excel
export async function importarEmpleados(empleadosData: Array<{
  sede: string;
  cedula: string;
  nombre: string;
  area: string;
  departamento: string;
  cargo: string;
}>): Promise<{ importedCount: number; duplicatedCount: number; errors: string[] }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let importedCount = 0;
  let duplicatedCount = 0;
  const errors: string[] = [];

  for (const emp of empleadosData) {
    try {
      // Validar que los campos requeridos existan
      if (!emp.sede || !emp.cedula || !emp.nombre || !emp.area || !emp.departamento || !emp.cargo) {
        errors.push(`Fila incompleta: ${emp.nombre || 'sin nombre'}`);
        continue;
      }

      // Verificar si el empleado ya existe por cédula
      const existingEmpleado = await db
        .select()
        .from(empleados)
        .where(eq(empleados.cedula, emp.cedula))
        .limit(1);

      if (existingEmpleado.length > 0) {
        duplicatedCount++;
        continue;
      }

      // Insertar el empleado
      await db.insert(empleados).values({
        sede: emp.sede,
        cedula: emp.cedula,
        nombre: emp.nombre,
        area: emp.area,
        departamento: emp.departamento,
        cargo: emp.cargo,
      });

      importedCount++;
    } catch (error) {
      errors.push(`Error al importar ${emp.nombre}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  return { importedCount, duplicatedCount, errors };
}


// Función para calcular análisis automático de riesgo
export async function calcularAnalisisRiesgo(plan: PlanSustitucion) {
  const db = await getDb();
  if (!db) return plan;

  // Regla 1 & 2: Contar cantidad de personas con el mismo cargo + área + departamento
  const empleadosMismoCargo = await db
    .select()
    .from(empleados)
    .where(
      eq(empleados.cargo, plan.cargo) &&
      eq(empleados.departamento, plan.departamento)
    );

  const cantidad = empleadosMismoCargo.length;

  // Regla 1: Detección de cargos únicos
  const cargoUnico: "Si" | "No" = cantidad === 1 ? "Si" : "No";

  // Regla 2: Clasificación por dotación
  let riesgoContinuidad: "Alto" | "Medio" | "Bajo" = "Bajo";
  if (cantidad === 1) riesgoContinuidad = "Alto";
  else if (cantidad === 2) riesgoContinuidad = "Medio";

  // Regla 3: Identificación de pools potenciales
  const poolPotencial: "Si" | "No" = cantidad >= 3 ? "Si" : "No";

  // Regla 4: Cruce con "sin reemplazo"
  let riesgoCritico: "Si" | "No" = "No";
  if (plan.reemplazo === "No aplica – no existe reemplazo disponible") {
    if (cargoUnico === "Si" || riesgoContinuidad === "Alto") {
      riesgoCritico = "Si";
    }
  }

  // Regla 5: Cruce con "puesto clave"
  let prioridadSucesion: "Alta" | "Media" | "Baja" = "Baja";
  if (plan.puestoClave === "Si") {
    if (riesgoContinuidad === "Alto" || riesgoContinuidad === "Medio") {
      prioridadSucesion = "Alta";
    }
  }

  return {
    ...plan,
    cargoUnico,
    cantidadPersonasMismoCargo: cantidad,
    riesgoContinuidad,
    poolPotencial,
    riesgoCritico,
    prioridadSucesion,
  };
}

// Función para crear plan con análisis automático de riesgo
export async function createPlanWithRiskAnalysis(data: InsertPlanSustitucion): Promise<PlanSustitucion> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Crear el plan
  const result = await db.insert(planesSustitucion).values(data);
  const newPlan = await getPlanById(result[0].insertId);

  if (!newPlan) throw new Error("Failed to create plan");

  // Calcular análisis de riesgo
  const planWithRisk = await calcularAnalisisRiesgo(newPlan);

  // Actualizar el plan con los valores de riesgo calculados
  await db
    .update(planesSustitucion)
    .set({
      cargoUnico: planWithRisk.cargoUnico,
      cantidadPersonasMismoCargo: planWithRisk.cantidadPersonasMismoCargo,
      riesgoContinuidad: planWithRisk.riesgoContinuidad,
      poolPotencial: planWithRisk.poolPotencial,
      riesgoCritico: planWithRisk.riesgoCritico,
      prioridadSucesion: planWithRisk.prioridadSucesion,
    })
    .where(eq(planesSustitucion.id, newPlan.id));

  return planWithRisk;
}


// Importar tipos de planes de sucesión
import { comentariosPlanes, type ComentarioPlan, type InsertComentarioPlan, type PlanSuccesion, type InsertPlanSuccesion, type PlanAccion, type InsertPlanAccion } from "../drizzle/schema";

// Funciones para Planes de Sucesión
export async function createPlanSuccesion(data: InsertPlanSuccesion): Promise<PlanSuccesion> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(planesSuccesion).values(data);
  const plan = await db.select().from(planesSuccesion).where(eq(planesSuccesion.id, result[0].insertId)).limit(1);
  return plan[0]!;
}

export async function getPlanesSuccesion() {
  const db = await getDb();
  if (!db) return [];
  
  // Traer puestos críticos de sucesion_puestos (tabla consolidada)
  const planesData = await db.select().from(sucesionPuestos);
  
  // Ordenar por sucesor para que los vacíos/sin sucesor queden primero
  const planesOrdenados = planesData.sort((a, b) => {
    const aSucesor = (a.sucesor || "").trim();
    const bSucesor = (b.sucesor || "").trim();
    // Primero los vacíos, luego los NO APLICA, luego los demás
    if (aSucesor === "" && bSucesor !== "") return -1;
    if (aSucesor !== "" && bSucesor === "") return 1;
    const aNoAplica = aSucesor.toUpperCase() === "NO APLICA";
    const bNoAplica = bSucesor.toUpperCase() === "NO APLICA";
    if (aNoAplica && !bNoAplica) return -1;
    if (!aNoAplica && bNoAplica) return 1;
    return 0;
  });
  
  // Retornar los datos tal como están en la BD, sin sobrescribir
  return planesOrdenados;
}

export async function getPlanesSuccesionCriticos() {
  const db = await getDb();
  if (!db) return [];
  
  await getPlanesSuccesion();
  
  return db.select().from(planesSuccesion).where(eq(planesSuccesion.riesgoCritico, "Si"));
}

export async function updatePlanSuccesion(id: number, data: Partial<InsertPlanSuccesion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(planesSuccesion).set(data).where(eq(planesSuccesion.id, id));
  return db.select().from(planesSuccesion).where(eq(planesSuccesion.id, id)).limit(1);
}

// Función para actualizar manualmente el riesgoContinuidad de un plan de sucesión
export async function updatePlanSuccesionRiesgo(id: number, nuevoRiesgo: "Alto" | "Medio" | "Bajo", motivo?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Obtener plan anterior para validación
  const planAnterior = await db.select().from(planesSuccesion).where(eq(planesSuccesion.id, id)).limit(1);
  
  if (planAnterior.length === 0) {
    throw new Error("Plan de sucesión no encontrado");
  }
  
  // Actualizar riesgo
  await db.update(planesSuccesion).set({
    riesgoContinuidad: nuevoRiesgo,
  }).where(eq(planesSuccesion.id, id));
  
  return db.select().from(planesSuccesion).where(eq(planesSuccesion.id, id)).limit(1);
}

// Funciones para Planes de Acción
export async function createPlanAccion(data: InsertPlanAccion): Promise<PlanAccion> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(planesAccion).values(data);
  const plan = await db.select().from(planesAccion).where(eq(planesAccion.id, result[0].insertId)).limit(1);
  
  // Registrar creación en auditoría
  if (plan[0]) {
    const { registrarCambioAuditoria } = await import("./db-helpers");
    await registrarCambioAuditoria(
      plan[0].id,
      "",
      data.usuario || "Sistema",
      "CREADO",
      undefined,
      undefined,
      undefined,
      `Plan de acción creado: ${data.titulo}`
    );
  }
  
  return plan[0]!;
}

export async function getPlanesAccionBySuccesion(planSuccesionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(planesAccion).where(eq(planesAccion.planSuccesionId, planSuccesionId));
}

// Función para obtener Planes de Acción agrupados por Puesto Crítico
export async function getPlanesAccionPorPuestoCritico() {
  const db = await getDb();
  if (!db) return [];
  
  // Obtener todos los planes de sucesión con sus acciones
  const planes = await db.select().from(planesSuccesion);
  
  const resultado = await Promise.all(
    planes.map(async (plan) => {
      const acciones = await db.select().from(planesAccion).where(eq(planesAccion.planSuccesionId, plan.id));
      return {
        ...plan,
        acciones: acciones || [],
        totalAcciones: acciones?.length || 0,
        accionesCompletadas: acciones?.filter(a => a.estado === 'Completado').length || 0,
        accionesEnProgreso: acciones?.filter(a => a.estado === 'En Progreso').length || 0,
        accionesNoIniciadas: acciones?.filter(a => a.estado === 'No Iniciado').length || 0,
        accionesRetrasadas: acciones?.filter(a => a.estado === 'Retrasado').length || 0,
      };
    })
  );
  
  return resultado;
}

export async function updatePlanAccion(id: number, data: Partial<InsertPlanAccion>, usuario?: string, usuarioId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Obtener plan anterior para comparar cambios
  const planAnterior = await db.select().from(planesAccion).where(eq(planesAccion.id, id)).limit(1);
  
  await db.update(planesAccion).set(data).where(eq(planesAccion.id, id));
  const result = await db.select().from(planesAccion).where(eq(planesAccion.id, id)).limit(1);
  
  // Registrar cambios en auditoria
  if (usuario && usuarioId && planAnterior[0]) {
    const { registrarCambioAuditoria } = await import("./db-helpers");
    
    // Registrar cambios de estado
    if (planAnterior[0].estado !== data.estado) {
      await registrarCambioAuditoria(
        id,
        usuarioId,
        usuario,
        "ESTADO_CAMBIO",
        "estado",
        planAnterior[0].estado,
        data.estado || "",
        `Estado cambio de ${planAnterior[0].estado} a ${data.estado}`
      );
    }
    
    // Registrar cambios de progreso
    if (planAnterior[0].progreso !== data.progreso) {
      await registrarCambioAuditoria(
        id,
        usuarioId,
        usuario,
        "PROGRESO_CAMBIO",
        "progreso",
        planAnterior[0].progreso?.toString(),
        data.progreso?.toString(),
        `Progreso cambio de ${planAnterior[0].progreso}% a ${data.progreso}%`
      );
    }
    
    // Registrar otros cambios
    if (Object.keys(data).length > 0) {
      await registrarCambioAuditoria(
        id,
        usuarioId,
        usuario,
        "ACTUALIZADO",
        undefined,
        undefined,
        undefined,
        "Plan de accion actualizado"
      );
    }
  }
  
  return result[0];
}

export async function deletePlanAccion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(planesAccion).where(eq(planesAccion.id, id));
}

// Funciones para Comentarios
export async function createComentario(data: InsertComentarioPlan): Promise<ComentarioPlan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(comentariosPlanes).values(data);
  const comentario = await db.select().from(comentariosPlanes).where(eq(comentariosPlanes.id, result[0].insertId)).limit(1);
  return comentario[0]!;
}

export async function getComentariosByPlanAccion(planAccionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comentariosPlanes).where(eq(comentariosPlanes.planAccionId, planAccionId));
}

export async function deleteComentario(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(comentariosPlanes).where(eq(comentariosPlanes.id, id));
}

// Función para obtener puestos críticos automáticamente
export async function obtenerPuestosCriticos() {
  const db = await getDb();
  if (!db) return [];
  
  const planes = await db.select().from(planesSustitucion).where(eq(planesSustitucion.riesgoCritico, "Si"));
  return planes;
}

// Re-export types
export type { PlanSuccesion, InsertPlanSuccesion, PlanAccion, InsertPlanAccion, ComentarioPlan, InsertComentarioPlan } from "../drizzle/schema";


// Funciones para Seguimiento de Planes de Acción
export async function createSeguimientoPlan(data: InsertSeguimientoPlan): Promise<SeguimientoPlan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(seguimientoPlanes).values(data);
  const seguimiento = await db.select().from(seguimientoPlanes).where(eq(seguimientoPlanes.id, result[0].insertId)).limit(1);
  return seguimiento[0]!;
}

export async function getSeguimientoPlan(planAccionId: number) {
  const db = await getDb();
  if (!db) return null;
  const seguimiento = await db.select().from(seguimientoPlanes).where(eq(seguimientoPlanes.planAccionId, planAccionId)).limit(1);
  return seguimiento[0] || null;
}

export async function updateSeguimientoPlan(id: number, data: Partial<InsertSeguimientoPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(seguimientoPlanes).set(data).where(eq(seguimientoPlanes.id, id));
  return db.select().from(seguimientoPlanes).where(eq(seguimientoPlanes.id, id)).limit(1);
}

export async function getDashboardMetricas() {
  const db = await getDb();
  if (!db) return { planesTotal: 0, planesEnProgreso: 0, planesCompletados: 0, planesRetrasados: 0, accionesProximas: [] };
  
  // Traer puestos criticos del Plan de Sustitucion
  const planes = await getPlanesSuccesion();
  
  const planesTotal = planes.length;
  const puestosAltoRiesgo = planes.filter(p => !p.sucesor).length;
  
  // Contar planes de acción por estado (vinculados a planesSuccesion)
  const enProgresoResult = await db.select({ count: sql<number>`COUNT(*)` }).from(planesAccion)
    .innerJoin(planesSuccesion, eq(planesAccion.planSuccesionId, planesSuccesion.id))
    .where(eq(planesAccion.estado, "En Progreso"));
  const completadosResult = await db.select({ count: sql<number>`COUNT(*)` }).from(planesAccion)
    .innerJoin(planesSuccesion, eq(planesAccion.planSuccesionId, planesSuccesion.id))
    .where(eq(planesAccion.estado, "Completado"));
  const retrasadosResult = await db.select({ count: sql<number>`COUNT(*)` }).from(planesAccion)
    .innerJoin(planesSuccesion, eq(planesAccion.planSuccesionId, planesSuccesion.id))
    .where(eq(planesAccion.estado, "Retrasado"));
  
  const planesEnProgreso = Number(enProgresoResult[0]?.count || 0);
  const planesCompletados = Number(completadosResult[0]?.count || 0);
  const planesRetrasados = Number(retrasadosResult[0]?.count || 0);
  
  // Planes de acción próximos a vencer (próximos 7 días)
  const hoy = new Date();
  const proximos7Dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const accionesProximas = await db.select().from(planesAccion)
    .where(
      and(
        gte(planesAccion.fechaFin, hoy),
        lte(planesAccion.fechaFin, proximos7Dias),
        ne(planesAccion.estado, "Completado")
      )
    ).limit(10);
  
  return {
    planesTotal,
    planesEnProgreso,
    planesCompletados,
    planesRetrasados,
    puestosAltoRiesgo,
    accionesProximas,
  };
}

export async function getResumenPorDepartamento() {
  const db = await getDb();
  if (!db) return [];
  
  const resumen = await db.select({
    departamento: planesSuccesion.departamento,
    total: sql<number>`CAST(COUNT(*) AS UNSIGNED)`,
    criticos: sql<number>`CAST(SUM(CASE WHEN riesgoContinuidad = 'Alto' AND reemplazo = '' THEN 1 ELSE 0 END) AS UNSIGNED)`,
    completados: sql<number>`CAST(SUM(CASE WHEN estado = 'Completado' THEN 1 ELSE 0 END) AS UNSIGNED)`,
  }).from(planesSuccesion).groupBy(planesSuccesion.departamento);
  
  return resumen.map(r => ({
    ...r,
    total: Number(r.total) || 0,
    criticos: Number(r.criticos) || 0,
    completados: Number(r.completados) || 0,
  }));
}


// Sincronizar planes faltantes (para registros antiguos que no fueron vinculados)
export async function syncMissingPlanes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Obtener todos los puestos críticos
  const allCriticalPlanes = await db
    .select()
    .from(planesSustitucion)
    .where(eq(planesSustitucion.puestoClave, "Si"));
  
  // Obtener los IDs que ya están en planesSuccesion
  const existingPlanes = await db
    .select({ planSustitucionId: planesSuccesion.planSustitucionId })
    .from(planesSuccesion);
  
  const existingIdSet = new Set(existingPlanes.map(e => e.planSustitucionId));
  
  // Filtrar los planes que faltan
  const missingPlanes = allCriticalPlanes.filter(p => !existingIdSet.has(p.id));
  
  if (missingPlanes.length === 0) {
    return { synced: 0, message: "Todos los planes están sincronizados" };
  }
  
  // Insertar los planes faltantes
  let insertedCount = 0;
  for (const plan of missingPlanes) {
    try {
      const hasReemplazo = plan.reemplazo && 
                          plan.reemplazo.trim() !== "" && 
                          plan.reemplazo.trim().toUpperCase() !== "NO APLICA";
      
      // Para puestos clave: sin reemplazo = Alto, con reemplazo = Bajo
      // Prioridad siempre Alta para puestos clave
      const riesgoContinuidad = hasReemplazo ? "Bajo" : "Alto";
      const prioridadSucesion = "Alta"; // Siempre Alta para puestos clave
      
      await db.insert(planesSuccesion).values({
        planSustitucionId: plan.id,
        colaborador: plan.colaborador,
        cargo: plan.cargo,
        departamento: plan.departamento,
        reemplazo: plan.reemplazo || "",
        riesgoContinuidad: riesgoContinuidad as "Alto" | "Medio" | "Bajo",
        prioridadSucesion: prioridadSucesion as "Alta" | "Media" | "Baja",
        riesgoCritico: hasReemplazo ? "No" : "Si",
        estado: "Pendiente",
        usuario: plan.usuario,
      });
      insertedCount++;
    } catch (error) {
      console.error(`Error insertando plan ${plan.id}:`, error);
    }
  }
  
  // Actualizar los registros existentes en planesSuccesion con datos correctos
  let updatedCount = 0;
  for (const existingId of Array.from(existingIdSet)) {
    try {
      const plan = allCriticalPlanes.find(p => p.id === existingId);
      if (plan) {
        const hasReemplazo = plan.reemplazo && 
                            plan.reemplazo.trim() !== "" && 
                            plan.reemplazo.trim().toUpperCase() !== "NO APLICA";
        
        const riesgoContinuidad = hasReemplazo ? "Bajo" : "Alto";
        const prioridadSucesion = "Alta";
        
        await db.update(planesSuccesion).set({
          reemplazo: plan.reemplazo || "",
          riesgoContinuidad: riesgoContinuidad as "Alto" | "Medio" | "Bajo",
          prioridadSucesion: prioridadSucesion as "Alta" | "Media" | "Baja",
          riesgoCritico: hasReemplazo ? "No" : "Si",
        }).where(eq(planesSuccesion.planSustitucionId, existingId));
        updatedCount++;
      }
    } catch (error) {
      console.error(`Error actualizando plan ${existingId}:`, error);
    }
  }
  
  return { synced: insertedCount, updated: updatedCount, message: `${insertedCount} planes sincronizados, ${updatedCount} planes actualizados` };
}


// Función para actualizar seguimiento con archivo de evidencia
export async function updateSeguimientoConEvidencia(
  planAccionId: number,
  estado: string,
  progreso: number,
  archivoEvidencia?: string,
  comentario?: string,
  usuario?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Buscar o crear seguimiento
  let seguimiento = await db.select().from(seguimientoPlanes).where(eq(seguimientoPlanes.planAccionId, planAccionId)).limit(1);
  
  if (!seguimiento || seguimiento.length === 0) {
    // Crear nuevo seguimiento
    const result = await db.insert(seguimientoPlanes).values({
      planAccionId,
      estado: estado as any,
      progreso,
      archivoEvidencia,
      comentario,
      usuario: usuario || "sistema",
    });
    return db.select().from(seguimientoPlanes).where(eq(seguimientoPlanes.id, result[0].insertId)).limit(1);
  } else {
    // Actualizar existente
    const updateData: any = {
      estado,
      progreso,
      comentario,
    };
    
    if (archivoEvidencia) {
      updateData.archivoEvidencia = archivoEvidencia;
    }
    
    await db.update(seguimientoPlanes).set(updateData).where(eq(seguimientoPlanes.planAccionId, planAccionId));
    return db.select().from(seguimientoPlanes).where(eq(seguimientoPlanes.planAccionId, planAccionId)).limit(1);
  }
}

// Función para obtener Planes de Sucesión con datos de sucesor
export async function getPlanesSuccesionConSucesor() {
  const db = await getDb();
  if (!db) return [];
  
  // Traer todos los registros de sucesion_puestos
  const sucesiones = await db.select().from(sucesionPuestos);
  
  // Ordenar por sucesor: primero los sin sucesor, luego los con sucesor
  const sucesionesOrdenadas = sucesiones.sort((a, b) => {
    const aSucesor = (a.sucesor || "").trim();
    const bSucesor = (b.sucesor || "").trim();
    // Primero los vacíos, luego los NO APLICA, luego los demás
    if (aSucesor === "" && bSucesor !== "") return -1;
    if (aSucesor !== "" && bSucesor === "") return 1;
    const aNoAplica = aSucesor.toUpperCase() === "NO APLICA";
    const bNoAplica = bSucesor.toUpperCase() === "NO APLICA";
    if (aNoAplica && !bNoAplica) return -1;
    if (!aNoAplica && bNoAplica) return 1;
    return 0;
  });
  
  return sucesionesOrdenadas;
}

// Función para obtener Planes de Sucesión con sucesor filtrados por departamento
export async function getPlanesSuccesionConSucesorByDepartamento(departamento: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (departamento === "Todos") {
    return getPlanesSuccesionConSucesor();
  }
  
  const sucesiones = await db.select().from(sucesionPuestos).where(eq(sucesionPuestos.departamentoPuestoClave, departamento));
  
  // Ordenar por sucesor
  return sucesiones.sort((a, b) => {
    const aSucesor = (a.sucesor || "").trim();
    const bSucesor = (b.sucesor || "").trim();
    if (aSucesor === "" && bSucesor !== "") return -1;
    if (aSucesor !== "" && bSucesor === "") return 1;
    return 0;
  });
}


// Validar si un sucesor ya está asignado a otro puesto
export async function validarSucesorUnico(sucesor: string, sucesionPuestoIdActual?: number): Promise<{ valido: boolean; puestoExistente?: string; departamentoExistente?: string }> {
  if (!sucesor || sucesor.trim() === "") {
    return { valido: true }; // Sucesor vacío es válido
  }

  const db = await getDb();
  if (!db) return { valido: true };

  try {
    const sucesoresExistentes = await db
      .select()
      .from(sucesionPuestos)
      .where(eq(sucesionPuestos.sucesor, sucesor.trim()));

    // Filtrar el registro actual si se proporciona el ID
    const otrosSucesores = sucesoresExistentes.filter(s => s.id !== sucesionPuestoIdActual);

    if (otrosSucesores.length > 0) {
      return {
        valido: false,
        puestoExistente: otrosSucesores[0].puestoClave,
        departamentoExistente: otrosSucesores[0].departamentoPuestoClave
      };
    }

    return { valido: true };
  } catch (error) {
    console.error("[Database] Error validating successor uniqueness:", error);
    return { valido: true }; // En caso de error, permitir
  }
}

// Obtener todos los sucesores asignados
export async function obtenerSucesoresAsignados(): Promise<Array<{ sucesor: string; puestoClave: string; departamento: string }>> {
  const db = await getDb();
  if (!db) return [];

  try {
    const sucesores = await db
      .select({
        sucesor: sucesionPuestos.sucesor,
        puestoClave: sucesionPuestos.puestoClave,
        departamento: sucesionPuestos.departamentoPuestoClave
      })
      .from(sucesionPuestos)
      .where(ne(sucesionPuestos.sucesor, ""));

    return sucesores;
  } catch (error) {
    console.error("[Database] Error getting assigned successors:", error);
    return [];
  }
}


// Obtener historial de cambios de sucesores
export async function obtenerHistorialSucesores() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not initialized");
    
    const { desc } = await import("drizzle-orm");
    const historial = await db
      .select()
      .from(historialSucesores)
      .orderBy(desc(historialSucesores.createdAt))
      .limit(1000);
    
    return historial;
  } catch (error) {
    console.error("Error al obtener historial de sucesores:", error);
    throw new Error("No se pudo obtener el historial de sucesores");
  }
}


// Buscar datos del sucesor (cargo y departamento) desde tabla empleados
export async function buscarDatosSucesor(nombreSucesor: string): Promise<{ cargo: string | null; departamento: string | null }> {
  const db = await getDb();
  if (!db) return { cargo: null, departamento: null };

  try {
    const sucesor = await db
      .select({
        cargo: empleados.cargo,
        departamento: empleados.departamento
      })
      .from(empleados)
      .where(sql`LOWER(TRIM(${empleados.nombre})) = LOWER(TRIM(${nombreSucesor}))`);

    if (sucesor.length > 0) {
      return {
        cargo: sucesor[0].cargo || null,
        departamento: sucesor[0].departamento || null
      };
    }

    return { cargo: null, departamento: null };
  } catch (error) {
    console.error("[Database] Error searching successor data:", error);
    return { cargo: null, departamento: null };
  }
}

// Actualizar sucesor con validación e llenado automático de datos
export async function actualizarSucesor(sucesionPuestoId: number, nuevoSucesor: string, usuario: string): Promise<SucesionPuesto | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Buscar datos del sucesor
    const datosSucesor = await buscarDatosSucesor(nuevoSucesor);

    // Actualizar registro con datos del sucesor
    await db
      .update(sucesionPuestos)
      .set({
        sucesor: nuevoSucesor,
        cargoSucesor: datosSucesor.cargo || "",
        departamentoSucesor: datosSucesor.departamento || "",
        usuario: usuario,
      })
      .where(eq(sucesionPuestos.id, sucesionPuestoId));

    // Obtener el registro actualizado
    const registroActual = await db
      .select()
      .from(sucesionPuestos)
      .where(eq(sucesionPuestos.id, sucesionPuestoId));

    if (registroActual.length > 0) {
      // Registrar en historial
      await db.insert(historialSucesores).values({
        sucesionPuestoId: sucesionPuestoId,
        sucesorAnterior: registroActual[0].sucesor || "",
        sucesorNuevo: nuevoSucesor,
        usuario: usuario,
      });

      return registroActual[0];
    }

    return null;
  } catch (error) {
    console.error("[Database] Error updating successor:", error);
    return null;
  }
}
