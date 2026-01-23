import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Download, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DescargaEvidenciasProps {
  planAccionId: number;
  planAccionTitulo?: string;
}

/**
 * Componente para descargar evidencias de un plan de acción
 * Muestra lista de evidencias con archivos adjuntos
 */
export function DescargaEvidencias({ planAccionId, planAccionTitulo = 'Plan de Acción' }: DescargaEvidenciasProps) {
  const [descargando, setDescargando] = useState<number | null>(null);

  // Obtener evidencias con archivos
  const { data: evidenciasData, isLoading, refetch } = trpc.sucesion.obtenerEvidenciasConArchivos.useQuery({
    planAccionId,
  });

  // Obtener información de descarga múltiple
  const { data: descargaMultiple } = trpc.sucesion.prepararDescargaMultiple.useQuery({
    planAccionId,
  });

  const handleDescargar = async (urlS3: string, nombreArchivo: string, seguimientoId: number) => {
    try {
      setDescargando(seguimientoId);
      
      // Crear un elemento <a> temporal para descargar
      const link = document.createElement('a');
      link.href = urlS3;
      link.download = nombreArchivo;
      link.target = '_blank';
      
      // Trigger descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Descargando: ${nombreArchivo}`);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      toast.error('Error al descargar el archivo');
    } finally {
      setDescargando(null);
    }
  };

  const handleDescargarTodos = async () => {
    if (!descargaMultiple?.archivos || descargaMultiple.archivos.length === 0) {
      toast.error('No hay archivos para descargar');
      return;
    }

    try {
      setDescargando(-1);
      
      // Descargar cada archivo con un pequeño delay
      for (let i = 0; i < descargaMultiple.archivos.length; i++) {
        const archivo = descargaMultiple.archivos[i];
        await new Promise((resolve) => {
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = archivo.url;
            link.download = archivo.nombreArchivo;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            resolve(null);
          }, i * 500); // Delay de 500ms entre descargas
        });
      }
      
      toast.success(`Descargando ${descargaMultiple.archivos.length} archivo(s)`);
    } catch (error) {
      console.error('Error descargando archivos:', error);
      toast.error('Error al descargar los archivos');
    } finally {
      setDescargando(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando evidencias...</span>
        </div>
      </Card>
    );
  }

  const evidencias = evidenciasData || [];

  if (evidencias.length === 0) {
    return (
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900">Sin evidencias</h3>
            <p className="text-sm text-blue-800 mt-1">
              No hay evidencias con archivos adjuntos en este plan de acción.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Evidencias Cargadas</h3>
          <p className="text-sm text-gray-600 mt-1">
            {evidencias.length} archivo(s) disponible(s) para descargar
          </p>
        </div>
        {evidencias.length > 1 && (
          <Button
            onClick={handleDescargarTodos}
            disabled={descargando !== null}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {descargando === -1 ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Descargar Todo
              </>
            )}
          </Button>
        )}
      </div>

      {/* Lista de evidencias */}
      <Card className="divide-y">
        {evidencias.map((evidencia) => (
          <div key={evidencia.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            {/* Información */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {evidencia.nombreArchivo}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      evidencia.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                      evidencia.estado === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                      evidencia.estado === 'Retrasado' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {evidencia.estado}
                    </span>
                    <span>Progreso: {evidencia.progreso}%</span>
                    <span>
                      {new Date(evidencia.createdAt).toLocaleDateString('es-UY')}
                    </span>
                  </div>
                  {evidencia.comentario && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {evidencia.comentario}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botón de descarga */}
            <Button
              onClick={() => handleDescargar(
                evidencia.urlDescarga!,
                evidencia.nombreArchivo!,
                evidencia.id
              )}
              disabled={descargando !== null}
              size="sm"
              className="ml-4 gap-2 flex-shrink-0"
            >
              {descargando === evidencia.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Descargar
                </>
              )}
            </Button>
          </div>
        ))}
      </Card>

      {/* Información adicional */}
      <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-green-800">
          Los archivos se descargarán directamente desde el almacenamiento seguro. Todos los archivos están disponibles para auditoría.
        </p>
      </div>
    </div>
  );
}

export default DescargaEvidencias;
