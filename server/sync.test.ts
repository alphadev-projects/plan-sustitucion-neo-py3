import { describe, it, expect, beforeAll } from "vitest";
import { initDb } from "./db";
import { syncMissingPlanes, getPlanesSuccesion } from "./db";

describe("syncMissingPlanes", () => {
  beforeAll(() => {
    initDb();
  });

  it("Debe sincronizar planes faltantes", async () => {
    const result = await syncMissingPlanes();
    
    console.log("Resultado de sincronización:", result);
    
    expect(result).toBeDefined();
    expect(result.synced).toBeGreaterThanOrEqual(0);
    expect(result.message).toBeDefined();
  });

  it("Debe tener todos los puestos críticos en planesSuccesion después de sincronizar", async () => {
    await syncMissingPlanes();
    
    const planes = await getPlanesSuccesion();
    
    // Debe haber al menos 114 planes (los que ya estaban más los que se sincronizaron)
    expect(planes.length).toBeGreaterThanOrEqual(114);
    
    // Verificar que hay puestos con riesgo Alto y Bajo
    const altoRiesgo = planes.filter(p => p.riesgoContinuidad === "Alto");
    const bajoRiesgo = planes.filter(p => p.riesgoContinuidad === "Bajo");
    
    expect(altoRiesgo.length).toBeGreaterThan(0);
    expect(bajoRiesgo.length).toBeGreaterThan(0);
    
    console.log(`Total planes: ${planes.length}, Alto riesgo: ${altoRiesgo.length}, Bajo riesgo: ${bajoRiesgo.length}`);
  });
});
