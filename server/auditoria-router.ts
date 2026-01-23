import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { registrarCambioAuditoria } from "./db-helpers";

export const auditoriaRouter = router({
  /**
   * Registra una descarga de reporte de evidencias en auditoría
   */
  registrarDescargaEvidencias: protectedProcedure
    .input(z.object({
      planAccionId: z.number(),
      tipoReporte: z.enum(["csv", "pdf", "xlsx"]),
      cantidadEvidencias: z.number(),
      descripcion: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        await registrarCambioAuditoria(
          input.planAccionId,
          ctx.user.openId,
          ctx.user.name || "Unknown",
          "DESCARGA_REPORTE",
          "reporte",
          undefined,
          input.tipoReporte,
          `${input.descripcion} - ${input.cantidadEvidencias} evidencia(s)`
        );

        return {
          success: true,
          message: "Descarga registrada en auditoría",
        };
      } catch (error: any) {
        console.error("Error registrando descarga:", error);
        return {
          success: false,
          message: "Error registrando descarga en auditoría",
        };
      }
    }),

  /**
   * Registra una descarga de evidencia individual
   */
  registrarDescargaEvidenciaIndividual: protectedProcedure
    .input(z.object({
      planAccionId: z.number(),
      nombreArchivo: z.string(),
      seguimientoId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        await registrarCambioAuditoria(
          input.planAccionId,
          ctx.user.openId,
          ctx.user.name || "Unknown",
          "DESCARGA_EVIDENCIA",
          "archivo",
          undefined,
          input.nombreArchivo,
          `Descarga de evidencia: ${input.nombreArchivo}`
        );

        return {
          success: true,
          message: "Descarga de evidencia registrada en auditoría",
        };
      } catch (error: any) {
        console.error("Error registrando descarga de evidencia:", error);
        return {
          success: false,
          message: "Error registrando descarga de evidencia en auditoría",
        };
      }
    }),
});
