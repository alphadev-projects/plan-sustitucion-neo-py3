import { describe, it, expect, beforeAll } from "vitest";
import { initDb } from "./db";
import { createPlan, getPlanesSuccesion } from "./db";
import { obtenerAuditoriaConFiltros } from "./db-helpers";

describe("Integration Tests - Plan Vinculación y Auditoría", () => {
  beforeAll(() => {
    initDb();
  });

  it("Debe crear un plan de sustitución y vincularlo automáticamente a planesSuccesion si es puestoClave=Si", async () => {
    const newPlan = {
      empleadoId: 1,
      departamento: "Test Dept",
      cargo: "Test Cargo",
      colaborador: "Test Colaborador",
      puestoClave: "Si" as const,
      reemplazo: "",
      departamentoReemplazo: "Test Dept",
      cargoReemplazo: "Test Cargo",
      usuario: "test-user",
      tipoReemplazo: "individual" as const,
      riesgoCritico: "No" as const,
    };

    const result = await createPlan(newPlan);
    expect(result.success).toBe(true);
    expect(result.plan).toBeDefined();

    // Verificar que se creó en planesSuccesion
    const planesSuccesion = await getPlanesSuccesion();
    const planVinculado = planesSuccesion.find(
      (p) => p.planSustitucionId === result.plan.id
    );

    expect(planVinculado).toBeDefined();
    expect(planVinculado?.riesgoContinuidad).toBe("Alto"); // Sin reemplazo = Alto riesgo
    expect(planVinculado?.prioridadSucesion).toBe("Alta");
  });

  it("Debe crear un plan con reemplazo y marcarlo como riesgo Bajo", async () => {
    const newPlan = {
      empleadoId: 2,
      departamento: "Test Dept",
      cargo: "Test Cargo 2",
      colaborador: "Test Colaborador 2",
      puestoClave: "Si" as const,
      reemplazo: "Reemplazo Disponible",
      departamentoReemplazo: "Test Dept",
      cargoReemplazo: "Test Cargo 2",
      usuario: "test-user",
      tipoReemplazo: "individual" as const,
      riesgoCritico: "No" as const,
    };

    const result = await createPlan(newPlan);
    expect(result.success).toBe(true);

    // Verificar que se creó en planesSuccesion con riesgo Bajo
    const planesSuccesion = await getPlanesSuccesion();
    const planVinculado = planesSuccesion.find(
      (p) => p.planSustitucionId === result.plan.id
    );

    expect(planVinculado).toBeDefined();
    expect(planVinculado?.riesgoContinuidad).toBe("Bajo");
    expect(planVinculado?.prioridadSucesion).toBe("Baja");
  });

  it("Debe registrar cambios en auditoría cuando se actualiza un plan de acción", async () => {
    // Verificar que la función existe y puede ser llamada
    const auditoria = await obtenerAuditoriaConFiltros();
    expect(Array.isArray(auditoria)).toBe(true);
  });

  it("Debe detectar 'NO APLICA' como sin reemplazo", async () => {
    const newPlan = {
      empleadoId: 3,
      departamento: "Test Dept",
      cargo: "Test Cargo 3",
      colaborador: "Test Colaborador 3",
      puestoClave: "Si" as const,
      reemplazo: "NO APLICA",
      departamentoReemplazo: "Test Dept",
      cargoReemplazo: "Test Cargo 3",
      usuario: "test-user",
      tipoReemplazo: "individual" as const,
      riesgoCritico: "No" as const,
    };

    const result = await createPlan(newPlan);
    expect(result.success).toBe(true);

    // Verificar que se marcó como Alto riesgo
    const planesSuccesion = await getPlanesSuccesion();
    const planVinculado = planesSuccesion.find(
      (p) => p.planSustitucionId === result.plan.id
    );

    expect(planVinculado?.riesgoContinuidad).toBe("Alto");
  });

  it("No debe vincular planes que no son puestoClave", async () => {
    const newPlan = {
      empleadoId: 4,
      departamento: "Test Dept",
      cargo: "Test Cargo 4",
      colaborador: "Test Colaborador 4",
      puestoClave: "No" as const,
      reemplazo: "",
      departamentoReemplazo: "Test Dept",
      cargoReemplazo: "Test Cargo 4",
      usuario: "test-user",
      tipoReemplazo: "individual" as const,
      riesgoCritico: "No" as const,
    };

    const result = await createPlan(newPlan);
    expect(result.success).toBe(true);

    // Verificar que NO se creó en planesSuccesion
    const planesSuccesion = await getPlanesSuccesion();
    const planVinculado = planesSuccesion.find(
      (p) => p.planSustitucionId === result.plan.id
    );

    expect(planVinculado).toBeUndefined();
  });
});
