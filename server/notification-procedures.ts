import { z } from "zod";
import { protectedProcedure } from "./_core/trpc";
import { 
  notifyPlanStatusChanged, 
  notifyHighRiskPosition, 
  notifyActionDeadlineApproaching, 
  notifyActionOverdue, 
  notifyActionCompleted 
} from "./email-notifications";

export const notificationProcedures = {
  enviarNotificacionEstadoCambiado: protectedProcedure
    .input(z.object({
      planId: z.number(),
      planTitle: z.string(),
      estadoAnterior: z.string(),
      estadoNuevo: z.string(),
      emailDestinatario: z.string(),
      nombreDestinatario: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = await notifyPlanStatusChanged(
        input.planId,
        input.planTitle,
        input.estadoAnterior,
        input.estadoNuevo,
        input.emailDestinatario,
        input.nombreDestinatario
      );
      return { success };
    }),

  enviarNotificacionRiesgoAlto: protectedProcedure
    .input(z.object({
      planId: z.number(),
      planTitle: z.string(),
      nivelRiesgo: z.string(),
      emailDestinatario: z.string(),
      nombreDestinatario: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = await notifyHighRiskPosition(
        input.planId,
        input.planTitle,
        input.nivelRiesgo,
        input.emailDestinatario,
        input.nombreDestinatario
      );
      return { success };
    }),

  enviarNotificacionAccionProximaVencer: protectedProcedure
    .input(z.object({
      accionId: z.number(),
      accionTitle: z.string(),
      planTitle: z.string(),
      fechaVencimiento: z.date(),
      emailDestinatario: z.string(),
      nombreDestinatario: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = await notifyActionDeadlineApproaching(
        input.accionId,
        input.accionTitle,
        input.planTitle,
        input.fechaVencimiento,
        input.emailDestinatario,
        input.nombreDestinatario
      );
      return { success };
    }),

  enviarNotificacionAccionVencida: protectedProcedure
    .input(z.object({
      accionId: z.number(),
      accionTitle: z.string(),
      planTitle: z.string(),
      fechaVencimiento: z.date(),
      emailDestinatario: z.string(),
      nombreDestinatario: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = await notifyActionOverdue(
        input.accionId,
        input.accionTitle,
        input.planTitle,
        input.fechaVencimiento,
        input.emailDestinatario,
        input.nombreDestinatario
      );
      return { success };
    }),

  enviarNotificacionAccionCompletada: protectedProcedure
    .input(z.object({
      accionId: z.number(),
      accionTitle: z.string(),
      planTitle: z.string(),
      emailDestinatario: z.string(),
      nombreDestinatario: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = await notifyActionCompleted(
        input.accionId,
        input.accionTitle,
        input.planTitle,
        input.emailDestinatario,
        input.nombreDestinatario
      );
      return { success };
    }),
};
