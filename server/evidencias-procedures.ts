import { z } from "zod";
import { protectedProcedure } from "./_core/trpc";
import { 
  obtenerEvidenciasPlanAccion, 
  obtenerEvidenciasCompletas,
  obtenerEvidenciasConArchivos,
  contarEvidencias,
  extraerNombreArchivo,
  generarNombreDescarga
} from "./evidencias";

/**
 * Procedimientos tRPC para gestión de evidencias en planes de acción
 */
export const evidenciasProcedures = {
  /**
   * Obtiene todas las evidencias de un plan de acción
   */
  obtenerEvidencias: protectedProcedure
    .input(z.object({
      planAccionId: z.number(),
    }))
    .query(async ({ input }) => {
      return obtenerEvidenciasPlanAccion(input.planAccionId);
    }),

  /**
   * Obtiene evidencias completas con información del plan de acción
   */
  obtenerEvidenciasCompletas: protectedProcedure
    .input(z.object({
      planAccionId: z.number(),
    }))
    .query(async ({ input }) => {
      return obtenerEvidenciasCompletas(input.planAccionId);
    }),

  /**
   * Obtiene solo las evidencias que tienen archivos adjuntos
   */
  obtenerEvidenciasConArchivos: protectedProcedure
    .input(z.object({
      planAccionId: z.number(),
    }))
    .query(async ({ input }) => {
      const evidencias = await obtenerEvidenciasConArchivos(input.planAccionId);
      
      // Enriquecer con información de descarga
      return evidencias.map((ev) => ({
        ...ev,
        nombreArchivo: ev.archivoEvidencia ? extraerNombreArchivo(ev.archivoEvidencia) : null,
        urlDescarga: ev.archivoEvidencia || null,
      }));
    }),

  /**
   * Cuenta el número de evidencias cargadas
   */
  contarEvidencias: protectedProcedure
    .input(z.object({
      planAccionId: z.number(),
    }))
    .query(async ({ input }) => {
      const count = await contarEvidencias(input.planAccionId);
      return { count };
    }),

  /**
   * Obtiene URL de descarga para una evidencia específica
   * Retorna la URL directa del archivo en S3
   */
  obtenerURLDescargaEvidencia: protectedProcedure
    .input(z.object({
      planAccionId: z.number(),
      seguimientoId: z.number(),
    }))
    .query(async ({ input }) => {
      const evidencias = await obtenerEvidenciasPlanAccion(input.planAccionId);
      const evidencia = evidencias.find((e) => e.id === input.seguimientoId);

      if (!evidencia || !evidencia.archivoEvidencia) {
        return {
          success: false,
          message: "Evidencia no encontrada o sin archivo adjunto",
          url: null,
          nombreArchivo: null,
        };
      }

      return {
        success: true,
        message: "URL de descarga obtenida",
        url: evidencia.archivoEvidencia,
        nombreArchivo: extraerNombreArchivo(evidencia.archivoEvidencia),
      };
    }),

  /**
   * Obtiene información de todas las evidencias para descargar como ZIP
   * (preparación para descarga múltiple)
   */
  prepararDescargaMultiple: protectedProcedure
    .input(z.object({
      planAccionId: z.number(),
    }))
    .query(async ({ input }) => {
      const evidencias = await obtenerEvidenciasConArchivos(input.planAccionId);
      
      if (evidencias.length === 0) {
        return {
          success: false,
          message: "No hay evidencias con archivos para descargar",
          archivos: [],
        };
      }

      const archivos = evidencias.map((ev) => ({
        id: ev.id,
        url: ev.archivoEvidencia!,
        nombreArchivo: extraerNombreArchivo(ev.archivoEvidencia!),
        estado: ev.estado,
        progreso: ev.progreso,
        comentario: ev.comentario,
        createdAt: ev.createdAt,
      }));

      return {
        success: true,
        message: `${archivos.length} archivo(s) disponible(s) para descargar`,
        archivos,
      };
    }),
};
