import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, LOCAL_AUTH_COOKIE_NAME } from "@shared/const";
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
  getDb,
  createUsuarioLocal,
  getUsuarioLocalByUsuario,
  verifyPassword,
  getAllUsuariosLocales,
  updateUsuarioLocal,
  deleteUsuarioLocal,
  type UsuarioLocal,
  importarEmpleados,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => {
      const user = opts.ctx.user;
      if (!user) return null;
      return {
        id: user.id,
        openId: user.openId,
        name: user.name,
        email: user.email,
        role: user.role,
        loginMethod: user.loginMethod,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastSignedIn: user.lastSignedIn,
      };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(LOCAL_AUTH_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    login: publicProcedure
      .input(z.object({ usuario: z.string(), contraseña: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const usuarioLocal = await getUsuarioLocalByUsuario(input.usuario);
        if (!usuarioLocal) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuario o contraseña inválidos" });
        }
        const passwordMatch = await verifyPassword(input.contraseña, usuarioLocal.contraseña);
        if (!passwordMatch) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuario o contraseña inválidos" });
        }
        const cookieOptions = getSessionCookieOptions(ctx.req);
        const cookieValue = JSON.stringify({ userId: usuarioLocal.id, usuario: usuarioLocal.usuario, role: usuarioLocal.role });
        console.log("[Login] Setting local auth cookie:", LOCAL_AUTH_COOKIE_NAME, "=", cookieValue);
        ctx.res.cookie(LOCAL_AUTH_COOKIE_NAME, cookieValue, cookieOptions);
        // Retornar el usuario con todos los campos necesarios
        return {
          success: true,
          usuario: {
            id: usuarioLocal.id,
            openId: `local-${usuarioLocal.id}`,
            usuario: usuarioLocal.usuario,
            nombre: usuarioLocal.nombre,
            email: usuarioLocal.email,
            role: usuarioLocal.role,
            loginMethod: 'local',
          },
        };
      }),
    crearUsuario: adminProcedure
      .input(z.object({ usuario: z.string(), contraseña: z.string(), nombre: z.string(), email: z.string().optional(), role: z.enum(["standard", "admin"]) }))
      .mutation(async ({ input }) => {
        const existingUser = await getUsuarioLocalByUsuario(input.usuario);
        if (existingUser) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "El usuario ya existe" });
        }
        const newUser = await createUsuarioLocal({
          usuario: input.usuario,
          contraseña: input.contraseña,
          nombre: input.nombre,
          email: input.email,
          role: input.role,
          activo: 1,
        });
        return { success: true, usuario: newUser };
      }),
    listarUsuarios: adminProcedure.query(async () => {
      const usuarios = await getAllUsuariosLocales();
      return usuarios.map((u) => ({
        id: u.id,
        usuario: u.usuario,
        nombre: u.nombre,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }));
    }),
    actualizarUsuario: adminProcedure
      .input(z.object({ id: z.number(), nombre: z.string().optional(), email: z.string().optional(), role: z.enum(["standard", "admin"]).optional() }))
      .mutation(async ({ input }) => {
        const updated = await updateUsuarioLocal(input.id, {
          nombre: input.nombre,
          email: input.email,
          role: input.role,
        });
        if (!updated) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado" });
        }
        return { success: true, usuario: updated };
      }),
    eliminarUsuario: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteUsuarioLocal(input.id);
        return { success: true };
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

    importar: adminProcedure
      .input(z.object({ empleados: z.array(z.object({
        sede: z.string(),
        cedula: z.string(),
        nombre: z.string(),
        area: z.string(),
        departamento: z.string(),
        cargo: z.string(),
      })) }))
      .mutation(async ({ input }) => {
        const result = await importarEmpleados(input.empleados);
        return { success: true, ...result };
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

    create: protectedProcedure
      .input(z.object({
        empleadoId: z.number(),
        departamento: z.string(),
        colaborador: z.string(),
        cargo: z.string(),
        departamentoReemplazo: z.string(),
        reemplazo: z.string(),
        cargoReemplazo: z.string(),
        puestoClave: z.enum(["Si", "No"]),
      }))
      .mutation(async ({ input, ctx }) => {
        return createPlan({
          ...input,
          usuario: ctx.user?.name || "usuario",
        });
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        departamento: z.string().optional(),
        colaborador: z.string().optional(),
        cargo: z.string().optional(),
        departamentoReemplazo: z.string().optional(),
        reemplazo: z.string().optional(),
        cargoReemplazo: z.string().optional(),
        puestoClave: z.enum(["Si", "No"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return updatePlan(input.id, input);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deletePlan(input.id);
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
