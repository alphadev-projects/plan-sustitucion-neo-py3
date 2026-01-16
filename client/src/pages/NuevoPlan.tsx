import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NuevoPlan() {
  const [, setLocation] = useLocation();
  const [departamento, setDepartamento] = useState("");
  const [colaboradorId, setcolaboradorId] = useState("");
  const [departamentoReemplazo, setDepartamentoReemplazo] = useState("");
  const [reemplazoId, setReemplazoId] = useState("");
  const [puestoClave, setPuestoClave] = useState(false);

  const { data: departamentos } = trpc.empleados.departamentos.useQuery();
  const { data: colaboradors } = trpc.empleados.listByDepartamento.useQuery(
    { departamento },
    { enabled: !!departamento }
  );
  const { data: reemplazos } = trpc.empleados.listByDepartamento.useQuery(
    { departamento: departamentoReemplazo },
    { enabled: !!departamentoReemplazo }
  );

  const createPlan = trpc.planes.create.useMutation();

  const colaboradorSeleccionado = colaboradors?.find((e) => e.id === parseInt(colaboradorId));
  const reemplazoSeleccionado = reemplazos?.find((e) => e.id === parseInt(reemplazoId));
  const esNoAplica = reemplazoId === "NO_APLICA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!colaboradorSeleccionado) {
      alert("Por favor selecciona un colaborador");
      return;
    }

    if (!reemplazoId) {
      alert("Por favor selecciona un reemplazo o marca como NO APLICA");
      return;
    }

    try {
      await createPlan.mutateAsync({
        empleadoId: colaboradorSeleccionado.id,
        departamento: colaboradorSeleccionado.departamento,
        colaborador: colaboradorSeleccionado.nombre,
        cargo: colaboradorSeleccionado.cargo,
        departamentoReemplazo: esNoAplica ? "N/A" : reemplazoSeleccionado!.departamento,
        reemplazo: esNoAplica ? "NO APLICA" : reemplazoSeleccionado!.nombre,
        cargoReemplazo: esNoAplica ? "N/A" : reemplazoSeleccionado!.cargo,
        puestoClave: puestoClave ? "Si" : "No",
      });
      setLocation("/planes");
    } catch (error) {
      alert("Error al crear el plan");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/planes")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Plan de Sustitución</h1>
            <p className="text-muted-foreground mt-2">Crea un nuevo plan de sustitución para un colaborador</p>
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">📋 Instrucciones para crear un Plan de Sustitución</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800">
            <div>
              <p className="font-semibold">1. Selecciona el Departamento y Colaborador</p>
              <p className="text-blue-700">Elige el departamento donde trabaja el colaborador y luego selecciona su nombre de la lista.</p>
            </div>
            <div>
              <p className="font-semibold">2. Asigna un Reemplazo</p>
              <p className="text-blue-700">Selecciona el departamento del reemplazo y luego elige la persona que lo sustituirá. Si no hay reemplazo disponible, selecciona "NO APLICA".</p>
            </div>
            <div>
              <p className="font-semibold">3. Marca como Puesto Clave (Opcional)</p>
              <p className="text-blue-700">Si este puesto es crítico para la organización, activa el toggle "Marcar como puesto clave" para que los administradores estén alertas.</p>
            </div>
            <div>
              <p className="font-semibold">4. Guarda el Plan</p>
              <p className="text-blue-700">Haz clic en "Crear Plan" para guardar los cambios.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Plan</CardTitle>
            <CardDescription>Completa los datos del plan de sustitución</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento del Colaborador</Label>
                  <select
                    id="departamento"
                    value={departamento}
                    onChange={(e) => {
                      setDepartamento(e.target.value);
                      setcolaboradorId("");
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  >
                    <option value="">Selecciona un departamento</option>
                    {(departamentos || []).map((dept: string) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colaborador">Colaborador</Label>
                  <select
                    id="colaborador"
                    value={colaboradorId}
                    onChange={(e) => setcolaboradorId(e.target.value)}
                    disabled={!departamento}
                    className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50"
                  >
                    <option value="">Selecciona un colaborador</option>
                    {(colaboradors || []).map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {colaboradorSeleccionado && (
                <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Cargo</p>
                    <p className="font-medium">{colaboradorSeleccionado.cargo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Área</p>
                    <p className="font-medium">{colaboradorSeleccionado.area}</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Información del Reemplazo</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="deptReemplazo">Departamento del Reemplazo</Label>
                    <select
                      id="deptReemplazo"
                      value={departamentoReemplazo}
                      onChange={(e) => {
                        setDepartamentoReemplazo(e.target.value);
                        setReemplazoId("");
                      }}
                      disabled={esNoAplica}
                      className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50"
                    >
                      <option value="">Selecciona un departamento</option>
                      {(departamentos || []).map((dept: string) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reemplazo">Reemplazo</Label>
                    <select
                      id="reemplazo"
                      value={reemplazoId}
                      onChange={(e) => setReemplazoId(e.target.value)}
                      disabled={!departamentoReemplazo && !esNoAplica}
                      className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50"
                    >
                      <option value="">Selecciona un reemplazo</option>
                      <option value="NO_APLICA">NO APLICA - Sin reemplazo asignado</option>
                      {(reemplazos || []).map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {reemplazoSeleccionado && !esNoAplica && (
                  <div className="bg-accent/50 p-4 rounded-lg space-y-2 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cargo</p>
                      <p className="font-medium">{reemplazoSeleccionado.cargo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Área</p>
                      <p className="font-medium">{reemplazoSeleccionado.area}</p>
                    </div>
                  </div>
                )}

                {esNoAplica && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Este puesto actualmente no tiene reemplazo asignado
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-3">
                  <Switch
                    id="puestoClave"
                    checked={puestoClave}
                    onCheckedChange={setPuestoClave}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="puestoClave" className="cursor-pointer">Marcar como puesto clave</Label>
                    <p className="text-sm text-muted-foreground">Este es un puesto crítico para la organización</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/planes")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!colaboradorSeleccionado || !reemplazoId || createPlan.isPending}
                  className="gap-2"
                >
                  {createPlan.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear Plan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
