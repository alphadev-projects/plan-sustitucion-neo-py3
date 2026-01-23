import { storagePut } from "./storage";
import { updateSeguimientoConEvidencia } from "./db";

/**
 * Sube un archivo de evidencia a S3 y actualiza el seguimiento del plan de acción
 */
export async function subirEvidencia(
  planAccionId: number,
  archivoBase64: string,
  nombreArchivo: string,
  estado: string,
  progreso: number,
  comentario?: string,
  usuario?: string
) {
  try {
    // Validar entrada
    if (!archivoBase64 || !nombreArchivo) {
      throw new Error("Archivo o nombre inválido");
    }

    // Convertir base64 a Buffer
    const buffer = Buffer.from(archivoBase64, "base64");

    // Determinar tipo MIME basado en extensión
    const ext = nombreArchivo.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      xls: "application/vnd.ms-excel",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    // Generar nombre único para el archivo en S3
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const nombreUnico = `evidencias/${planAccionId}/${timestamp}-${randomSuffix}-${nombreArchivo}`;

    // Subir a S3
    const { url } = await storagePut(nombreUnico, buffer, contentType);

    // Actualizar seguimiento con la URL del archivo
    const resultado = await updateSeguimientoConEvidencia(
      planAccionId,
      estado,
      progreso,
      url,
      comentario,
      usuario
    );

    return {
      success: true,
      message: "Evidencia subida correctamente",
      url,
      nombreArchivo,
      resultado,
    };
  } catch (error: any) {
    console.error("Error subiendo evidencia:", error);
    throw new Error(`Error al subir evidencia: ${error.message}`);
  }
}

/**
 * Sube múltiples archivos de evidencia
 */
export async function subirMultiplesEvidencias(
  planAccionId: number,
  archivos: Array<{ base64: string; nombre: string }>,
  estado: string,
  progreso: number,
  comentario?: string,
  usuario?: string
) {
  const resultados = [];
  const errores = [];

  for (const archivo of archivos) {
    try {
      const resultado = await subirEvidencia(
        planAccionId,
        archivo.base64,
        archivo.nombre,
        estado,
        progreso,
        comentario,
        usuario
      );
      resultados.push(resultado);
    } catch (error: any) {
      errores.push({
        archivo: archivo.nombre,
        error: error.message,
      });
    }
  }

  return {
    success: errores.length === 0,
    resultados,
    errores,
    mensaje: `${resultados.length} archivo(s) subido(s), ${errores.length} error(es)`,
  };
}
