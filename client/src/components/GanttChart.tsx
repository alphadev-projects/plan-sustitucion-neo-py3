import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';

export interface GanttTask {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: 'No Iniciado' | 'En Progreso' | 'Completado' | 'Retrasado';
  responsable?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  height?: number;
}

/**
 * Componente de gráfico Gantt para visualizar planes de acción
 * Muestra barras de progreso con timeline
 */
export function GanttChart({ tasks, height = 400 }: GanttChartProps) {
  const { minDate, maxDate, taskRows } = useMemo(() => {
    if (tasks.length === 0) {
      return {
        minDate: new Date(),
        maxDate: new Date(),
        taskRows: [],
      };
    }

    const dates = tasks.flatMap(t => [t.startDate, t.endDate]);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Agregar 5% de margen a ambos lados
    const range = maxDate.getTime() - minDate.getTime();
    const margin = range * 0.05;
    minDate.setTime(minDate.getTime() - margin);
    maxDate.setTime(maxDate.getTime() + margin);

    return {
      minDate,
      maxDate,
      taskRows: tasks,
    };
  }, [tasks]);

  const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
  const pixelsPerDay = 600 / totalDays;

  const getTaskPosition = (task: GanttTask) => {
    const startOffset = (task.startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    const duration = (task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24);
    return {
      left: startOffset * pixelsPerDay,
      width: Math.max(duration * pixelsPerDay, 20),
    };
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Completado':
        return 'bg-green-500';
      case 'En Progreso':
        return 'bg-blue-500';
      case 'Retrasado':
        return 'bg-red-500';
      case 'No Iniciado':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'Completado':
        return '✓ Completado';
      case 'En Progreso':
        return '⏳ En Progreso';
      case 'Retrasado':
        return '⚠️ Retrasado';
      case 'No Iniciado':
        return '○ No Iniciado';
      default:
        return status;
    }
  };

  const isOverdue = (task: GanttTask): boolean => {
    return task.status === 'Retrasado' || (task.endDate < new Date() && task.status !== 'Completado');
  };

  if (tasks.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No hay planes de acción para mostrar</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 overflow-x-auto">
      <div className="min-w-full">
        {/* Header con fechas */}
        <div className="flex mb-4">
          <div className="w-64 flex-shrink-0 pr-4">
            <h3 className="font-semibold text-sm text-gray-700">Plan de Acción</h3>
          </div>
          <div className="flex-1 relative">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>{minDate.toLocaleDateString('es-UY')}</span>
              <span>{maxDate.toLocaleDateString('es-UY')}</span>
            </div>
            <div className="h-1 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Tareas */}
        <div className="space-y-3" style={{ maxHeight: `${height}px`, overflowY: 'auto' }}>
          {taskRows.map((task) => {
            const position = getTaskPosition(task);
            const isOver = isOverdue(task);

            return (
              <div key={task.id} className="flex items-center gap-4">
                {/* Información de la tarea */}
                <div className="w-64 flex-shrink-0">
                  <div className="flex flex-col">
                    <p className="font-medium text-sm text-gray-900 truncate" title={task.title}>
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {task.responsable && `Responsable: ${task.responsable}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        task.status === 'Completado' ? 'bg-green-100 text-green-800' :
                        task.status === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'Retrasado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de Gantt */}
                <div className="flex-1 relative h-16 bg-gray-50 rounded border border-gray-200">
                  {/* Línea de hoy */}
                  {(() => {
                    const today = new Date();
                    if (today >= minDate && today <= maxDate) {
                      const todayOffset = (today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
                      return (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-400 opacity-50"
                          style={{ left: `${todayOffset * pixelsPerDay}px` }}
                          title="Hoy"
                        ></div>
                      );
                    }
                    return null;
                  })()}

                  {/* Barra de progreso */}
                  <div
                    className={`absolute top-2 bottom-2 rounded flex items-center justify-center text-white text-xs font-semibold transition-all ${
                      getStatusColor(task.status)
                    } ${isOver ? 'opacity-75' : 'opacity-90'}`}
                    style={{
                      left: `${position.left}px`,
                      width: `${position.width}px`,
                    }}
                    title={`${task.progress}% completado`}
                  >
                    {position.width > 50 && `${task.progress}%`}
                  </div>

                  {/* Indicador de progreso visual */}
                  <div className="absolute bottom-1 left-2 right-2 h-1 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>

                  {/* Información de fechas */}
                  <div className="absolute top-1 left-2 text-xs text-gray-600 pointer-events-none">
                    {task.startDate.toLocaleDateString('es-UY', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="absolute top-1 right-2 text-xs text-gray-600 pointer-events-none">
                    {task.endDate.toLocaleDateString('es-UY', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Indicador de vencimiento */}
                {isOver && (
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-100 rounded-full">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Completado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>En Progreso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Retrasado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>No Iniciado</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            <p>💡 La línea roja indica el día de hoy. El porcentaje muestra el progreso de cada acción.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default GanttChart;
