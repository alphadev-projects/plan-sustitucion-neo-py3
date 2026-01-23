import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface BotonDescargarReporteProps {
  planAccionId: number;
  titulo: string;
  tipo?: 'csv' | 'pdf' | 'xlsx';
}

/**
 * Botón para descargar reporte de evidencias y registrar en auditoría
 */
export function BotonDescargarReporte({ 
  planAccionId, 
  titulo,
  tipo = 'csv'
}: BotonDescargarReporteProps) {
  const [descargando, setDescargando] = useState(false);

  // Obtener evidencias
  const { data: evidenciasData, isLoading } = trpc.sucesion.obtenerEvidenciasConArchivos.useQuery({
    planAccionId,
  });

  // Registrar descarga en auditoría
  const registrarAuditoriaMutation = trpc.auditoria.registrarDescargaEvidencias.useMutation();

  const handleDescargar = async () => {
    try {
      setDescargando(true);

      const evidencias = evidenciasData || [];

      if (evidencias.length === 0) {
        toast.error('No hay evidencias para descargar');
        return;
      }

      // Generar contenido CSV
      let contenido = '';
      if (tipo === 'csv') {
        contenido = 'ID,Archivo,Estado,Progreso,Fecha,Comentario\n';
        evidencias.forEach((ev) => {
          const fecha = new Date(ev.createdAt).toLocaleDateString('es-UY');
          const comentario = (ev.comentario || '').replace(/"/g, '""');
          contenido += `${ev.id},"${ev.nombreArchivo}","${ev.estado}",${ev.progreso}%,"${fecha}","${comentario}"\n`;
        });
      }

      // Registrar en auditoría
      await registrarAuditoriaMutation.mutateAsync({
        planAccionId,
        tipoReporte: tipo,
        cantidadEvidencias: evidencias.length,
        descripcion: `Descarga de reporte de evidencias: ${titulo}`,
      });

      // Descargar archivo
      const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte-evidencias-${planAccionId}-${new Date().getTime()}.${tipo}`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Reporte descargado y registrado en auditoría`);
    } catch (error: any) {
      console.error('Error descargando reporte:', error);
      toast.error('Error al descargar el reporte');
    } finally {
      setDescargando(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled size="sm" variant="outline" className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando...
      </Button>
    );
  }

  const tieneEvidencias = (evidenciasData?.length || 0) > 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleDescargar}
        disabled={descargando || !tieneEvidencias}
        size="sm"
        variant={tieneEvidencias ? "default" : "outline"}
        className="gap-2"
      >
        {descargando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Descargando...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Descargar Reporte
          </>
        )}
      </Button>
      {!tieneEvidencias && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <AlertCircle className="h-3 w-3" />
          Sin evidencias
        </div>
      )}
    </div>
  );
}

export default BotonDescargarReporte;
