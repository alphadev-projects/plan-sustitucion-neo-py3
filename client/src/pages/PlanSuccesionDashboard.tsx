import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function PlanSuccesionDashboard() {
  const { data: planes, isLoading, refetch } = trpc.sucesion.listar.useQuery();
  const actualizarRiesgo = trpc.sucesion.actualizarRiesgo.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [nuevoRiesgo, setNuevoRiesgo] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Helper: Verificar si un reemplazo es válido (no vacío y no NO APLICA)
  const esReemplazoValido = (reemplazo: string | null | undefined): boolean => {
    if (!reemplazo) return false;
    const trimmed = reemplazo.trim().toUpperCase();
    return trimmed !== "" && trimmed !== "NO APLICA";
  };

  // Matriz de Criticidad SIMPLIFICADA (2x2)
  // Solo dos estados: CRÍTICO (Alto Riesgo + Sin Cobertura) y CONTROLADO (Bajo Riesgo + Con Cobertura)
  const criticidad = {
    critico: planes.filter((p: any) => p.riesgoContinuidad === "Alto" && !esReemplazoValido(p.reemplazo)).length,
    controlado: planes.filter((p: any) => p.riesgoContinuidad === "Bajo" && esReemplazoValido(p.reemplazo)).length,
  };

  // Separar por cobertura para las secciones de listado
  const planesConCobertura = planes.filter((p: any) => esReemplazoValido(p.reemplazo));
  const planesSinCobertura = planes.filter((p: any) => !esReemplazoValido(p.reemplazo));

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
              <div className="text-2xl font-bold text-green-700">{planesConCobertura.length}</div>
              <p className="text-xs text-green-600 mt-1">Riesgo Bajo</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Sin Cobertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{planesSinCobertura.length}</div>
              <p className="text-xs text-red-600 mt-1">Riesgo Alto</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">% Cobertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {planes.length > 0 ? Math.round((planesConCobertura.length / planes.length) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Puestos cubiertos</p>
            </CardContent>
          </Card>
        </div>

        {/* Matriz de Criticidad SIMPLIFICADA (2x2) */}
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Criticidad</CardTitle>
            <CardDescription>Clasificación de puestos por riesgo y cobertura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* CRÍTICO (Rojo) */}
              <div className="border-2 border-red-300 bg-red-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <h3 className="font-bold text-red-900 text-lg">CRÍTICO</h3>
                </div>
                <p className="text-4xl font-bold text-red-700 mb-3">{criticidad.critico}</p>
                <p className="text-sm text-red-600 mb-1">Alto Riesgo + Sin Cobertura</p>
                <p className="text-sm text-red-600 font-semibold">⚠️ Acción Inmediata Requerida</p>
              </div>

              {/* CONTROLADO (Verde) */}
              <div className="border-2 border-green-300 bg-green-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="font-bold text-green-900 text-lg">CONTROLADO</h3>
                </div>
                <p className="text-4xl font-bold text-green-700 mb-3">{criticidad.controlado}</p>
                <p className="text-sm text-green-600 mb-1">Bajo Riesgo + Con Cobertura</p>
                <p className="text-sm text-green-600 font-semibold">✓ Excelente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección: Puestos CON Cobertura (CONTROLADO) */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-900">✓ Puestos Críticos CON Reemplazo (CONTROLADO)</CardTitle>
            <CardDescription>Posiciones con cobertura identificada - Riesgo Bajo</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {planesConCobertura.length > 0 ? (
              <div className="space-y-2">
                {planesConCobertura.map((plan: any) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                    <div>
                      <p className="font-medium">{plan.colaborador}</p>
                      <p className="text-sm text-gray-600">{plan.cargo}</p>
                      <p className="text-xs text-gray-500">{plan.departamento}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <Badge className="bg-green-600">Reemplazo: {plan.reemplazo}</Badge>
                        <p className="text-xs text-gray-500 mt-1">Riesgo: {plan.riesgoContinuidad}</p>
                      </div>
                      <Dialog open={isDialogOpen && selectedPlan?.id === plan.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) {
                          setSelectedPlan(plan);
                          setNuevoRiesgo(plan.riesgoContinuidad);
                          setMotivo("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedPlan(plan);
                            setNuevoRiesgo(plan.riesgoContinuidad);
                            setMotivo("");
                            setIsDialogOpen(true);
                          }}>Editar</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Actualizar Riesgo de Continuidad</DialogTitle>
                            <DialogDescription>
                              Puesto: {selectedPlan?.colaborador} - {selectedPlan?.cargo}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Nuevo Riesgo</label>
                              <Select value={nuevoRiesgo} onValueChange={setNuevoRiesgo}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Alto">Alto</SelectItem>
                                  <SelectItem value="Bajo">Bajo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Motivo (opcional)</label>
                              <Textarea
                                placeholder="Ej: Plan de acción concluido, reemplazo identificado..."
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                              <Button
                                onClick={() => {
                                  if (selectedPlan && nuevoRiesgo) {
                                    actualizarRiesgo.mutate({
                                      id: selectedPlan.id,
                                      nuevoRiesgo: nuevoRiesgo as "Alto" | "Bajo",
                                      motivo: motivo || undefined,
                                    });
                                    setIsDialogOpen(false);
                                  }
                                }}
                                disabled={actualizarRiesgo.isPending}
                              >
                                {actualizarRiesgo.isPending ? "Actualizando..." : "Actualizar"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay puestos críticos con cobertura</p>
            )}
          </CardContent>
        </Card>

        {/* Sección: Puestos SIN Cobertura (CRÍTICO) */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-900">⚠️ Puestos Críticos SIN Reemplazo (CRÍTICO)</CardTitle>
            <CardDescription>Posiciones que requieren atención inmediata - Riesgo Alto</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {planesSinCobertura.length > 0 ? (
              <div className="space-y-2">
                {planesSinCobertura.map((plan: any) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                    <div>
                      <p className="font-medium">{plan.colaborador}</p>
                      <p className="text-sm text-gray-600">{plan.cargo}</p>
                      <p className="text-xs text-gray-500">{plan.departamento}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <Badge className="bg-red-600">Sin Reemplazo</Badge>
                        <p className="text-xs text-gray-500 mt-1">Riesgo: {plan.riesgoContinuidad}</p>
                      </div>
                      <Dialog open={isDialogOpen && selectedPlan?.id === plan.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) {
                          setSelectedPlan(plan);
                          setNuevoRiesgo(plan.riesgoContinuidad);
                          setMotivo("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedPlan(plan);
                            setNuevoRiesgo(plan.riesgoContinuidad);
                            setMotivo("");
                            setIsDialogOpen(true);
                          }}>Editar</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Actualizar Riesgo de Continuidad</DialogTitle>
                            <DialogDescription>
                              Puesto: {selectedPlan?.colaborador} - {selectedPlan?.cargo}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Nuevo Riesgo</label>
                              <Select value={nuevoRiesgo} onValueChange={setNuevoRiesgo}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Alto">Alto</SelectItem>
                                  <SelectItem value="Bajo">Bajo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Motivo (opcional)</label>
                              <Textarea
                                placeholder="Ej: Plan de acción concluido, reemplazo identificado..."
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                              <Button
                                onClick={() => {
                                  if (selectedPlan && nuevoRiesgo) {
                                    actualizarRiesgo.mutate({
                                      id: selectedPlan.id,
                                      nuevoRiesgo: nuevoRiesgo as "Alto" | "Bajo",
                                      motivo: motivo || undefined,
                                    });
                                    setIsDialogOpen(false);
                                  }
                                }}
                                disabled={actualizarRiesgo.isPending}
                              >
                                {actualizarRiesgo.isPending ? "Actualizando..." : "Actualizar"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
