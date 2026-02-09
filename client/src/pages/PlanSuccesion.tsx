import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Edit2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/DashboardLayout";

function PlanSuccesionContent() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);


  // Queries
  const { data: planesSuccesion, isLoading: loadingPlanes, error: errorPlanes } = trpc.sucesion.listar.useQuery();
  const { data: planesCriticos, error: errorCriticos } = trpc.sucesion.criticos.useQuery();
  // Mutations
  const utils = trpc.useUtils();

  const getRiskBadgeColor = (riesgo: string) => {
    switch (riesgo) {
      case "Alto":
        return "bg-red-100 text-red-800";
      case "Medio":
        return "bg-yellow-100 text-yellow-800";
      case "Bajo":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeColor = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":
        return "bg-red-100 text-red-800";
      case "Media":
        return "bg-orange-100 text-orange-800";
      case "Baja":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loadingPlanes) {
    return <div className="p-6">Cargando planes de sucesión...</div>;
  }

  if (errorPlanes) {
    return (
      <Alert className="border-red-200 bg-red-50 m-6">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Error al cargar planes: {errorPlanes.message}
        </AlertDescription>
      </Alert>
    );
  }

  const planSeleccionado = planesSuccesion?.find((p) => p.id === selectedPlan);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Plan de Sucesión</h1>
        <p className="text-gray-600 mt-2">Gestiona planes de sucesión para puestos críticos</p>
      </div>

      {/* Resumen de Puestos Críticos */}
      {planesCriticos && planesCriticos.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Hay {planesCriticos.length} puestos críticos que requieren atención inmediata
          </AlertDescription>
        </Alert>
      )}

      {!planesSuccesion || planesSuccesion.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No hay planes de sucesión registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Planes */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Puestos Críticos</CardTitle>
                <CardDescription>{planesSuccesion?.length || 0} planes registrados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {planesSuccesion?.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPlan === plan.id
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-sm">{plan.puestoClave}</div>
                    <div className="text-xs text-gray-600">{plan.cargoPuestoClave}</div>
                    <div className="flex gap-1 mt-2">
                      <Badge className={plan.sucesor ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {plan.sucesor ? 'Con Sucesor' : 'Sin Sucesor'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Detalle del Plan */}
          <div className="lg:col-span-2 space-y-6">
            {planSeleccionado ? (
              <>
                {/* Información del Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle>{planSeleccionado.puestoClave}</CardTitle>
                    <CardDescription>{planSeleccionado.cargoPuestoClave}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Departamento</label>
                        <p className="text-sm">{planSeleccionado.departamentoPuestoClave || "No especificado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Estado</label>
                        <Badge className="mt-1">{planSeleccionado.sucesor ? "Con Sucesor" : "Sin Sucesor"}</Badge>
                      </div>
                    </div>
                    {planSeleccionado.sucesor ? (
                      <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                        <h4 className="font-semibold text-green-900 mb-3">Sucesor Identificado</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Nombre</label>
                            <p className="text-sm font-medium">{planSeleccionado.sucesor}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Cargo</label>
                            <p className="text-sm">{planSeleccionado.cargoSucesor || "No especificado"}</p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs font-medium text-gray-600">Departamento</label>
                            <p className="text-sm">{planSeleccionado.departamentoSucesor || "No especificado"}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Este es un puesto crítico sin reemplazo disponible
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>


              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">Selecciona un puesto crítico para ver detalles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanSuccesion() {
  return (
    <DashboardLayout>
      <PlanSuccesionContent />
    </DashboardLayout>
  );
}
