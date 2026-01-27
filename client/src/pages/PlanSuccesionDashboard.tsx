import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function PlanSuccesionDashboard() {
  const { data: planes, isLoading } = trpc.sucesion.listar.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">Cargando dashboard...</div>
      </DashboardLayout>
    );
  }

  if (!planes) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">No hay datos disponibles</div>
      </DashboardLayout>
    );
  }

  // Separar por riesgo
  const planesRiesgoBajo = planes.filter((p: any) => p.riesgoContinuidad === "Bajo");
  const planesRiesgoAlto = planes.filter((p: any) => p.riesgoContinuidad === "Alto");

  // Matriz de Criticidad (2x2)
  const criticidad = {
    critico: planesRiesgoAlto.length, // Alto riesgo + sin cobertura
    controlado: planesRiesgoBajo.length, // Alto riesgo + con cobertura
    vigilancia: 0, // Bajo riesgo + sin cobertura
    optimo: 0, // Bajo riesgo + con cobertura
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard - Plan de Sucesión</h1>
          <p className="text-gray-600 mt-2">Análisis de cobertura de puestos críticos</p>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Puestos Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{planes.length}</div>
              <p className="text-xs text-gray-500 mt-1">Posiciones críticas</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Con Cobertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{planesRiesgoBajo.length}</div>
              <p className="text-xs text-green-600 mt-1">Riesgo Bajo</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Sin Cobertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{planesRiesgoAlto.length}</div>
              <p className="text-xs text-red-600 mt-1">Riesgo Alto</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">% Cobertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {planes.length > 0 ? Math.round((planesRiesgoBajo.length / planes.length) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Puestos cubiertos</p>
            </CardContent>
          </Card>
        </div>

        {/* Matriz de Criticidad 2x2 */}
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Criticidad</CardTitle>
            <CardDescription>Clasificación de puestos por riesgo y cobertura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Cuadrante 1: CRÍTICO (Rojo) */}
              <div className="border-2 border-red-300 bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="font-bold text-red-900">CRÍTICO</h3>
                </div>
                <p className="text-2xl font-bold text-red-700">{criticidad.critico}</p>
                <p className="text-xs text-red-600 mt-2">Alto Riesgo + Sin Cobertura</p>
                <p className="text-xs text-red-600">⚠️ Acción Inmediata Requerida</p>
              </div>

              {/* Cuadrante 2: CONTROLADO (Verde) */}
              <div className="border-2 border-green-300 bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-green-900">CONTROLADO</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">{criticidad.controlado}</p>
                <p className="text-xs text-green-600 mt-2">Alto Riesgo + Con Cobertura</p>
                <p className="text-xs text-green-600">✓ Bajo Riesgo</p>
              </div>

              {/* Cuadrante 3: VIGILANCIA (Amarillo) */}
              <div className="border-2 border-yellow-300 bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-bold text-yellow-900">VIGILANCIA</h3>
                </div>
                <p className="text-2xl font-bold text-yellow-700">{criticidad.vigilancia}</p>
                <p className="text-xs text-yellow-600 mt-2">Bajo Riesgo + Sin Cobertura</p>
                <p className="text-xs text-yellow-600">📊 Monitorear</p>
              </div>

              {/* Cuadrante 4: ÓPTIMO (Azul) */}
              <div className="border-2 border-blue-300 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900">ÓPTIMO</h3>
                </div>
                <p className="text-2xl font-bold text-blue-700">{criticidad.optimo}</p>
                <p className="text-xs text-blue-600 mt-2">Bajo Riesgo + Con Cobertura</p>
                <p className="text-xs text-blue-600">✓ Excelente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección: Puestos con Riesgo Bajo (Con Cobertura) */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-900">✓ Puestos Críticos CON Reemplazo (Riesgo Bajo)</CardTitle>
            <CardDescription>Posiciones con cobertura identificada</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {planesRiesgoBajo.length > 0 ? (
              <div className="space-y-2">
                {planesRiesgoBajo.map((plan: any) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                    <div>
                      <p className="font-medium">{plan.colaborador}</p>
                      <p className="text-sm text-gray-600">{plan.cargo}</p>
                      <p className="text-xs text-gray-500">{plan.departamento}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-600">Reemplazo: {plan.reemplazo}</Badge>
                      <p className="text-xs text-gray-500 mt-1">Riesgo: Bajo</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay puestos críticos con cobertura</p>
            )}
          </CardContent>
        </Card>

        {/* Sección: Puestos con Riesgo Alto (Sin Cobertura) */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-900">⚠️ Puestos Críticos SIN Reemplazo (Riesgo Alto)</CardTitle>
            <CardDescription>Posiciones que requieren atención inmediata</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {planesRiesgoAlto.length > 0 ? (
              <div className="space-y-2">
                {planesRiesgoAlto.map((plan: any) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                    <div>
                      <p className="font-medium">{plan.colaborador}</p>
                      <p className="text-sm text-gray-600">{plan.cargo}</p>
                      <p className="text-xs text-gray-500">{plan.departamento}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-600">Sin Reemplazo</Badge>
                      <p className="text-xs text-gray-500 mt-1">Riesgo: Alto</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">¡Excelente! Todos los puestos críticos tienen cobertura</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
