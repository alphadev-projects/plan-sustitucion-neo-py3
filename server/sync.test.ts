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

  it("Debe sincronizar y tener exactamente 37 puestos con riesgo Alto", async () => {
    await syncMissingPlanes();
    
    const planes = await getPlanesSuccesion();
    
    // Verificar que hay puestos con riesgo Alto y Bajo
    const altoRiesgo = planes.filter(p => p.riesgoContinuidad === "Alto");
    const bajoRiesgo = planes.filter(p => p.riesgoContinuidad === "Bajo");
    
    // Verificar que hay exactamente 37 alto riesgo
    expect(altoRiesgo.length).toBe(37);
    // Verificar que el total es consistente
    expect(planes.length).toBe(altoRiesgo.length + bajoRiesgo.length);
    
    console.log(`Total planes: ${planes.length}, Alto riesgo: ${altoRiesgo.length}, Bajo riesgo: ${bajoRiesgo.length}`);
    console.log(`Proporción: ${altoRiesgo.length} Alto + ${bajoRiesgo.length} Bajo = ${planes.length} Total`);
  });
});
