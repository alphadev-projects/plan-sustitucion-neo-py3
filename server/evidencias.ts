import { eq, and, sql } from "drizzle-orm";
import { getDb } from "./db";
import { planesAccion, seguimientoPlanes } from "../drizzle/schema";

/**
 * Interfaz para datos de evidencia
 */
export interface EvidenciaData {
  id: number;
  planAccionId: number;
  titulo: string;
  estado: string;
  progreso: number;
  evidencia?: string;
  archivoEvidencia?: string;
  comentario?: string;
  validadoPor?: string;
  fechaValidacion?: Date;
  createdAt: Date;
}

/**
 * Obtiene todas las evidencias de un plan de acción específico
 */
export async function obtenerEvidenciasPlanAccion(planAccionId: number): Promise<EvidenciaData[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Evidencias] Database not available");
    return [];
  }

  try {
    const seguimientos = await db
      .select()
      .from(seguimientoPlanes)
      .where(eq(seguimientoPlanes.planAccionId, planAccionId));

    return seguimientos.map((seg) => ({
      id: seg.id,
      planAccionId: seg.planAccionId,
      titulo: `Seguimiento #${seg.id}`,
      estado: seg.estado,
      progreso: seg.progreso,
      evidencia: seg.evidencia || undefined,
      archivoEvidencia: seg.archivoEvidencia || undefined,
      comentario: seg.comentario || undefined,
      validadoPor: seg.validadoPor || undefined,
      fechaValidacion: seg.fechaValidacion || undefined,
      createdAt: seg.createdAt,
    }));
  } catch (error) {
    console.error("[Evidencias] Error fetching evidencias:", error);
    return [];
  }
}

/**
 * Obtiene una evidencia específica con su URL de descarga
 */
export async function obtenerEvidenciaConURL(
  planAccionId: number,
  seguimientoId: number
): Promise<EvidenciaData | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Evidencias] Database not available");
    return null;
  }

  try {
    const seguimiento = await db
      .select()
      .from(seguimientoPlanes)
      .where(
        and(
          eq(seguimientoPlanes.id, seguimientoId),
          eq(seguimientoPlanes.planAccionId, planAccionId)
        )
      )
      .limit(1);

    if (seguimiento.length === 0) {
      return null;
    }

    const seg = seguimiento[0];
    return {
      id: seg.id,
      planAccionId: seg.planAccionId,
      titulo: `Seguimiento #${seg.id}`,
      estado: seg.estado,
      progreso: seg.progreso,
      evidencia: seg.evidencia || undefined,
      archivoEvidencia: seg.archivoEvidencia || undefined,
      comentario: seg.comentario || undefined,
      validadoPor: seg.validadoPor || undefined,
      fechaValidacion: seg.fechaValidacion || undefined,
      createdAt: seg.createdAt,
    };
  } catch (error) {
    console.error("[Evidencias] Error fetching evidencia:", error);
    return null;
  }
}

/**
 * Obtiene información del plan de acción para contexto
 */
export async function obtenerPlanAccionInfo(planAccionId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Evidencias] Database not available");
    return null;
  }

  try {
    const plan = await db
      .select()
      .from(planesAccion)
      .where(eq(planesAccion.id, planAccionId))
      .limit(1);

    if (plan.length === 0) {
      return null;
    }

    return plan[0];
  } catch (error) {
    console.error("[Evidencias] Error fetching plan accion:", error);
    return null;
  }
}

/**
 * Obtiene todas las evidencias con información del plan de acción
 */
export async function obtenerEvidenciasCompletas(planAccionId: number) {
  const [evidencias, planInfo] = await Promise.all([
    obtenerEvidenciasPlanAccion(planAccionId),
    obtenerPlanAccionInfo(planAccionId),
  ]);

  return {
    planInfo,
    evidencias,
  };
}

/**
 * Cuenta el número de evidencias cargadas para un plan de acción
 */
export async function contarEvidencias(planAccionId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Evidencias] Database not available");
    return 0;
  }

  try {
    const result = await db
      .select({ count: sql<number>`COUNT(*) as count` })
      .from(seguimientoPlanes)
      .where(eq(seguimientoPlanes.planAccionId, planAccionId));

    return (result[0]?.count as number) || 0;
  } catch (error) {
    console.error("[Evidencias] Error counting evidencias:", error);
    return 0;
  }
}

/**
 * Obtiene evidencias con archivos (solo las que tienen archivo)
 */
export async function obtenerEvidenciasConArchivos(planAccionId: number): Promise<EvidenciaData[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Evidencias] Database not available");
    return [];
  }

  try {
    const seguimientos = await db
      .select()
      .from(seguimientoPlanes)
      .where(
        and(
          eq(seguimientoPlanes.planAccionId, planAccionId),
          sql`archivoEvidencia IS NOT NULL AND archivoEvidencia != ''`
        )
      );

    return seguimientos.map((seg) => ({
      id: seg.id,
      planAccionId: seg.planAccionId,
      titulo: `Seguimiento #${seg.id}`,
      estado: seg.estado,
      progreso: seg.progreso,
      evidencia: seg.evidencia || undefined,
      archivoEvidencia: seg.archivoEvidencia || undefined,
      comentario: seg.comentario || undefined,
      validadoPor: seg.validadoPor || undefined,
      fechaValidacion: seg.fechaValidacion || undefined,
      createdAt: seg.createdAt,
    }));
  } catch (error) {
    console.error("[Evidencias] Error fetching evidencias con archivos:", error);
    return [];
  }
}

/**
 * Obtiene el nombre del archivo a partir de la URL de S3
 */
export function extraerNombreArchivo(urlS3: string): string {
  try {
    // Extraer el nombre del archivo de la URL
    const url = new URL(urlS3);
    const pathname = url.pathname;
    const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
    return decodeURIComponent(filename) || "archivo";
  } catch {
    return "archivo";
  }
}

/**
 * Genera un nombre descriptivo para la descarga
 */
export function generarNombreDescarga(
  planAccionTitulo: string,
  seguimientoId: number,
  nombreOriginal: string
): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const sanitized = planAccionTitulo.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 30);
  return `${sanitized}_seguimiento_${seguimientoId}_${timestamp}_${nombreOriginal}`;
}
