import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

// Procedure que requiere rol de administrador
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Se requiere permisos de administrador" });
  }
  return next({ ctx });
});
import {
  getAllEmpleados,
  getEmpleadosByDepartamento,
  searchEmpleados,
  getDepartamentos,
  getSedes,
  getAreas,
  getEmpleadoById,
  getAllPlanes,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanById,
  getPlansByDepartamento,
  getPlanStats,
  getPlanesGroupedByDepartamento,
  type InsertPlanSustitucion,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Procedures para empleados
  empleados: router({
    list: publicProcedure.query(async () => {
      return getAllEmpleados();
    }),

    listByDepartamento: publicProcedure
      .input(z.object({ departamento: z.string() }))
      .query(async ({ input }) => {
        return getEmpleadosByDepartamento(input.departamento);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return searchEmpleados(input.query);
      }),

    departamentos: publicProcedure.query(async () => {
      return getDepartamentos();
    }),

    sedes: publicProcedure.query(async () => {
      return getSedes();
    }),

    areas: publicProcedure.query(async () => {
      return getAreas();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getEmpleadoById(input.id);
      }),
  }),

  // Procedures para planes de sustitución
  planes: router({
    list: publicProcedure.query(async () => {
      return getAllPlanes();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getPlanById(input.id);
      }),

    listByDepartamento: publicProcedure
      .input(z.object({ departamento: z.string() }))
      .query(async ({ input }) => {
        return getPlansByDepartamento(input.departamento);
      }),

    create: adminProcedure
      .input(
        z.object({
          empleadoId: z.number(),
          departamento: z.string(),
          colaborador: z.string(),
          cargo: z.string(),
          departamentoReemplazo: z.string(),
          reemplazo: z.string(),
          cargoReemplazo: z.string(),
          puestoClave: z.enum(["Si", "No"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const plan: InsertPlanSustitucion = {
          ...input,
          usuario: ctx.user?.name || "Sistema",
        };
        await createPlan(plan);

        // Enviar notificación si es puesto clave
        if (input.puestoClave === "Si") {
          try {
            const { notifyOwner } = await import("./_core/notification");
            await notifyOwner({
              title: "Plan de Sustitución Crítico Creado",
              content: `Se ha creado un nuevo plan de sustitución para un puesto clave: ${input.colaborador} (${input.cargo}) en ${input.departamento}. Reemplazo: ${input.reemplazo}.`,
            });
          } catch (error) {
            console.error("Error sending notification:", error);
          }
        }

        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          departamento: z.string().optional(),
          colaborador: z.string().optional(),
          cargo: z.string().optional(),
          departamentoReemplazo: z.string().optional(),
          reemplazo: z.string().optional(),
          cargoReemplazo: z.string().optional(),
          puestoClave: z.enum(["Si", "No"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        await updatePlan(id, {
          ...updateData,
          usuario: ctx.user?.name || "Sistema",
        });

        // Enviar notificación si se marcó como puesto clave
        if (updateData.puestoClave === "Si") {
          try {
            const { notifyOwner } = await import("./_core/notification");
            const plan = await getPlanById(id);
            if (plan) {
              await notifyOwner({
                title: "Plan de Sustitución Crítico Actualizado",
                content: `Se ha actualizado un plan de sustitución para un puesto clave: ${plan.colaborador} (${plan.cargo}). Cambios realizados por ${ctx.user?.name || "Sistema"}.`,
              });
            }
          } catch (error) {
            console.error("Error sending notification:", error);
          }
        }

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePlan(input.id);
        return { success: true };
      }),

    stats: publicProcedure.query(async () => {
      return getPlanStats();
    }),

    groupedByDepartamento: publicProcedure.query(async () => {
      return getPlanesGroupedByDepartamento();
    }),
  }),
});

export type AppRouter = typeof appRouter;
