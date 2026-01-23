import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb, planesAccion, seguimientoPlanes } from "./db";
import { eq } from "drizzle-orm";

const db = getDb();

describe("Evidencias - Upload and Download", () => {
  let planAccionId: number;

  beforeAll(async () => {
    // Crear un plan de acción de prueba
    const result = await db
      .insert(planesAccion)
      .values({
        planSuccesionId: 1,
        titulo: "Test Plan Acción",
        descripcion: "Plan de acción para pruebas",
        responsable: "Test User",
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        estado: "No Iniciado",
        progreso: 0,
      })
      .returning({ id: planesAccion.id });

    planAccionId = result[0].id;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await db.delete(seguimientoPlanes).where(eq(seguimientoPlanes.planAccionId, planAccionId));
    await db.delete(planesAccion).where(eq(planesAccion.id, planAccionId));
  });

  it("debería crear un seguimiento con evidencia", async () => {
    const seguimiento = await db
      .insert(seguimientoPlanes)
      .values({
        planAccionId,
        estado: "En Progreso",
        progreso: 50,
        archivoEvidencia: "https://s3.example.com/evidencias/test.pdf",
        comentario: "Test evidence upload",
        usuarioRegistro: "test-user",
      })
      .returning();

    expect(seguimiento).toHaveLength(1);
    expect(seguimiento[0].archivoEvidencia).toBe("https://s3.example.com/evidencias/test.pdf");
    expect(seguimiento[0].estado).toBe("En Progreso");
    expect(seguimiento[0].progreso).toBe(50);
  });

  it("debería obtener evidencias con archivos", async () => {
    // Crear múltiples seguimientos con evidencias
    await db
      .insert(seguimientoPlanes)
      .values([
        {
          planAccionId,
          estado: "En Progreso",
          progreso: 50,
          archivoEvidencia: "https://s3.example.com/evidencias/file1.pdf",
          comentario: "First evidence",
          usuarioRegistro: "user1",
        },
        {
          planAccionId,
          estado: "En Progreso",
          progreso: 60,
          archivoEvidencia: "https://s3.example.com/evidencias/file2.xlsx",
          comentario: "Second evidence",
          usuarioRegistro: "user2",
        },
      ]);

    // Obtener evidencias
    const evidencias = await db
      .select()
      .from(seguimientoPlanes)
      .where(eq(seguimientoPlanes.planAccionId, planAccionId));

    expect(evidencias.length).toBeGreaterThan(0);
    expect(evidencias.some((e) => e.archivoEvidencia)).toBe(true);
  });

  it("debería actualizar seguimiento con nueva evidencia", async () => {
    // Obtener el primer seguimiento
    const seguimientos = await db
      .select()
      .from(seguimientoPlanes)
      .where(eq(seguimientoPlanes.planAccionId, planAccionId))
      .limit(1);

    if (seguimientos.length === 0) {
      throw new Error("No seguimiento found");
    }

    const seguimientoId = seguimientos[0].id;

    // Actualizar con nueva evidencia
    const updated = await db
      .update(seguimientoPlanes)
      .set({
        archivoEvidencia: "https://s3.example.com/evidencias/updated.pdf",
        progreso: 75,
        estado: "Completado",
      })
      .where(eq(seguimientoPlanes.id, seguimientoId))
      .returning();

    expect(updated).toHaveLength(1);
    expect(updated[0].archivoEvidencia).toBe("https://s3.example.com/evidencias/updated.pdf");
    expect(updated[0].progreso).toBe(75);
    expect(updated[0].estado).toBe("Completado");
  });

  it("debería filtrar evidencias sin archivos", async () => {
    // Crear un seguimiento sin archivo
    await db.insert(seguimientoPlanes).values({
      planAccionId,
      estado: "No Iniciado",
      progreso: 0,
      comentario: "Sin evidencia",
      usuarioRegistro: "user3",
    });

    // Obtener solo evidencias con archivos
    const evidenciasConArchivos = await db
      .select()
      .from(seguimientoPlanes)
      .where(eq(seguimientoPlanes.planAccionId, planAccionId))
      .then((rows) => rows.filter((r) => r.archivoEvidencia));

    expect(evidenciasConArchivos.length).toBeGreaterThan(0);
    expect(evidenciasConArchivos.every((e) => e.archivoEvidencia)).toBe(true);
  });

  it("debería contar evidencias por plan de acción", async () => {
    const evidencias = await db
      .select()
      .from(seguimientoPlanes)
      .where(eq(seguimientoPlanes.planAccionId, planAccionId));

    expect(evidencias.length).toBeGreaterThan(0);
  });
});
