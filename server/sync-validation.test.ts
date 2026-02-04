import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { initDb, createPlan, updatePlan, deletePlan, getPlanesSuccesion } from "./db";
import { db as drizzleDb } from "drizzle-orm";

describe("Sincronización y Validación de Duplicados", () => {
  beforeAll(async () => {
    initDb();
  });

  describe("Validación de Duplicados", () => {
    it("Debe rechazar registrar el mismo colaborador dos veces", async () => {
      const planData = {
        empleadoId: 1,
        departamento: "IT",
        colaborador: "Juan Perez",
        cargo: "Desarrollador",
        departamentoReemplazo: "IT",
        reemplazo: "Carlos Lopez",
        cargoReemplazo: "Desarrollador Senior",
        tipoReemplazo: "individual" as const,
        puestoClave: "No" as const,
        usuario: "test-user",
      };

      try {
        // Primer registro debe funcionar
        const plan1 = await createPlan(planData);
        expect(plan1).toBeDefined();
        expect(plan1.plan.colaborador).toBe("Juan Perez");

        // Segundo registro con mismo colaborador debe fallar
        try {
          await createPlan(planData);
          expect.fail("Debería haber lanzado error por duplicado");
        } catch (error: any) {
          expect(error.message).toContain("ya está registrado");
          expect(error.message).toContain("Juan Perez");
        }
      } catch (error) {
        console.error("Error en test:", error);
        throw error;
      }
    });

    it("Debe permitir registrar colaboradores diferentes", async () => {
      const plan1 = {
        empleadoId: 2,
        departamento: "IT",
        colaborador: "Maria Garcia",
        cargo: "Diseñadora",
        departamentoReemplazo: "IT",
        reemplazo: "Pedro Martinez",
        cargoReemplazo: "Diseñador Senior",
        tipoReemplazo: "individual" as const,
        puestoClave: "No" as const,
        usuario: "test-user",
      };

      const plan2 = {
        empleadoId: 3,
        departamento: "HR",
        colaborador: "Ana Rodriguez",
        cargo: "Especialista RH",
        departamentoReemplazo: "HR",
        reemplazo: "Luis Fernandez",
        cargoReemplazo: "Gerente RH",
        tipoReemplazo: "individual" as const,
        puestoClave: "No" as const,
        usuario: "test-user",
      };

      const result1 = await createPlan(plan1);
      const result2 = await createPlan(plan2);

      expect(result1.plan.colaborador).toBe("Maria Garcia");
      expect(result2.plan.colaborador).toBe("Ana Rodriguez");
    });
  });

  describe("Sincronización entre Tablas", () => {
    it("Debe crear registro en sucesion_puestos cuando puestoClave es Si", async () => {
      const planData = {
        empleadoId: 4,
        departamento: "Finanzas",
        colaborador: "Roberto Silva",
        cargo: "Contador",
        departamentoReemplazo: "Finanzas",
        reemplazo: "Sofia Gutierrez",
        cargoReemplazo: "Contador Senior",
        tipoReemplazo: "individual" as const,
        puestoClave: "Si" as const,
        usuario: "test-user",
      };

      const result = await createPlan(planData);
      expect(result.plan.puestoClave).toBe("Si");

      // Verificar que se creó en sucesion_puestos
      const planesSuccesion = await getPlanesSuccesion();
      const encontrado = planesSuccesion.find(
        (p) => p.puestoClave === "Roberto Silva"
      );
      expect(encontrado).toBeDefined();
      expect(encontrado?.departamentoPuestoClave).toBe("Finanzas");
    });

    it("NO debe crear registro en sucesion_puestos cuando puestoClave es No", async () => {
      const planData = {
        empleadoId: 5,
        departamento: "Ventas",
        colaborador: "Miguel Torres",
        cargo: "Vendedor",
        departamentoReemplazo: "Ventas",
        reemplazo: "Laura Morales",
        cargoReemplazo: "Vendedor Senior",
        tipoReemplazo: "individual" as const,
        puestoClave: "No" as const,
        usuario: "test-user",
      };

      const result = await createPlan(planData);
      expect(result.plan.puestoClave).toBe("No");

      // Verificar que NO se creó en sucesion_puestos
      const planesSuccesion = await getPlanesSuccesion();
      const encontrado = planesSuccesion.find(
        (p) => p.puestoClave === "Miguel Torres"
      );
      expect(encontrado).toBeUndefined();
    });

    it("Debe sincronizar cambios cuando se actualiza puestoClave de No a Si", async () => {
      const planData = {
        empleadoId: 6,
        departamento: "Marketing",
        colaborador: "Patricia Ruiz",
        cargo: "Community Manager",
        departamentoReemplazo: "Marketing",
        reemplazo: "Diego Flores",
        cargoReemplazo: "Community Manager Senior",
        tipoReemplazo: "individual" as const,
        puestoClave: "No" as const,
        usuario: "test-user",
      };

      const plan = await createPlan(planData);
      const planId = plan.plan.id;

      // Actualizar a puestoClave Si
      await updatePlan(planId, { puestoClave: "Si" });

      // Verificar que se creó en sucesion_puestos
      const planesSuccesion = await getPlanesSuccesion();
      const encontrado = planesSuccesion.find(
        (p) => p.puestoClave === "Patricia Ruiz"
      );
      expect(encontrado).toBeDefined();
    });

    it("Debe eliminar de sucesion_puestos cuando se cambia puestoClave de Si a No", async () => {
      const planData = {
        empleadoId: 7,
        departamento: "Operaciones",
        colaborador: "Fernando Gomez",
        cargo: "Operario",
        departamentoReemplazo: "Operaciones",
        reemplazo: "Gabriela Sanchez",
        cargoReemplazo: "Operario Senior",
        tipoReemplazo: "individual" as const,
        puestoClave: "Si" as const,
        usuario: "test-user",
      };

      const plan = await createPlan(planData);
      const planId = plan.plan.id;

      // Verificar que existe en sucesion_puestos
      let planesSuccesion = await getPlanesSuccesion();
      let encontrado = planesSuccesion.find((p) => p.puestoClave === "Fernando Gomez");
      expect(encontrado).toBeDefined();

      // Actualizar a puestoClave No
      await updatePlan(planId, { puestoClave: "No" });

      // Verificar que se eliminó de sucesion_puestos
      planesSuccesion = await getPlanesSuccesion();
      encontrado = planesSuccesion.find((p) => p.puestoClave === "Fernando Gomez");
      expect(encontrado).toBeUndefined();
    });
  });
});
