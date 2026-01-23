import React, { useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GanttChart, type GanttTask } from '@/components/GanttChart';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc';
import { AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Dashboard mejorado de Sucesión con matriz Gantt
 * Visualiza planes de acción con timeline y progreso
 */
export function DashboardSuccesionMejorado() {
  const { data: metricas, isLoading: metricasLoading } = trpc.sucesion.dashboardMetricas.useQuery();

  // Para este ejemplo, usamos datos de demostración
  // En producción, se obtendría de la API
  const ganttTasks: GanttTask[] = useMemo(() => {
    // Datos de ejemplo para demostración
    const hoy = new Date();
    return [
      {
        id: 1,
        title: 'Identificar candidatos internos',
        startDate: new Date(hoy.getTime() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000),
        progress: 75,
        status: 'En Progreso',
        responsable: 'Recursos Humanos',
      },
      {
        id: 2,
        title: 'Evaluación de competencias',
        startDate: new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(hoy.getTime() + 20 * 24 * 60 * 60 * 1000),
        progress: 0,
        status: 'No Iniciado',
        responsable: 'Gerencia',
      },
      {
        id: 3,
        title: 'Plan de capacitación',
        startDate: new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(hoy.getTime() + 45 * 24 * 60 * 60 * 1000),
        progress: 0,
        status: 'No Iniciado',
        responsable: 'Desarrollo Organizacional',
      },
      {
        id: 4,
        title: 'Transición y mentoría',
        startDate: new Date(hoy.getTime() + 40 * 24 * 60 * 60 * 1000),
        endDate: new Date(hoy.getTime() + 90 * 24 * 60 * 60 * 1000),
        progress: 0,
        status: 'No Iniciado',
        responsable: 'Gerencia',
      },
      {
        id: 5,
        title: 'Evaluación final',
        startDate: new Date(hoy.getTime() + 85 * 24 * 60 * 60 * 1000),
        endDate: new Date(hoy.getTime() + 100 * 24 * 60 * 60 * 1000),
        progress: 0,
        status: 'No Iniciado',
        responsable: 'Recursos Humanos',
      },
    ];
  }, []);

  // Calcular estadísticas de acciones
  const estadisticasAcciones = useMemo(() => {
    const total = ganttTasks.length;
    const completadas = ganttTasks.filter(t => t.status === 'Completado').length;
    const enProgreso = ganttTasks.filter(t => t.status === 'En Progreso').length;
    const retrasadas = ganttTasks.filter(t => t.status === 'Retrasado').length;
    const noIniciadas = ganttTasks.filter(t => t.status === 'No Iniciado').length;

    const porcentajeCompletacion = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return {
      total,
      completadas,
      enProgreso,
      retrasadas,
      noIniciadas,
      porcentajeCompletacion,
    };
  }, [ganttTasks]);

  // Acciones próximas a vencer (en los próximos 7 días)
  const accionesProximasVencer = useMemo(() => {
    const hoy = new Date();
    const proximosSieteDias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);

    return ganttTasks
      .filter(t => 
        t.endDate >= hoy && 
        t.endDate <= proximosSieteDias && 
        t.status !== 'Completado'
      )
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  }, [ganttTasks]);

  // Acciones vencidas
  const accionesVencidas = useMemo(() => {
    const hoy = new Date();
    return ganttTasks.filter(t => 
      t.endDate < hoy && 
      t.status !== 'Completado'
    );
  }, [ganttTasks]);

  if (metricasLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Sucesión</h1>
          <p className="text-gray-600 mt-2">Matriz de Gantt - Visualización de Planes de Acción</p>
        </div>

        {/* Alertas críticas */}
        {accionesVencidas.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{accionesVencidas.length} acciones vencidas</strong> requieren atención inmediata
            </AlertDescription>
          </Alert>
        )}

        {accionesProximasVencer.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>{accionesProximasVencer.length} acciones próximas a vencer</strong> en los próximos 7 días
            </AlertDescription>
          </Alert>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Acciones</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{estadisticasAcciones.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{estadisticasAcciones.completadas}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{estadisticasAcciones.enProgreso}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Retrasadas</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{estadisticasAcciones.retrasadas}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">% Completación</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{estadisticasAcciones.porcentajeCompletacion}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">📊</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Matriz Gantt */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline de Planes de Acción</h2>
          <GanttChart tasks={ganttTasks} height={500} />
        </div>

        {/* Acciones próximas a vencer */}
        {accionesProximasVencer.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Próximas a Vencer</h2>
            <Card className="p-4">
              <div className="space-y-3">
                {accionesProximasVencer.slice(0, 5).map((accion) => (
                  <div key={accion.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{accion.title}</p>
                      <p className="text-sm text-gray-600">
                        Vence: {accion.endDate.toLocaleDateString('es-UY')}
                        {accion.responsable && ` • Responsable: ${accion.responsable}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{accion.progress}%</p>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-yellow-500 transition-all"
                            style={{ width: `${accion.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Información adicional */}
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Cómo usar la matriz de Gantt</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Barras de color:</strong> Representan el estado de cada acción (verde = completado, azul = en progreso, rojo = retrasado)</li>
            <li>• <strong>Porcentaje:</strong> Muestra el progreso de completación de cada acción</li>
            <li>• <strong>Línea roja:</strong> Indica el día de hoy para referencia temporal</li>
            <li>• <strong>Barra inferior:</strong> Visualiza el progreso general de cada acción</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default DashboardSuccesionMejorado;
