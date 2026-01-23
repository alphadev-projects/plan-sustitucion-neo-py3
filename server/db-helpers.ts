import { getDb } from "./db";
import { planesAccion, planesSuccesion } from "../drizzle/schema";
import { eq, lte, and } from "drizzle-orm";

/**
 * Obtener planes de acción próximos a vencer (en los próximos N días)
 */
export async function getPlanesProximosAVencer(diasAdelante: number = 3) {
  const db = await getDb();
  if (!db) return [];
  
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + diasAdelante);
  
  return db.select().from(planesAccion)
    .where(
      and(
        lte(planesAccion.fechaFin, fechaLimite),
        eq(planesAccion.estado, "En Progreso")
      )
    );
}

/**
 * Obtener planes de acción retrasados (vencidos y aún en progreso)
 */
export async function getPlanesRetrasados() {
  const db = await getDb();
  if (!db) return [];
  
  const hoy = new Date();
  
  return db.select().from(planesAccion)
    .where(
      and(
        lte(planesAccion.fechaFin, hoy),
        eq(planesAccion.estado, "En Progreso")
      )
    );
}

/**
 * Generar reporte CSV de riesgos por departamento
 */
export async function generarReporteRiesgosCSV() {
  const db = await getDb();
  if (!db) return "";
  
  const planesSuccesionData = await db.select().from(planesSuccesion);
  
  // Agrupar por departamento
  const porDepartamento: Record<string, any[]> = {};
  
  planesSuccesionData.forEach(plan => {
    if (!porDepartamento[plan.departamento]) {
      porDepartamento[plan.departamento] = [];
    }
    porDepartamento[plan.departamento].push(plan);
  });
  
  // Generar CSV
  let csv = "Departamento,Cargo,Colaborador,Riesgo Continuidad,Riesgo Crítico,Prioridad Sucesión\n";
  
  Object.entries(porDepartamento).forEach(([dept, planes]) => {
    planes.forEach(plan => {
      csv += `"${dept}","${plan.cargo}","${plan.colaborador}","${plan.riesgoContinuidad}","${plan.riesgoCritico}","${plan.prioridadSucesion}"\n`;
    });
  });
  
  return csv;
}

/**
 * Obtener resumen de planes por estado
 */
export async function getResumenPlanesPorEstado() {
  const db = await getDb();
  if (!db) return { noIniciados: 0, enProgreso: 0, completados: 0, retrasados: 0, total: 0 };
  
  const planes = await db.select().from(planesAccion);
  
  return {
    noIniciados: planes.filter(p => p.estado === "No Iniciado").length,
    enProgreso: planes.filter(p => p.estado === "En Progreso").length,
    completados: planes.filter(p => p.estado === "Completado").length,
    retrasados: planes.filter(p => p.estado === "Retrasado").length,
    total: planes.length,
  };
}

/**
 * Obtener alertas de planes (próximos a vencer + retrasados)
 */
export async function getAlertasPlanes() {
  const proximosAVencer = await getPlanesProximosAVencer(3);
  const retrasados = await getPlanesRetrasados();
  
  return {
    proximosAVencer: proximosAVencer.map(p => ({
      id: p.id,
      titulo: p.titulo,
      responsable: p.responsable,
      fechaFin: p.fechaFin,
      tipo: "PRÓXIMO_A_VENCER",
    })),
    retrasados: retrasados.map(p => ({
      id: p.id,
      titulo: p.titulo,
      responsable: p.responsable,
      fechaFin: p.fechaFin,
      tipo: "RETRASADO",
    })),
    total: proximosAVencer.length + retrasados.length,
  };
}


/**
 * Registrar cambio en auditoría de plan de acción
 */
export async function registrarCambioAuditoria(
  planAccionId: number,
  usuarioId: string,
  usuario: string,
  accion: string,
  campoModificado?: string,
  valorAnterior?: string,
  valorNuevo?: string,
  descripcion?: string
) {
  const db = await getDb();
  if (!db) return null;
  
  const { auditoriaPlanesAccion } = await import("../drizzle/schema");
  
  return db.insert(auditoriaPlanesAccion).values({
    planAccionId,
    usuarioId,
    usuario,
    accion: accion as any,
    campoModificado,
    valorAnterior,
    valorNuevo,
    descripcion,
  });
}

/**
 * Obtener historial de cambios de un plan de acción
 */
export async function obtenerHistorialPlanAccion(planAccionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { auditoriaPlanesAccion } = await import("../drizzle/schema");
  const { eq, desc } = await import("drizzle-orm");
  
  return db.select()
    .from(auditoriaPlanesAccion)
    .where(eq(auditoriaPlanesAccion.planAccionId, planAccionId))
    .orderBy(desc(auditoriaPlanesAccion.createdAt));
}

/**
 * Obtener resumen de actividad por usuario
 */
export async function obtenerActividadPorUsuario(diasAtras: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const { auditoriaPlanesAccion } = await import("../drizzle/schema");
  const { gte } = await import("drizzle-orm");
  
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - diasAtras);
  
  return db.select()
    .from(auditoriaPlanesAccion)
    .where(gte(auditoriaPlanesAccion.createdAt, fechaLimite));
}


/**
 * Obtener auditoría con filtros
 */
export async function obtenerAuditoriaConFiltros(
  usuarioFilter?: string,
  accionFilter?: string,
  planAccionIdFilter?: number,
  fechaInicio?: string,
  fechaFin?: string
) {
  const db = await getDb();
  if (!db) return [];
  
  const { auditoriaPlanesAccion } = await import("../drizzle/schema");
  const { and, eq, gte, lte, desc } = await import("drizzle-orm");
  
  const condiciones = [];
  
  if (usuarioFilter) {
    condiciones.push(eq(auditoriaPlanesAccion.usuario, usuarioFilter));
  }
  
  if (accionFilter) {
    condiciones.push(eq(auditoriaPlanesAccion.accion, accionFilter as any));
  }
  
  if (planAccionIdFilter) {
    condiciones.push(eq(auditoriaPlanesAccion.planAccionId, planAccionIdFilter));
  }
  
  if (fechaInicio) {
    const fecha = new Date(fechaInicio);
    condiciones.push(gte(auditoriaPlanesAccion.createdAt, fecha));
  }
  
  if (fechaFin) {
    const fecha = new Date(fechaFin);
    fecha.setHours(23, 59, 59, 999);
    condiciones.push(lte(auditoriaPlanesAccion.createdAt, fecha));
  }
  
  // Si no hay condiciones, retornar todos los registros
  // Si hay condiciones, aplicarlas con AND
  if (condiciones.length > 0) {
    return db.select()
      .from(auditoriaPlanesAccion)
      .where(and(...condiciones))
      .orderBy(desc(auditoriaPlanesAccion.createdAt))
      .limit(1000);
  } else {
    return db.select()
      .from(auditoriaPlanesAccion)
      .orderBy(desc(auditoriaPlanesAccion.createdAt))
      .limit(1000);
  }
}
