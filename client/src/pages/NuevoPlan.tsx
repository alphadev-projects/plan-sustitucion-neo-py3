import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";

type TipoReemplazo = "individual" | "pool";

export default function NuevoPlan() {
  const [, setLocation] = useLocation();
  const [tipoReemplazo, setTipoReemplazo] = useState<TipoReemplazo>("individual");
  const [departamento, setDepartamento] = useState("");
  const [colaboradorId, setcolaboradorId] = useState("");
  const [departamentoReemplazo, setDepartamentoReemplazo] = useState("");
  const [reemplazoId, setReemplazoId] = useState("");
  const [departamentoPoolReemplazo, setDepartamentoPoolReemplazo] = useState("");
  const [cargoPoolReemplazo, setCargoPoolReemplazo] = useState("");
  const [puestoClave, setPuestoClave] = useState(false);

  const { data: departamentos } = trpc.empleados.departamentos.useQuery();
  const { data: colaboradors } = trpc.empleados.listByDepartamento.useQuery(
    { departamento },
    { enabled: !!departamento }
  );
  const { data: reemplazos } = trpc.empleados.listByDepartamento.useQuery(
    { departamento: departamentoReemplazo },
    { enabled: !!departamentoReemplazo && tipoReemplazo === "individual" }
  );
  const { data: cargos } = trpc.empleados.cargos.useQuery();

  const createPlan = trpc.planes.create.useMutation();

  const colaboradorSeleccionado = colaboradors?.find((e) => e.id === parseInt(colaboradorId));
  const reemplazoSeleccionado = reemplazos?.find((e) => e.id === parseInt(reemplazoId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!colaboradorSeleccionado) {
      alert("Por favor selecciona un colaborador");
      return;
    }

    if (tipoReemplazo === "individual" && !reemplazoId) {
      alert("Por favor selecciona un reemplazo o marca como NO APLICA en el dropdown");
      return;
    }

    if (tipoReemplazo === "pool" && (!departamentoPoolReemplazo || !cargoPoolReemplazo)) {
      alert("Por favor selecciona departamento y cargo para el pool");
      return;
    }

    try {
      await createPlan.mutateAsync({
        empleadoId: colaboradorSeleccionado.id,
        departamento: colaboradorSeleccionado.departamento,
        colaborador: colaboradorSeleccionado.nombre,
        cargo: colaboradorSeleccionado.cargo,
        tipoReemplazo: tipoReemplazo,
        departamentoReemplazo: tipoReemplazo === "individual" 
          ? (reemplazoId === "NO_APLICA" ? "N/A" : reemplazoSeleccionado!.departamento)
          : departamentoPoolReemplazo,
        reemplazo: tipoReemplazo === "individual"
          ? (reemplazoId === "NO_APLICA" ? "NO APLICA" : reemplazoSeleccionado!.nombre)
          : undefined,
        cargoReemplazo: tipoReemplazo === "individual"
          ? (reemplazoId === "NO_APLICA" ? "N/A" : reemplazoSeleccionado!.cargo)
          : undefined,
        cargoPoolReemplazo: tipoReemplazo === "pool" ? cargoPoolReemplazo : undefined,
        departamentoPoolReemplazo: tipoReemplazo === "pool" ? departamentoPoolReemplazo : undefined,
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
              <p className="font-semibold">1. Selecciona el tipo de reemplazo</p>
              <p className="text-blue-700">Elige entre reemplazo individual (una persona específica), por pool/equipo (grupo de personas con el mismo cargo), o sin reemplazo.</p>
            </div>
            <div>
              <p className="font-semibold">2. Selecciona el Departamento y Colaborador</p>
              <p className="text-blue-700">Elige el departamento donde trabaja el colaborador y luego selecciona su nombre de la lista.</p>
            </div>
            <div>
              <p className="font-semibold">3. Asigna un Reemplazo</p>
              <p className="text-blue-700">Si seleccionaste reemplazo individual, elige la persona. Si es pool, selecciona el departamento y cargo del equipo de reemplazo.</p>
            </div>
            <div>
              <p className="font-semibold">4. Marca como Puesto Clave (Opcional)</p>
              <p className="text-blue-700">Si este puesto es crítico para la organización, activa el toggle "Marcar como puesto clave".</p>
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
              {/* Selector de tipo de reemplazo */}
              <div className="border-b pb-6">
                <Label className="text-base font-semibold mb-4 block">Tipo de Reemplazo</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div
                    onClick={() => setTipoReemplazo("individual")}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      tipoReemplazo === "individual"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold">👤 Individual</p>
                    <p className="text-sm text-muted-foreground">Asignar una persona específica como reemplazo</p>
                  </div>
                  <div
                    onClick={() => setTipoReemplazo("pool")}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      tipoReemplazo === "pool"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold">👥 Pool/Equipo</p>
                    <p className="text-sm text-muted-foreground">Asignar un grupo con funciones equivalentes</p>
                  </div>

                </div>
              </div>

              {/* Información del colaborador */}
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

              {/* Sección de reemplazo individual */}
              {tipoReemplazo === "individual" && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Información del Reemplazo Individual</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDepartamentoReemplazo("");
                        setReemplazoId("NO_APLICA");
                      }}
                      className="gap-2"
                    >
                      ❌ NO APLICA - SIN REEMPLAZO
                    </Button>
                  </div>

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
                      <Label htmlFor="reemplazo">Reemplazo</Label>
                      <select
                        id="reemplazo"
                        value={reemplazoId}
                        onChange={(e) => setReemplazoId(e.target.value)}
                        disabled={!departamentoReemplazo}
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

                  {reemplazoSeleccionado && reemplazoId !== "NO_APLICA" && (
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

                  {reemplazoId === "NO_APLICA" && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Este puesto actualmente no tiene reemplazo asignado
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sección de reemplazo por pool */}
              {tipoReemplazo === "pool" && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Información del Pool/Equipo de Reemplazo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Se registrarán automáticamente todos los colaboradores con el cargo seleccionado en el departamento indicado.
                  </p>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deptPoolReemplazo">Departamento del Pool</Label>
                      <select
                        id="deptPoolReemplazo"
                        value={departamentoPoolReemplazo}
                        onChange={(e) => setDepartamentoPoolReemplazo(e.target.value)}
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
                      <Label htmlFor="cargoPool">Cargo del Pool</Label>
                      <select
                        id="cargoPool"
                        value={cargoPoolReemplazo}
                        onChange={(e) => setCargoPoolReemplazo(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                      >
                        <option value="">Selecciona un cargo</option>
                        {(cargos || []).map((cargo: string) => (
                          <option key={cargo} value={cargo}>
                            {cargo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {departamentoPoolReemplazo && cargoPoolReemplazo && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-4">
                      <p className="text-sm text-green-800">
                        ✓ Se registrarán todos los colaboradores de <strong>{departamentoPoolReemplazo}</strong> con cargo <strong>{cargoPoolReemplazo}</strong> como reemplazos.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sección de puesto clave */}
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
                  disabled={!colaboradorSeleccionado || createPlan.isPending || (tipoReemplazo === "individual" && !reemplazoId) || (tipoReemplazo === "pool" && (!departamentoPoolReemplazo || !cargoPoolReemplazo))}
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
