import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Plus, Clock, Edit2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/DashboardLayout";
import { PlanAccionMaintenance } from "@/components/PlanAccionMaintenance";
import { BotonDescargarReporte } from "@/components/BotonDescargarReporte";

function PlanSuccesionContent() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showNewActionDialog, setShowNewActionDialog] = useState(false);
  const [newActionData, setNewActionData] = useState({
    titulo: "",
    descripcion: "",
    responsable: "",
    fechaInicio: "",
    fechaFin: "",
  });

  // Queries
  const { data: planesSuccesion, isLoading: loadingPlanes, error: errorPlanes } = trpc.sucesion.listar.useQuery();
  const { data: planesCriticos, error: errorCriticos } = trpc.sucesion.criticos.useQuery();
  const { data: planesAccion, refetch: refetchAcciones } = trpc.sucesion.accionesListar.useQuery(
    { planSuccesionId: selectedPlan || 0 },
    { enabled: !!selectedPlan }
  );

  // Mutations
  const crearAccion = trpc.sucesion.accionCrear.useMutation();
  const utils = trpc.useUtils();

  const handleCreateAction = async () => {
    if (!selectedPlan || !newActionData.titulo) return;

    try {
      await crearAccion.mutateAsync({
        planSuccesionId: selectedPlan,
        titulo: newActionData.titulo,
        descripcion: newActionData.descripcion,
        responsable: newActionData.responsable,
        fechaInicio: new Date(newActionData.fechaInicio),
        fechaFin: new Date(newActionData.fechaFin),
      });

      setNewActionData({ titulo: "", descripcion: "", responsable: "", fechaInicio: "", fechaFin: "" });
      setShowNewActionDialog(false);
      refetchAcciones();
    } catch (error) {
      console.error("Error creating action:", error);
    }
  };

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
                    <CardTitle>{planSeleccionado.colaborador}</CardTitle>
                    <CardDescription>{planSeleccionado.cargo}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Departamento</label>
                        <p className="text-sm">{planSeleccionado.departamento}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Estado</label>
                        <Badge className="mt-1">{planSeleccionado.estado}</Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Riesgo de Continuidad</label>
                        <Badge className={`mt-1 ${getRiskBadgeColor(planSeleccionado.riesgoContinuidad)}`}>
                          {planSeleccionado.riesgoContinuidad}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Prioridad</label>
                        <Badge className={`mt-1 ${getPriorityBadgeColor(planSeleccionado.prioridadSucesion)}`}>
                          {planSeleccionado.prioridadSucesion}
                        </Badge>
                      </div>
                    </div>
                    {!planSeleccionado.reemplazo && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Este es un puesto crítico sin reemplazo disponible
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Planes de Acción */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Planes de Acción</CardTitle>
                      <CardDescription>Actividades para desarrollar reemplazos</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <BotonDescargarReporte 
                        planAccionId={selectedPlan || 0} 
                        titulo={`Reporte Plan ${selectedPlan}`}
                        tipo="csv"
                      />
                      <Dialog open={showNewActionDialog} onOpenChange={setShowNewActionDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo Plan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Plan de Acción</DialogTitle>
                          <DialogDescription>
                            Define una actividad para desarrollar al reemplazo
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Título</Label>
                            <Input
                              value={newActionData.titulo}
                              onChange={(e) =>
                                setNewActionData({ ...newActionData, titulo: e.target.value })
                              }
                              placeholder="Ej: Capacitación en liderazgo"
                            />
                          </div>
                          <div>
                            <Label>Descripción</Label>
                            <Textarea
                              value={newActionData.descripcion}
                              onChange={(e) =>
                                setNewActionData({ ...newActionData, descripcion: e.target.value })
                              }
                              placeholder="Detalles de la actividad"
                            />
                          </div>
                          <div>
                            <Label>Responsable</Label>
                            <Input
                              value={newActionData.responsable}
                              onChange={(e) =>
                                setNewActionData({ ...newActionData, responsable: e.target.value })
                              }
                              placeholder="Nombre del responsable"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Fecha Inicio</Label>
                              <Input
                                type="date"
                                value={newActionData.fechaInicio}
                                onChange={(e) =>
                                  setNewActionData({ ...newActionData, fechaInicio: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Fecha Fin</Label>
                              <Input
                                type="date"
                                value={newActionData.fechaFin}
                                onChange={(e) =>
                                  setNewActionData({ ...newActionData, fechaFin: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <Button onClick={handleCreateAction} className="w-full">
                            Crear Plan
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {planesAccion && planesAccion.length > 0 ? (
                      <div className="space-y-4">
                        {planesAccion.map((accion) => (
                          <PlanAccionMaintenance
                            key={accion.id}
                            planAccionId={accion.id}
                            titulo={accion.titulo}
                            descripcion={accion.descripcion}
                            responsable={accion.responsable}
                            fechaFin={accion.fechaFin}
                            estado={accion.estado}
                            progreso={accion.progreso}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No hay planes de acción aún</p>
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
