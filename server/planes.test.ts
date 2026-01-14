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

describe("planes procedures", () => {
  let caller: any;

  beforeAll(() => {
    caller = appRouter.createCaller(mockContext);
  });

  it("should list all planes", async () => {
    const result = await caller.planes.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get plan stats", async () => {
    const result = await caller.planes.stats();
    expect(result).toHaveProperty("totalPlanes");
    expect(result).toHaveProperty("puestosClaveCount");
    expect(result).toHaveProperty("departamentosConCobertura");
    expect(result).toHaveProperty("departamentosSinCobertura");
  });

  it("should get planes grouped by departamento", async () => {
    const result = await caller.planes.groupedByDepartamento();
    expect(typeof result).toBe("object");
  });

  it("should create a plan with admin role", async () => {
    const result = await caller.planes.create({
      empleadoId: 1,
      departamento: "Test Dept",
      colaborador: "Test Colaborador",
      cargo: "Test Cargo",
      departamentoReemplazo: "Test Dept",
      reemplazo: "Test Reemplazo",
      cargoReemplazo: "Test Cargo",
      puestoClave: "No",
    });
    expect(result).toHaveProperty("success");
  });
});
