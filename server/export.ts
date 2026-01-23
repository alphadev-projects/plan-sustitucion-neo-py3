import { PlanSuccesion } from "../drizzle/schema";

/**
 * Convierte un array de planes de sucesión a formato CSV
 * Incluye solo los puestos críticos (riesgo Alto)
 */
export function planesSuccesionToCSV(planes: any[]): string {
  // Filtrar solo los puestos críticos (riesgo Alto)
  const planesCriticos = planes.filter(p => p.riesgoContinuidad === "Alto");
  
  if (planesCriticos.length === 0) {
    return "No hay puestos críticos para exportar";
  }

  // Headers del CSV
  const headers = [
    "Departamento",
    "Cargo",
    "Colaborador",
    "Reemplazo",
    "Riesgo de Continuidad",
    "Prioridad de Sucesión",
    "Estado",
    "Fecha de Registro",
    "Última Actualización"
  ];

  // Convertir datos a filas CSV
  const rows = planesCriticos.map(plan => [
    escaparCSV(plan.departamento),
    escaparCSV(plan.cargo),
    escaparCSV(plan.colaborador),
    escaparCSV(plan.reemplazo || "Sin asignar"),
    plan.riesgoContinuidad,
    plan.prioridadSucesion,
    plan.estado,
    formatearFecha(plan.createdAt),
    formatearFecha(plan.updatedAt)
  ]);

  // Combinar headers y rows
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  return csvContent;
}

/**
 * Convierte un array de planes de sucesión a formato Excel (como CSV con formato especial)
 * Retorna datos formateados para descarga
 */
export function planesSuccesionToExcel(planes: any[]): {
  csv: string;
  filename: string;
} {
  const csv = planesSuccesionToCSV(planes);
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `reporte-riesgos-${timestamp}.csv`;
  
  return { csv, filename };
}

/**
 * Escapa caracteres especiales en CSV
 */
function escaparCSV(valor: string): string {
  if (!valor) return "";
  
  // Si contiene comas, comillas o saltos de línea, envolver en comillas
  if (valor.includes(",") || valor.includes('"') || valor.includes("\n")) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  
  return valor;
}

/**
 * Formatea una fecha para mostrar en CSV
 */
function formatearFecha(fecha: Date | null): string {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-UY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Genera un reporte detallado de riesgos con estadísticas
 */
export function generarReporteRiesgos(planes: any[]): {
  resumen: {
    totalPuestos: number;
    puestosCriticos: number;
    puestosConRiesgo: number;
    puestosControlados: number;
    porcentajeCriticidad: number;
  };
  detalles: any[];
  csv: string;
} {
  const planesCriticos = planes.filter(p => p.riesgoContinuidad === "Alto");
  const puestosConRiesgo = planes.filter(p => p.riesgoContinuidad === "Medio");
  const puestosControlados = planes.filter(p => p.riesgoContinuidad === "Bajo");

  return {
    resumen: {
      totalPuestos: planes.length,
      puestosCriticos: planesCriticos.length,
      puestosConRiesgo: puestosConRiesgo.length,
      puestosControlados: puestosControlados.length,
      porcentajeCriticidad: planes.length > 0 
        ? Math.round((planesCriticos.length / planes.length) * 100)
        : 0
    },
    detalles: planesCriticos,
    csv: planesSuccesionToCSV(planes)
  };
}
