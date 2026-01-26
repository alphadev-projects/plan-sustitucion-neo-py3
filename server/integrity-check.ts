import { getDb } from "./db";
import { planesSuccesion, planesSustitucion } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Verifica y limpia registros huérfanos en planesSuccesion
 * Retorna el número de registros eliminados
 */
export async function cleanOrphanedRecords(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Encontrar registros huérfanos
  const orphaned = await db
    .select({ id: planesSuccesion.id })
    .from(planesSuccesion)
    .where(
      sql`${planesSuccesion.planSustitucionId} NOT IN (SELECT ${planesSustitucion.id} FROM ${planesSustitucion})`
    );

  if (orphaned.length === 0) {
    return 0;
  }

  // Eliminar registros huérfanos
  const orphanIds = orphaned.map((o) => o.id);
  await db
    .delete(planesSuccesion)
    .where(
      sql`${planesSuccesion.planSustitucionId} NOT IN (SELECT ${planesSustitucion.id} FROM ${planesSustitucion})`
    );

  return orphanIds.length;
}

/**
 * Valida que un registro en planesSuccesion tiene su correspondiente en planesSustitucion
 */
export async function validatePlanSuccesionIntegrity(
  planSuccesionId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const planSuccesion = await db
    .select()
    .from(planesSuccesion)
    .where(eq(planesSuccesion.id, planSuccesionId));

  if (planSuccesion.length === 0) {
    return false;
  }

  const planSustitucion = await db
    .select()
    .from(planesSustitucion)
    .where(eq(planesSustitucion.id, planSuccesion[0].planSustitucionId));

  return planSustitucion.length > 0;
}

/**
 * Retorna el número de registros huérfanos en planesSuccesion
 */
export async function countOrphanedRecords(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const orphaned = await db
    .select({ id: planesSuccesion.id })
    .from(planesSuccesion)
    .where(
      sql`${planesSuccesion.planSustitucionId} NOT IN (SELECT ${planesSustitucion.id} FROM ${planesSustitucion})`
    );

  return orphaned.length;
}
