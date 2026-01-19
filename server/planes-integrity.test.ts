import { describe, it, expect, beforeAll } from "vitest";
import { initDb } from "./db";
import { validatePlanIntegrity } from "./db";
import { drizzle } from "drizzle-orm/mysql2";
import { empleados, planesSustitucion } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Plan Integrity Validation", () => {
  let db: ReturnType<typeof drizzle>;

  beforeAll(async () => {
    // Inicializar DB para tests
    db = initDb()!;
    if (!db) {
      throw new Error("Database not available for tests");
    }
  });

  it("should detect when a collaborator is missing from payroll", async () => {
    // Crear un empleado
    const empleadoResult = await db.insert(empleados).values({
      sede: "Sede Principal",
      cedula: "99887766",
      nombre: "Juan Pérez",
      area: "Desarrollo",
      departamento: "Tecnología",
      cargo: "Supervisor",
    });

    const empleadoId = empleadoResult[0].insertId;

    // Crear un plan con ese empleado
    const planResult = await db.insert(planesSustitucion).values({
      empleadoId: empleadoId,
      departamento: "Tecnología",
      colaborador: "Juan Pérez",
      cargo: "Supervisor",
      departamentoReemplazo: "Tecnología",
      reemplazo: "María García",
      cargoReemplazo: "Supervisor",
      tipoReemplazo: "individual",
      puestoClave: "Si",
      usuario: "test_user",
    });

    const planId = planResult[0].insertId;

    // Eliminar el empleado
    await db.delete(empleados).where(eq(empleados.id, empleadoId));

    // Validar integridad
    const issues = await validatePlanIntegrity();

    // Debe detectar que el empleado falta
    const missingIssue = issues.find(
      (issue) => issue.planId === planId && issue.issue === "missing_employee"
    );
    expect(missingIssue).toBeDefined();
    expect(missingIssue?.message).toContain("ya no se encuentra en la nómina");

    // Limpiar
    await db.delete(planesSustitucion).where(eq(planesSustitucion.id, planId));
  });

  it("should detect when a collaborator's cargo has changed", async () => {
    // Crear un empleado
    const empleadoResult = await db.insert(empleados).values({
      sede: "Sede Principal",
      cedula: "98765432",
      nombre: "Carlos López",
      area: "Recursos Humanos",
      departamento: "RRHH",
      cargo: "Gerente",
    });

    const empleadoId = empleadoResult[0].insertId;

    // Crear un plan con cargo original
    const planResult = await db.insert(planesSustitucion).values({
      empleadoId: empleadoId,
      departamento: "RRHH",
      colaborador: "Carlos López",
      cargo: "Gerente",
      departamentoReemplazo: "RRHH",
      reemplazo: "Ana Martínez",
      cargoReemplazo: "Gerente",
      tipoReemplazo: "individual",
      puestoClave: "No",
      usuario: "test_user",
    });

    const planId = planResult[0].insertId;

    // Cambiar el cargo del empleado
    await db
      .update(empleados)
      .set({ cargo: "Especialista" })
      .where(eq(empleados.id, empleadoId));

    // Validar integridad
    const issues = await validatePlanIntegrity();

    // Debe detectar que el cargo cambió
    const cargoIssue = issues.find(
      (issue) => issue.planId === planId && issue.issue === "changed_cargo"
    );
    expect(cargoIssue).toBeDefined();
    expect(cargoIssue?.message).toContain("cambió de");
    expect(cargoIssue?.message).toContain("Gerente");
    expect(cargoIssue?.message).toContain("Especialista");

    // Limpiar
    await db.delete(planesSustitucion).where(eq(planesSustitucion.id, planId));
    await db.delete(empleados).where(eq(empleados.id, empleadoId));
  });

  it("should detect when a collaborator's departamento has changed", async () => {
    // Crear un empleado
    const empleadoResult = await db.insert(empleados).values({
      sede: "Sede Principal",
      cedula: "44332211",
      nombre: "Patricia Ruiz",
      area: "Finanzas",
      departamento: "Contabilidad",
      cargo: "Contador",
    });

    const empleadoId = empleadoResult[0].insertId;

    // Crear un plan con departamento original
    const planResult = await db.insert(planesSustitucion).values({
      empleadoId: empleadoId,
      departamento: "Contabilidad",
      colaborador: "Patricia Ruiz",
      cargo: "Contador",
      departamentoReemplazo: "Contabilidad",
      reemplazo: "Roberto Díaz",
      cargoReemplazo: "Contador",
      tipoReemplazo: "individual",
      puestoClave: "Si",
      usuario: "test_user",
    });

    const planId = planResult[0].insertId;

    // Cambiar el departamento del empleado
    await db
      .update(empleados)
      .set({ departamento: "Tesorería" })
      .where(eq(empleados.id, empleadoId));

    // Validar integridad
    const issues = await validatePlanIntegrity();

    // Debe detectar que el departamento cambió
    const deptIssue = issues.find(
      (issue) =>
        issue.planId === planId && issue.issue === "changed_departamento"
    );
    expect(deptIssue).toBeDefined();
    expect(deptIssue?.message).toContain("cambió de");
    expect(deptIssue?.message).toContain("Contabilidad");
    expect(deptIssue?.message).toContain("Tesorería");

    // Limpiar
    await db.delete(planesSustitucion).where(eq(planesSustitucion.id, planId));
    await db.delete(empleados).where(eq(empleados.id, empleadoId));
  });

  it("should not report issues for valid plans", async () => {
    // Crear un empleado
    const empleadoResult = await db.insert(empleados).values({
      sede: "Sede Principal",
      cedula: "88776655",
      nombre: "Laura Fernández",
      area: "Marketing",
      departamento: "Marketing",
      cargo: "Coordinadora",
    });

    const empleadoId = empleadoResult[0].insertId;

    // Crear un plan válido
    const planResult = await db.insert(planesSustitucion).values({
      empleadoId: empleadoId,
      departamento: "Marketing",
      colaborador: "Laura Fernández",
      cargo: "Coordinadora",
      departamentoReemplazo: "Marketing",
      reemplazo: "Diego Sánchez",
      cargoReemplazo: "Coordinadora",
      tipoReemplazo: "individual",
      puestoClave: "No",
      usuario: "test_user",
    });

    const planId = planResult[0].insertId;

    // Validar integridad
    const issues = await validatePlanIntegrity();

    // No debe haber problemas para este plan
    const planIssues = issues.filter((issue) => issue.planId === planId);
    expect(planIssues.length).toBe(0);

    // Limpiar
    await db.delete(planesSustitucion).where(eq(planesSustitucion.id, planId));
    await db.delete(empleados).where(eq(empleados.id, empleadoId));
  });
});
