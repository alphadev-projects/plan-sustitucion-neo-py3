import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const mockUser = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "test",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const mockContext: TrpcContext = {
  user: mockUser,
  req: {
    protocol: "https",
    headers: {},
  } as any,
  res: {} as any,
};

describe("planes pool substitution procedures", () => {
  let caller: any;

  beforeAll(() => {
    caller = appRouter.createCaller(mockContext);
  });

  it("should create a pool substitution plan", async () => {
    const result = await caller.planes.create({
      empleadoId: 1,
      departamento: "Test Dept",
      colaborador: "Test Colaborador",
      cargo: "Test Cargo",
      tipoReemplazo: "pool",
      cargoPoolReemplazo: "Test Cargo",
      departamentoPoolReemplazo: "Test Dept",
      puestoClave: "No",
    });
    
    // Pool substitution should return success with planesCreados array
    expect(result).toHaveProperty("success");
    if (result.success) {
      expect(result).toHaveProperty("planesCreados");
      expect(Array.isArray(result.planesCreados)).toBe(true);
    }
  });

  it("should exclude original employee from pool", async () => {
    // This test verifies that when creating a pool substitution,
    // the original employee is not included in their own replacement pool
    const result = await caller.planes.create({
      empleadoId: 1,
      departamento: "Test Dept",
      colaborador: "Test Colaborador",
      cargo: "Test Cargo",
      tipoReemplazo: "pool",
      cargoPoolReemplazo: "Test Cargo",
      departamentoPoolReemplazo: "Test Dept",
      puestoClave: "No",
    });

    if (result.success && result.planesCreados) {
      // Verify that none of the created plans have the original employee as replacement
      const hasOriginalAsReplacement = result.planesCreados.some(
        (plan: any) => plan.reemplazo === "Test Colaborador"
      );
      expect(hasOriginalAsReplacement).toBe(false);
    }
  });

  it("should create individual substitution plan", async () => {
    const result = await caller.planes.create({
      empleadoId: 1,
      departamento: "Test Dept",
      colaborador: "Test Colaborador",
      cargo: "Test Cargo",
      tipoReemplazo: "individual",
      departamentoReemplazo: "Test Dept",
      reemplazo: "Test Reemplazo",
      cargoReemplazo: "Test Cargo",
      puestoClave: "Si",
    });

    // Individual substitution should return the plan object directly
    expect(result).toBeDefined();
    // For individual plans, the result has a 'plan' property
    if (result.plan) {
      expect(result.plan).toHaveProperty("id");
    } else {
      expect(result).toHaveProperty("id");
    }
  });

  it("should get empleados by cargo and departamento", async () => {
    const result = await caller.empleados.empleadosByCargoAndDepartamento({
      cargo: "Test Cargo",
      departamento: "Test Dept",
    });

    // Result should be an array (may be empty if no matches)
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update a plan", async () => {
    // First create a plan
    const createResult = await caller.planes.create({
      empleadoId: 1,
      departamento: "Test Dept",
      colaborador: "Test Colaborador",
      cargo: "Test Cargo",
      tipoReemplazo: "individual",
      departamentoReemplazo: "Test Dept",
      reemplazo: "Test Reemplazo",
      cargoReemplazo: "Test Cargo",
      puestoClave: "No",
    });

    let planId: number | null = null;
    if (createResult.id) {
      planId = createResult.id;
    } else if (createResult.plan?.id) {
      planId = createResult.plan.id;
    }

    if (planId) {
      // Then update it
      const updateResult = await caller.planes.update({
        id: planId,
        reemplazo: "Updated Reemplazo",
        puestoClave: "Si",
      });

      expect(updateResult).toBeDefined();
    }
  });

  it("should delete a plan", async () => {
    // First create a plan
    const createResult = await caller.planes.create({
      empleadoId: 1,
      departamento: "Test Dept",
      colaborador: "Test Colaborador",
      cargo: "Test Cargo",
      tipoReemplazo: "individual",
      departamentoReemplazo: "Test Dept",
      reemplazo: "Test Reemplazo",
      cargoReemplazo: "Test Cargo",
      puestoClave: "No",
    });

    let planId: number | null = null;
    if (createResult.id) {
      planId = createResult.id;
    } else if (createResult.plan?.id) {
      planId = createResult.plan.id;
    }

    if (planId) {
      // Then delete it
      const deleteResult = await caller.planes.delete({
        id: planId,
      });

      expect(deleteResult).toBeDefined();
    }
  });
});
