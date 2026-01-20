import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, gte, lte, ne, sql } from "drizzle-orm";
import { InsertUser, users, empleados, planesSustitucion, InsertPlanSustitucion, PlanSustitucion, planesSuccesion, planesAccion, seguimientoPlanes, InsertSeguimientoPlan, SeguimientoPlan } from "../drizzle/schema";
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
  
  return { success: true, plan: planWithRisk };
}

export async function updatePlan(id: number, plan: Partial<InsertPlanSustitucion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(planesSustitucion).set(plan).where(eq(planesSustitucion.id, id));
}

export async function deletePlan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(planesSustitucion).where(eq(planesSustitucion.id, id));
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
  
  let planes = await db.select().from(planesSuccesion);
  
  if (planes.length === 0) {
    const planesData = await db.select().from(planesSustitucion);
    
    for (const plan of planesData) {
      try {
        await db.insert(planesSuccesion).values({
          planSustitucionId: plan.id,
          departamento: plan.departamento,
          cargo: plan.cargo,
          colaborador: plan.colaborador,
          riesgoContinuidad: plan.riesgoContinuidad || "Bajo",
          riesgoCritico: plan.riesgoCritico || "No",
          prioridadSucesion: plan.prioridadSucesion || "Baja",
          estado: "Pendiente",
          usuario: "sistema",
        });
      } catch (e) {
        // Ignorar duplicados
      }
    }
    
    planes = await db.select().from(planesSuccesion);
  }
  
  return planes;
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

// Funciones para Planes de Acción
export async function createPlanAccion(data: InsertPlanAccion): Promise<PlanAccion> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(planesAccion).values(data);
  const plan = await db.select().from(planesAccion).where(eq(planesAccion.id, result[0].insertId)).limit(1);
  return plan[0]!;
}

export async function getPlanesAccionBySuccesion(planSuccesionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(planesAccion).where(eq(planesAccion.planSuccesionId, planSuccesionId));
}

export async function updatePlanAccion(id: number, data: Partial<InsertPlanAccion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(planesAccion).set(data).where(eq(planesAccion.id, id));
  return db.select().from(planesAccion).where(eq(planesAccion.id, id)).limit(1);
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
  
  const planesTotal = await db.select({ count: sql`COUNT(*)` }).from(planesSuccesion);
  const planesEnProgreso = await db.select({ count: sql`COUNT(*)` }).from(planesSuccesion).where(eq(planesSuccesion.estado, "En Progreso"));
  const planesCompletados = await db.select({ count: sql`COUNT(*)` }).from(planesSuccesion).where(eq(planesSuccesion.estado, "Completado"));
  const planesRetrasados = await db.select({ count: sql`COUNT(*)` }).from(planesAccion).where(eq(planesAccion.estado, "Retrasado"));
  
  // Planes de acción próximos a vencer (próximos 7 días)
  const hoy = new Date();
  const proximos7Dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const accionesProximas = await db.select().from(planesAccion).where(
    and(
      gte(planesAccion.fechaFin, hoy),
      lte(planesAccion.fechaFin, proximos7Dias),
      ne(planesAccion.estado, "Completado")
    )
  ).limit(10);
  
  return {
    planesTotal: Number(planesTotal[0]?.count || 0),
    planesEnProgreso: Number(planesEnProgreso[0]?.count || 0),
    planesCompletados: Number(planesCompletados[0]?.count || 0),
    planesRetrasados: Number(planesRetrasados[0]?.count || 0),
    accionesProximas,
  };
}

export async function getResumenPorDepartamento() {
  const db = await getDb();
  if (!db) return [];
  
  const resumen = await db.select({
    departamento: planesSuccesion.departamento,
    total: sql`COUNT(*)`,
    criticos: sql`SUM(CASE WHEN riesgoCritico = 'Si' THEN 1 ELSE 0 END)`,
    completados: sql`SUM(CASE WHEN estado = 'Completado' THEN 1 ELSE 0 END)`,
  }).from(planesSuccesion).groupBy(planesSuccesion.departamento);
  
  return resumen;
}
