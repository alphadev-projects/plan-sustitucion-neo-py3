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
  const [reemplazo1Id, setReemplazo1Id] = useState("");
  const [reemplazo2Id, setReemplazo2Id] = useState("");
  const [departamentoPoolReemplazo, setDepartamentoPoolReemplazo] = useState("");
  const [cargoPoolReemplazo, setCargoPoolReemplazo] = useState("");
  const [puestoClave, setPuestoClave] = useState(false);
  const [sucesorId, setSucesorId] = useState("");
  const [departamentoSucesor, setDepartamentoSucesor] = useState("");

  const { data: departamentos } = trpc.empleados.departamentos.useQuery();
  const { data: colaboradors } = trpc.empleados.listByDepartamento.useQuery(
    { departamento },
    { enabled: !!departamento }
  );
  const { data: reemplazos } = trpc.empleados.listByDepartamento.useQuery(
    { departamento: departamentoReemplazo },
    { enabled: !!departamentoReemplazo && tipoReemplazo === "individual" }
  );
  const { data: sucesores } = trpc.empleados.listByDepartamento.useQuery(
    { departamento: departamentoSucesor },
    { enabled: !!departamentoSucesor && puestoClave }
  );
  const { data: cargos } = trpc.empleados.cargos.useQuery();

  const utils = trpc.useUtils();
  
  // Mutation para registro individual con 2 reemplazos
  const createIndividual = trpc.planes.createIndividual.useMutation({
    onSuccess: async () => {
      await utils.planes.list.invalidate();
      await utils.sucesion.listar.invalidate();
      await utils.sucesion.criticos.invalidate();
    },
  });

  // Mutation para registro pool (mantener compatibilidad)
  const createPlan = trpc.planes.create.useMutation({
    onSuccess: async () => {
      await utils.planes.list.invalidate();
      await utils.sucesion.listar.invalidate();
      await utils.sucesion.criticos.invalidate();
    },
  });

  const colaboradorSeleccionado = colaboradors?.find((e) => e.id === parseInt(colaboradorId));
  const reemplazo1Seleccionado = reemplazos?.find((e) => e.id === parseInt(reemplazo1Id));
  const reemplazo2Seleccionado = reemplazos?.find((e) => e.id === parseInt(reemplazo2Id));
  const sucesorSeleccionado = sucesores?.find((e) => e.id === parseInt(sucesorId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!colaboradorSeleccionado) {
      alert("Por favor selecciona un colaborador");
      return;
    }

    if (tipoReemplazo === "pool" && (!departamentoPoolReemplazo || !cargoPoolReemplazo)) {
      alert("Por favor selecciona departamento y cargo para el pool");
      return;
    }

    // Validar sucesor si es puesto clave
    if (puestoClave && !sucesorId) {
      alert("Por favor selecciona un sucesor para este puesto clave");
      return;
    }

    try {
      if (tipoReemplazo === "individual") {
        // Usar nuevo procedure para registro individual
        await createIndividual.mutateAsync({
          empleadoId: colaboradorSeleccionado.id,
          departamento: colaboradorSeleccionado.departamento,
          colaborador: colaboradorSeleccionado.nombre,
          cargo: colaboradorSeleccionado.cargo,
          departamentoReemplazo: departamentoReemplazo,
          reemplazo1: reemplazo1Seleccionado?.nombre,
          reemplazo2: reemplazo2Seleccionado?.nombre,
          cargoReemplazo: reemplazo1Seleccionado?.cargo || "",
          puestoClave: puestoClave ? "Si" : "No",
          sucesor: sucesorSeleccionado?.nombre,
          departamentoSucesor: sucesorSeleccionado?.departamento,
          cargoSucesor: sucesorSeleccionado?.cargo,
        });
      } else {
        // Mantener procedure existente para pool
        await createPlan.mutateAsync({
          empleadoId: colaboradorSeleccionado.id,
          departamento: colaboradorSeleccionado.departamento,
          colaborador: colaboradorSeleccionado.nombre,
          cargo: colaboradorSeleccionado.cargo,
          tipoReemplazo: "pool",
          departamentoReemplazo: departamentoPoolReemplazo,
          cargoPoolReemplazo: cargoPoolReemplazo,
          departamentoPoolReemplazo: departamentoPoolReemplazo,
          puestoClave: puestoClave ? "Si" : "No",
        });
      }
      setLocation("/planes");
    } catch (error: any) {
      const errorMessage = error?.message || "Error al crear el plan";
      if (errorMessage.includes("ya esta registrado") || errorMessage.includes("duplicado")) {
        alert(`Validacion fallida:\n\n${errorMessage}\n\nPor favor, verifica que el colaborador no este registrado en otro plan.`);
      } else {
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const isLoading = createIndividual.isPending || createPlan.isPending;

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
              <p className="text-blue-700">Elige entre reemplazo individual (hasta 2 personas específicas) o por pool/equipo (grupo de personas con el mismo cargo).</p>
            </div>
            <div>
              <p className="font-semibold">2. Selecciona el Departamento y Colaborador</p>
              <p className="text-blue-700">Elige el departamento donde trabaja el colaborador y luego selecciona su nombre de la lista.</p>
            </div>
            <div>
              <p className="font-semibold">3. Asigna Reemplazos (Opcional)</p>
              <p className="text-blue-700">Para individual: puedes asignar hasta 2 reemplazos. Para pool: selecciona el departamento y cargo del equipo de reemplazo.</p>
            </div>
            <div>
              <p className="font-semibold">4. Marca como Puesto Clave (Opcional)</p>
              <p className="text-blue-700">Si este puesto es crítico para la organización, activa el toggle "Marcar como puesto clave". Esto habilitará la selección de sucesor.</p>
            </div>
            <div>
              <p className="font-semibold">5. Configura Sucesor (Si aplica)</p>
              <p className="text-blue-700">Si marcaste como puesto clave, selecciona UN sucesor para este puesto crítico.</p>
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div
                    onClick={() => setTipoReemplazo("individual")}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      tipoReemplazo === "individual"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold">👤 Individual</p>
                    <p className="text-sm text-muted-foreground">Asignar hasta 2 reemplazos específicos</p>
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
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    disabled={!departamento}
                  >
                    <option value="">Selecciona un colaborador</option>
                    {(colaboradors || []).map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombre} - {emp.cargo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sección de reemplazos - INDIVIDUAL */}
              {tipoReemplazo === "individual" && (
                <div className="border-t pt-6 space-y-6">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Reemplazos (Opcional):</strong> Puedes asignar hasta 2 reemplazos. Ambos son opcionales.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="departamentoReemplazo">Departamento de Reemplazos</Label>
                      <select
                        id="departamentoReemplazo"
                        value={departamentoReemplazo}
                        onChange={(e) => {
                          setDepartamentoReemplazo(e.target.value);
                          setReemplazo1Id("");
                          setReemplazo2Id("");
                        }}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                      >
                        <option value="">Selecciona departamento</option>
                        {(departamentos || []).map((dept: string) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {departamentoReemplazo && (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="reemplazo1">Reemplazo 1 (Opcional)</Label>
                        <select
                          id="reemplazo1"
                          value={reemplazo1Id}
                          onChange={(e) => setReemplazo1Id(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-background"
                        >
                          <option value="">Selecciona reemplazo 1</option>
                          {(reemplazos || []).map((emp: any) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.nombre} - {emp.cargo}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reemplazo2">Reemplazo 2 (Opcional)</Label>
                        <select
                          id="reemplazo2"
                          value={reemplazo2Id}
                          onChange={(e) => setReemplazo2Id(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-background"
                        >
                          <option value="">Selecciona reemplazo 2</option>
                          {(reemplazos || []).map((emp: any) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.nombre} - {emp.cargo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sección de reemplazos - POOL */}
              {tipoReemplazo === "pool" && (
                <div className="border-t pt-6 space-y-6">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Pool/Equipo:</strong> Se registrarán TODOS los colaboradores con el cargo seleccionado como reemplazos.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="departamentoPoolReemplazo">Departamento del Pool</Label>
                      <select
                        id="departamentoPoolReemplazo"
                        value={departamentoPoolReemplazo}
                        onChange={(e) => {
                          setDepartamentoPoolReemplazo(e.target.value);
                          setCargoPoolReemplazo("");
                        }}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                      >
                        <option value="">Selecciona departamento</option>
                        {(departamentos || []).map((dept: string) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cargoPoolReemplazo">Cargo del Pool</Label>
                      <select
                        id="cargoPoolReemplazo"
                        value={cargoPoolReemplazo}
                        onChange={(e) => setCargoPoolReemplazo(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                        disabled={!departamentoPoolReemplazo}
                      >
                        <option value="">Selecciona cargo</option>
                        {(cargos || []).map((cargo: string) => (
                          <option key={cargo} value={cargo}>
                            {cargo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Puesto Clave y Sucesor */}
              <div className="border-t pt-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div>
                    <Label className="text-base font-semibold">Marcar como Puesto Clave</Label>
                    <p className="text-sm text-muted-foreground mt-1">Este es un puesto crítico para la organización</p>
                  </div>
                  <Switch
                    checked={puestoClave}
                    onCheckedChange={setPuestoClave}
                  />
                </div>

                {puestoClave && (
                  <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Selecciona Sucesor</Label>
                      <p className="text-sm text-muted-foreground">Elige UN sucesor para este puesto clave</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="departamentoSucesor">Departamento del Sucesor</Label>
                        <select
                          id="departamentoSucesor"
                          value={departamentoSucesor}
                          onChange={(e) => {
                            setDepartamentoSucesor(e.target.value);
                            setSucesorId("");
                          }}
                          className="w-full px-3 py-2 border rounded-lg bg-background"
                        >
                          <option value="">Selecciona departamento</option>
                          {(departamentos || []).map((dept: string) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sucesor">Sucesor</Label>
                        <select
                          id="sucesor"
                          value={sucesorId}
                          onChange={(e) => setSucesorId(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-background"
                          disabled={!departamentoSucesor}
                        >
                          <option value="">Selecciona sucesor</option>
                          {(sucesores || []).map((emp: any) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.nombre} - {emp.cargo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/planes")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Creando..." : "Crear Plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
