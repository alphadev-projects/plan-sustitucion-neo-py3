import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const mockUser = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "test",
  role: "user" as const,
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

describe("empleados procedures", () => {
  let caller: any;

  beforeAll(() => {
    caller = appRouter.createCaller(mockContext);
  });

  it("should list all empleados", async () => {
    const result = await caller.empleados.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get departamentos", async () => {
    const result = await caller.empleados.departamentos();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get sedes", async () => {
    const result = await caller.empleados.sedes();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get areas", async () => {
    const result = await caller.empleados.areas();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should search empleados by query", async () => {
    const result = await caller.empleados.search({ query: "test" });
    expect(Array.isArray(result)).toBe(true);
  });
});
