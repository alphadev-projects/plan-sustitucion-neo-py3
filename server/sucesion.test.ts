import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { updatePlanSuccesionRiesgo, getPlanesSuccesion } from "./db";

describe("Plan de Sucesión - Actualización de Riesgo", () => {
  let planId: number;

  beforeAll(async () => {
    // Obtener el primer plan de sucesión para usar en las pruebas
    const planes = await getPlanesSuccesion();
    if (planes.length > 0) {
      planId = planes[0].id;
    }
  });

  it("debería actualizar el riesgo de continuidad de Alto a Bajo", async () => {
    if (!planId) {
      console.log("No hay planes de sucesión para probar");
      return;
    }

    const resultado = await updatePlanSuccesionRiesgo(
      planId,
      "Bajo",
      "Plan de acción concluido"
    );

    expect(resultado).toBeDefined();
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado[0].riesgoContinuidad).toBe("Bajo");
  });

  it("debería actualizar el riesgo de continuidad de Bajo a Medio", async () => {
    if (!planId) {
      console.log("No hay planes de sucesión para probar");
      return;
    }

    const resultado = await updatePlanSuccesionRiesgo(
      planId,
      "Medio",
      "Cambio de evaluación"
    );

    expect(resultado).toBeDefined();
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado[0].riesgoContinuidad).toBe("Medio");
  });

  it("debería actualizar el riesgo de continuidad de Medio a Alto", async () => {
    if (!planId) {
      console.log("No hay planes de sucesión para probar");
      return;
    }

    const resultado = await updatePlanSuccesionRiesgo(
      planId,
      "Alto",
      "Reemplazo no disponible"
    );

    expect(resultado).toBeDefined();
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado[0].riesgoContinuidad).toBe("Alto");
  });

  it("debería permitir actualizar sin motivo", async () => {
    if (!planId) {
      console.log("No hay planes de sucesión para probar");
      return;
    }

    const resultado = await updatePlanSuccesionRiesgo(planId, "Bajo");

    expect(resultado).toBeDefined();
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado[0].riesgoContinuidad).toBe("Bajo");
  });

  it("debería lanzar error si el plan no existe", async () => {
    try {
      await updatePlanSuccesionRiesgo(99999, "Bajo", "Prueba");
      expect.fail("Debería haber lanzado un error");
    } catch (error: any) {
      expect(error.message).toContain("Plan de sucesión no encontrado");
    }
  });
});
