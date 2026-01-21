import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, CheckCircle, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertasPlanes } from "@/components/AlertasPlanes";
import { FiltrosAvanzados, type FiltrosState } from "@/components/FiltrosAvanzados";

function DashboardContent() {
  const [filtros, setFiltros] = useState<FiltrosState>({
    departamento: "",
    riesgo: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const { data: metricas, isLoading: loadingMetricas } = trpc.sucesion.dashboardMetricas.useQuery();
  const { data: resumenDepartamentos, isLoading: loadingResumen } = trpc.sucesion.dashboardResumenDepartamentos.useQuery();

  if (loadingMetricas || loadingResumen) {
    return <div className="p-6">Cargando dashboard...</div>;
  }

  const porcentajeCompletados = metricas?.planesTotal ? Math.round((metricas.planesCompletados / metricas.planesTotal) * 100) : 0;

  const departamentos = resumenDepartamentos?.map((d: any) => d.departamento) || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard - Plan de Sucesión</h1>
        <p className="text-gray-600 mt-2">Resumen de planes de sucesión y cobertura organizacional</p>
      </div>

      {/* Filtros Avanzados */}
      <FiltrosAvanzados departamentos={departamentos} onFiltrosChange={setFiltros} />

      {/* Alertas Críticas */}
      {metricas && metricas.planesRetrasados > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            ⚠️ {metricas.planesRetrasados} planes de acción retrasados requieren atención inmediata
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Planes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metricas?.planesTotal || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Planes de sucesión registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{metricas?.planesEnProgreso || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Planes activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metricas?.planesCompletados || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{porcentajeCompletados}% completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Retrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metricas?.planesRetrasados || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Requieren acción</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Planes */}
      <AlertasPlanes />

      {/* Planes de Acción Próximos a Vencer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Planes de Acción Próximos a Vencer
          </CardTitle>
          <CardDescription>Próximos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          {metricas?.accionesProximas && metricas.accionesProximas.length > 0 ? (
            <div className="space-y-3">
              {metricas.accionesProximas.map((accion) => (
                <div key={accion.id} className="border rounded-lg p-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{accion.titulo}</h4>
                    <p className="text-sm text-gray-600 mt-1">{accion.descripcion}</p>
                    <div className="flex gap-2 mt-2 text-xs text-gray-600">
                      <span>👤 {accion.responsable}</span>
                      <span>📅 {new Date(accion.fechaFin).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant="outline">{accion.estado}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No hay planes de acción próximos a vencer</p>
          )}
        </CardContent>
      </Card>

      {/* Resumen por Departamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cobertura por Departamento
          </CardTitle>
          <CardDescription>Distribución de planes de sucesión</CardDescription>
        </CardHeader>
        <CardContent>
          {resumenDepartamentos && resumenDepartamentos.length > 0 ? (
            <div className="space-y-4">
              {resumenDepartamentos.map((dept: any) => {
                const porcentajeCobertura = dept.total ? Math.round((dept.completados / dept.total) * 100) : 0;
                return (
                  <div key={dept.departamento} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{dept.departamento}</h4>
                        <p className="text-xs text-gray-600">
                          {dept.total} planes ({dept.criticos} críticos)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{porcentajeCobertura}%</p>
                        <p className="text-xs text-gray-600">{dept.completados} completados</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${porcentajeCobertura}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No hay datos de departamentos</p>
          )}
        </CardContent>
      </Card>

      {/* Indicadores de Riesgo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Riesgos Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {resumenDepartamentos?.reduce((sum: number, dept: any) => sum + (dept.criticos || 0), 0) || 0}
            </p>
            <p className="text-sm text-gray-600 mt-2">Puestos sin reemplazo disponible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Planes Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{porcentajeCompletados}%</p>
            <p className="text-sm text-gray-600 mt-2">Cobertura de sucesión organizacional</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PlanSuccesionDashboard() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
