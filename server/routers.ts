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
  getCargos,
  getEmpleadoById,
  getAllPlanes,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanById,
  getPlansByDepartamento,
  getPlanStats,
  getPlanesGroupedByDepartamento,
  getEmpleadosByCargoAndDepartamento,
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
  getPlanesSuccesion,
  getPlanesSuccesionCriticos,
  createPlanSuccesion,
  updatePlanSuccesion,
  getPlanesAccionBySuccesion,
  createPlanAccion,
  updatePlanAccion,
  deletePlanAccion,
  getComentariosByPlanAccion,
  createComentario,
  deleteComentario,
  getDashboardMetricas,
  getResumenPorDepartamento,
  syncMissingPlanes,
} from "./db";
import { getAlertasPlanes, generarReporteRiesgosCSV, obtenerHistorialPlanAccion, obtenerAuditoriaConFiltros } from "./db-helpers";
import { planesSuccesionToCSV, generarReporteRiesgos } from "./export";
import { notifyPlanStatusChanged, notifyHighRiskPosition, notifyActionDeadlineApproaching, notifyActionOverdue, notifyActionCompleted } from "./email-notifications";
import { notificationProcedures } from "./notification-procedures";
import { evidenciasProcedures } from "./evidencias-procedures";
import { auditoriaRouter } from "./auditoria-router";

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

    cargos: publicProcedure.query(async () => {
      return getCargos();
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
    empleadosByCargoAndDepartamento: publicProcedure
      .input(z.object({ cargo: z.string(), departamento: z.string() }))
      .query(async ({ input }) => {
        return getEmpleadosByCargoAndDepartamento(input.cargo, input.departamento);
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
        tipoReemplazo: z.enum(["individual", "pool"]),
        departamentoReemplazo: z.string().optional(),
        reemplazo: z.string().optional(),
        cargoReemplazo: z.string().optional(),
        cargoPoolReemplazo: z.string().optional(),
        departamentoPoolReemplazo: z.string().optional(),
        puestoClave: z.enum(["Si", "No"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (input.tipoReemplazo === "pool") {
          const colaboradoresPool = await getEmpleadosByCargoAndDepartamento(
            input.cargoPoolReemplazo!,
            input.departamentoPoolReemplazo!
          );
          
          const planesCreados = [];
          for (const colaborador of colaboradoresPool) {
            // Excluir al colaborador seleccionado del pool
            if (colaborador.nombre === input.colaborador) {
              continue;
            }
            const plan = await createPlan({
              empleadoId: input.empleadoId,
              departamento: input.departamento,
              colaborador: input.colaborador,
              cargo: input.cargo,
              departamentoReemplazo: input.departamentoPoolReemplazo!,
              reemplazo: colaborador.nombre,
              cargoReemplazo: input.cargoPoolReemplazo!,
              tipoReemplazo: "pool",
              cargoPoolReemplazo: input.cargoPoolReemplazo!,
              departamentoPoolReemplazo: input.departamentoPoolReemplazo!,
              puestoClave: input.puestoClave,
              usuario: ctx.user?.name || "usuario",
            });
            planesCreados.push(plan);
          }
          return { success: true, planesCreados, totalCreados: planesCreados.length };
        } else {
          return createPlan({
            empleadoId: input.empleadoId,
            departamento: input.departamento,
            colaborador: input.colaborador,
            cargo: input.cargo,
            departamentoReemplazo: input.departamentoReemplazo!,
            reemplazo: input.reemplazo!,
            cargoReemplazo: input.cargoReemplazo!,
            tipoReemplazo: "individual",
            puestoClave: input.puestoClave,
            usuario: ctx.user?.name || "usuario",
          });
        }
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

  sucesion: router({
    // Planes de Sucesión
    listar: protectedProcedure.query(async () => {
      return getPlanesSuccesion();
    }),

    criticos: protectedProcedure.query(async () => {
      return getPlanesSuccesionCriticos();
    }),

    crear: adminProcedure
      .input(z.object({
        planSustitucionId: z.number(),
        departamento: z.string(),
        cargo: z.string(),
        colaborador: z.string(),
        riesgoContinuidad: z.enum(["Alto", "Medio", "Bajo"]),
        riesgoCritico: z.enum(["Si", "No"]),
        prioridadSucesion: z.enum(["Alta", "Media", "Baja"]),
      }))
      .mutation(async ({ input, ctx }) => {
        return createPlanSuccesion({
          ...input,
          usuario: ctx.user?.name || "usuario",
        });
      }),

    actualizar: adminProcedure
      .input(z.object({
        id: z.number(),
        estado: z.enum(["Pendiente", "En Progreso", "Completado"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return updatePlanSuccesion(input.id, { estado: input.estado });
      }),

    // Sincronización de planes faltantes
    sincronizar: adminProcedure.mutation(async () => {
      return syncMissingPlanes();
    }),

    // Planes de Acción
    accionesListar: protectedProcedure
      .input(z.object({ planSuccesionId: z.number() }))
      .query(async ({ input }) => {
        return getPlanesAccionBySuccesion(input.planSuccesionId);
      }),

    accionCrear: adminProcedure
      .input(z.object({
        planSuccesionId: z.number(),
        titulo: z.string(),
        descripcion: z.string(),
        responsable: z.string(),
        fechaInicio: z.date(),
        fechaFin: z.date(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createPlanAccion({
          ...input,
          usuario: ctx.user?.name || "usuario",
        });
      }),

    accionActualizar: adminProcedure
      .input(z.object({
        id: z.number(),
        estado: z.enum(["No Iniciado", "En Progreso", "Completado", "Retrasado"]).optional(),
        progreso: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return updatePlanAccion(input.id, { estado: input.estado, progreso: input.progreso }, ctx.user.name || "Unknown", ctx.user.openId);
      }),

    accionActualizarConEvidencia: protectedProcedure
      .input(z.object({
        planAccionId: z.number(),
        estado: z.enum(["No Iniciado", "En Progreso", "Completado", "Retrasado"]).optional(),
        progreso: z.number().min(0).max(100).optional(),
        archivoEvidenciaUrl: z.string().optional(),
        comentario: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { updateSeguimientoConEvidencia } = await import("./db");
        return updateSeguimientoConEvidencia(
          input.planAccionId,
          input.estado || "No Iniciado",
          input.progreso || 0,
          input.archivoEvidenciaUrl,
          input.comentario,
          ctx.user.name || "Unknown"
        );
      }),

    subirEvidencia: protectedProcedure
      .input(z.object({
        planAccionId: z.number(),
        archivoBase64: z.string(),
        nombreArchivo: z.string(),
        estado: z.enum(["No Iniciado", "En Progreso", "Completado", "Retrasado"]),
        progreso: z.number().min(0).max(100),
        comentario: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { subirEvidencia } = await import("./upload-evidencias");
        return subirEvidencia(
          input.planAccionId,
          input.archivoBase64,
          input.nombreArchivo,
          input.estado,
          input.progreso,
          input.comentario,
          ctx.user.name || "Unknown"
        );
      }),

    accionEliminar: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deletePlanAccion(input.id);
      }),

    // Comentarios
    comentariosListar: protectedProcedure
      .input(z.object({ planAccionId: z.number() }))
      .query(async ({ input }) => {
        return getComentariosByPlanAccion(input.planAccionId);
      }),

    comentarioCrear: protectedProcedure
      .input(z.object({
        planAccionId: z.number(),
        contenido: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createComentario({
          planAccionId: input.planAccionId,
          autor: ctx.user?.name || "usuario",
          contenido: input.contenido,
        });
      }),

    comentarioEliminar: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteComentario(input.id);
      }),

    dashboardMetricas: protectedProcedure.query(async () => {
      return getDashboardMetricas();
    }),

    dashboardResumenDepartamentos: protectedProcedure.query(async () => {
      return getResumenPorDepartamento();
    }),

    obtenerAlertas: protectedProcedure.query(async () => {
      return getAlertasPlanes();
    }),

    descargarReporteRiesgos: protectedProcedure.query(async () => {
      const planes = await getPlanesSuccesion();
      const csv = planesSuccesionToCSV(planes);
      return { csv, filename: `reporte-riesgos-${new Date().toISOString().split("T")[0]}.csv` };
    }),

    obtenerReporteRiesgos: protectedProcedure.query(async () => {
      const planes = await getPlanesSuccesion();
      return generarReporteRiesgos(planes);
    }),

    ...notificationProcedures,

    ...evidenciasProcedures,

    obtenerHistorial: protectedProcedure
      .input(z.object({ planAccionId: z.number() }))
      .query(async ({ input }) => {
        return obtenerHistorialPlanAccion(input.planAccionId);
      }),

    obtenerAuditoria: protectedProcedure
      .input(z.object({
        usuario: z.string().optional(),
        accion: z.string().optional(),
        planAccionId: z.number().optional(),
        fechaInicio: z.string().optional(),
        fechaFin: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return obtenerAuditoriaConFiltros(
          input.usuario,
          input.accion,
          input.planAccionId,
          input.fechaInicio,
          input.fechaFin
        );
      }),
  }),
  auditoria: auditoriaRouter,
});

export type AppRouter = typeof appRouter;
