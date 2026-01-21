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
