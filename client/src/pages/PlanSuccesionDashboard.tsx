import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useState, useMemo } from "react";
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
import { trpc } from "@/lib/trpc";

// Helper: Verificar si un sucesor es válido (no vacío y no NO APLICA)
const esSucesorValido = (sucesor: string | null | undefined): boolean => {
  if (!sucesor) return false;
  const trimmed = sucesor.trim().toUpperCase();
  return trimmed !== "" && trimmed !== "NO APLICA";
};

export default function PlanSuccesionDashboard() {
  // Usar el nuevo procedimiento que trae datos de sucesion_puestos
  const { data: planes, isLoading, refetch } = trpc.sucesion.listarConSucesor.useQuery();
  const actualizarRiesgo = trpc.sucesion.actualizarRiesgo.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [nuevoRiesgo, setNuevoRiesgo] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [departamentoFiltro, setDepartamentoFiltro] = useState<string>("Todos");

  // Obtener lista de departamentos únicos
  const departamentos = useMemo(() => {
    if (!planes) return ["Todos"];
    const depts = new Set(planes.map((p: any) => p.departamentoPuestoClave));
    return ["Todos", ...Array.from(depts).sort()];
  }, [planes]);

  // Filtrar planes por departamento
  const planesFiltrados = useMemo(() => {
    if (!planes) return [];
    if (departamentoFiltro === "Todos") {
      return planes;
    }
    return planes.filter((p: any) => p.departamentoPuestoClave === departamentoFiltro);
  }, [planes, departamentoFiltro]);

  // Matriz de Criticidad SIMPLIFICADA (2x2)
  // CRÍTICO: Sin sucesor
  // CONTROLADO: Con sucesor
  const criticidad = useMemo(() => {
    return {
      critico: planesFiltrados.filter((p: any) => !esSucesorValido(p.sucesor)).length,
      controlado: planesFiltrados.filter((p: any) => esSucesorValido(p.sucesor)).length,
    };
  }, [planesFiltrados]);

  // Separar por cobertura para las secciones de listado
  const planesConSucesor = useMemo(() => {
    return planesFiltrados.filter((p: any) => esSucesorValido(p.sucesor));
  }, [planesFiltrados]);

  const planesSinSucesor = useMemo(() => {
    return planesFiltrados.filter((p: any) => !esSucesorValido(p.sucesor));
  }, [planesFiltrados]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = planesFiltrados.length;
    const conCobertura = planesConSucesor.length;
    const sinCobertura = planesSinSucesor.length;
    const porcentajeCobertura = total > 0 ? Math.round((conCobertura / total) * 100) : 0;
    return { total, conCobertura, sinCobertura, porcentajeCobertura };
  }, [planesFiltrados, planesConSucesor, planesSinSucesor]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Cargando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-bold">Matriz de Criticidad</h1>
          <p className="text-gray-600">Clasificación de puestos por riesgo y cobertura de sucesión</p>
        </div>

        {/* Filtro por Departamento */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Departamento:</label>
          <Select value={departamentoFiltro} onValueChange={setDepartamentoFiltro}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departamentos.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Puestos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total}</div>
              <p className="text-xs text-gray-500">Críticos identificados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Con Sucesor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.conCobertura}</div>
              <p className="text-xs text-gray-500">Cobertura asignada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sin Sucesor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estadisticas.sinCobertura}</div>
              <p className="text-xs text-gray-500">Requieren atención</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">% Cobertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.porcentajeCobertura}%</div>
              <p className="text-xs text-gray-500">De sucesión</p>
            </CardContent>
          </Card>
        </div>

        {/* Matriz 2x2 */}
        <div className="grid grid-cols-2 gap-4">
          {/* CRÍTICO */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-700">CRÍTICO</CardTitle>
              </div>
              <CardDescription className="text-red-600">Sin Sucesor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">{criticidad.critico}</div>
              <p className="text-sm text-red-700">⚠️ Acción Inmediata Requerida</p>
            </CardContent>
          </Card>

          {/* CONTROLADO */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <CardTitle className="text-green-700">CONTROLADO</CardTitle>
              </div>
              <CardDescription className="text-green-600">Con Sucesor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">{criticidad.controlado}</div>
              <p className="text-sm text-green-700">✓ Excelente</p>
            </CardContent>
          </Card>
        </div>

        {/* Sección: Puestos CON Sucesor (CONTROLADO) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Puestos con Sucesor Asignado</CardTitle>
            <CardDescription>Posiciones con cobertura de sucesión</CardDescription>
          </CardHeader>
          <CardContent>
            {planesConSucesor.length === 0 ? (
              <p className="text-gray-500">No hay puestos con sucesor asignado</p>
            ) : (
              <div className="space-y-4">
                {planesConSucesor.map((plan: any) => (
                  <div key={plan.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Puesto Clave</p>
                        <p className="font-semibold">{plan.puestoClave}</p>
                        <p className="text-xs text-gray-500">{plan.cargoPuestoClave}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sucesor</p>
                        <p className="font-semibold text-green-700">{plan.sucesor}</p>
                        <p className="text-xs text-gray-500">{plan.cargoSucesor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Departamento</p>
                        <p className="font-semibold">{plan.departamentoPuestoClave}</p>
                        <Badge className="mt-2 bg-green-600">Controlado</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección: Puestos SIN Sucesor (CRÍTICO) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Puestos sin Sucesor - Acción Requerida</CardTitle>
            <CardDescription>Posiciones críticas que requieren atención inmediata</CardDescription>
          </CardHeader>
          <CardContent>
            {planesSinSucesor.length === 0 ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  ¡Excelente! Todos los puestos críticos tienen sucesor asignado.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {planesSinSucesor.map((plan: any) => (
                  <div key={plan.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Puesto Clave</p>
                        <p className="font-semibold">{plan.puestoClave}</p>
                        <p className="text-xs text-gray-500">{plan.cargoPuestoClave}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Departamento</p>
                        <p className="font-semibold">{plan.departamentoPuestoClave}</p>
                        <Badge className="mt-2 bg-red-600">Crítico</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Estado</p>
                        <p className="font-semibold text-red-700">Sin Sucesor</p>
                      </div>
                    </div>
                    <Dialog open={isDialogOpen && selectedPlan?.id === plan.id} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setNuevoRiesgo("");
                            setMotivo("");
                          }}
                        >
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Riesgo de Continuidad</DialogTitle>
                          <DialogDescription>
                            Puesto: {selectedPlan?.puestoClave}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Nuevo Riesgo</label>
                            <Select value={nuevoRiesgo} onValueChange={setNuevoRiesgo}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar riesgo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Alto">Alto</SelectItem>
                                <SelectItem value="Medio">Medio</SelectItem>
                                <SelectItem value="Bajo">Bajo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Motivo (opcional)</label>
                            <Textarea
                              placeholder="Describe el motivo del cambio..."
                              value={motivo}
                              onChange={(e) => setMotivo(e.target.value)}
                            />
                          </div>
                          <Button
                            onClick={() => {
                              if (selectedPlan && nuevoRiesgo) {
                                actualizarRiesgo.mutate({
                                  id: selectedPlan.id,
                                  nuevoRiesgo: nuevoRiesgo as "Alto" | "Medio" | "Bajo",
                                  motivo: motivo || undefined,
                                });
                                setIsDialogOpen(false);
                              }
                            }}
                            disabled={!nuevoRiesgo || actualizarRiesgo.isPending}
                          >
                            {actualizarRiesgo.isPending ? "Actualizando..." : "Actualizar"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
