import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Edit2, Trash2, CheckCircle, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GestionPlanesAccion() {
  const [activeTab, setActiveTab] = useState<"sucesion" | "sustitucion">("sucesion");
  const [openDialogSucesion, setOpenDialogSucesion] = useState(false);
  const [openDialogSustitucion, setOpenDialogSustitucion] = useState(false);

  // Consultas para Planes de Acción de Sucesión
  const { data: planesAccionSucesion = [], isLoading: loadingSucesion } = 
    trpc.planesAccionSucesion?.listar?.useQuery?.() || { data: [], isLoading: false };

  const { data: puestosRequierenPlan = [], isLoading: loadingPuestos } = 
    trpc.planesAccionSucesion?.puestosRequierenPlan?.useQuery?.() || { data: [], isLoading: false };

  // Consultas para Planes de Acción de Sustitución
  const { data: planesRequierenAccion = [], isLoading: loadingPlanes } = 
    trpc.planesAccionSustitucion?.planesRequierenAccion?.useQuery?.() || { data: [], isLoading: false };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-green-500";
      case "En Progreso":
        return "bg-blue-500";
      case "Retrasado":
        return "bg-red-500";
      case "No Iniciado":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getProgresoColor = (progreso: number) => {
    if (progreso === 100) return "text-green-600";
    if (progreso >= 75) return "text-blue-600";
    if (progreso >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-bold">Gestión de Planes de Acción</h1>
          <p className="text-gray-600">Administra planes de acción para Sucesión y Sustitución</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "sucesion" | "sustitucion")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="sucesion">Planes de Sucesión</TabsTrigger>
            <TabsTrigger value="sustitucion">Planes de Sustitución</TabsTrigger>
          </TabsList>

          {/* Tab: Planes de Acción para Sucesión */}
          <TabsContent value="sucesion" className="space-y-6">
            {/* Sección: Puestos que requieren plan de acción */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Puestos Clave sin Sucesor (Requieren Plan de Acción)
                </CardTitle>
                <CardDescription>
                  {puestosRequierenPlan?.length || 0} puesto(s) requieren plan de acción
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPuestos ? (
                  <p>Cargando puestos...</p>
                ) : puestosRequierenPlan && puestosRequierenPlan.length > 0 ? (
                  <div className="space-y-3">
                    {puestosRequierenPlan.map((puesto: any) => (
                      <div key={puesto.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-yellow-200">
                        <div>
                          <p className="font-semibold">{puesto.puestoClave}</p>
                          <p className="text-sm text-gray-600">{puesto.departamentoPuestoClave}</p>
                        </div>
                        <Dialog open={openDialogSucesion} onOpenChange={setOpenDialogSucesion}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                              <Plus className="h-4 w-4" />
                              Crear Plan
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Crear Plan de Acción</DialogTitle>
                              <DialogDescription>
                                Puesto: {puesto.puestoClave}
                              </DialogDescription>
                            </DialogHeader>
                            <FormularioPlanAccionSucesion puestoId={puesto.id} onClose={() => setOpenDialogSucesion(false)} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      ¡Excelente! Todos los puestos clave tienen sucesores asignados.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Sección: Planes de Acción Existentes */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Planes de Acción Existentes</h2>
              {loadingSucesion ? (
                <div className="flex items-center justify-center p-8">
                  <p>Cargando planes de acción...</p>
                </div>
              ) : planesAccionSucesion && planesAccionSucesion.length > 0 ? (
                <div className="space-y-4">
                  {planesAccionSucesion.map((plan: any) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{plan.titulo}</CardTitle>
                            <CardDescription>{plan.descripcion}</CardDescription>
                          </div>
                          <Badge className={getEstadoColor(plan.estado)}>
                            {plan.estado}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Responsable</p>
                            <p className="font-semibold">{plan.responsable}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Progreso</p>
                            <p className={`font-semibold ${getProgresoColor(plan.progreso)}`}>
                              {plan.progreso}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Fecha Inicio</p>
                            <p className="font-semibold">
                              {new Date(plan.fechaInicio).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay planes de acción de sucesión registrados.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* Tab: Planes de Acción para Sustitución */}
          <TabsContent value="sustitucion" className="space-y-6">
            {/* Sección: Planes que requieren acción */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Planes sin Reemplazo (Requieren Plan de Acción)
                </CardTitle>
                <CardDescription>
                  {planesRequierenAccion?.length || 0} plan(es) requiere(n) plan de acción
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPlanes ? (
                  <p>Cargando planes...</p>
                ) : planesRequierenAccion && planesRequierenAccion.length > 0 ? (
                  <div className="space-y-3">
                    {planesRequierenAccion.map((plan: any) => (
                      <div key={plan.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-200">
                        <div>
                          <p className="font-semibold">{plan.colaborador}</p>
                          <p className="text-sm text-gray-600">{plan.cargo} - {plan.departamento}</p>
                        </div>
                        <Dialog open={openDialogSustitucion} onOpenChange={setOpenDialogSustitucion}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                              <Plus className="h-4 w-4" />
                              Crear Plan
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Crear Plan de Acción</DialogTitle>
                              <DialogDescription>
                                Colaborador: {plan.colaborador}
                              </DialogDescription>
                            </DialogHeader>
                            <FormularioPlanAccionSustitucion planId={plan.id} onClose={() => setOpenDialogSustitucion(false)} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      ¡Excelente! Todos los planes de sustitución tienen reemplazos asignados.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Componente: Formulario para crear plan de acción de Sucesión
function FormularioPlanAccionSucesion({ puestoId, onClose }: { puestoId: number; onClose: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [responsable, setResponsable] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la mutación para crear el plan
    console.log({ titulo, descripcion, responsable, fechaInicio, fechaFin });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Capacitación de sucesor"
          required
        />
      </div>
      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles del plan de acción"
        />
      </div>
      <div>
        <Label htmlFor="responsable">Responsable</Label>
        <Input
          id="responsable"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          placeholder="Nombre del responsable"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fechaInicio">Fecha Inicio</Label>
          <Input
            id="fechaInicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="fechaFin">Fecha Fin</Label>
          <Input
            id="fechaFin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Crear Plan</Button>
      </div>
    </form>
  );
}

// Componente: Formulario para crear plan de acción de Sustitución
function FormularioPlanAccionSustitucion({ planId, onClose }: { planId: number; onClose: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [responsable, setResponsable] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la mutación para crear el plan
    console.log({ titulo, descripcion, responsable, fechaInicio, fechaFin });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Búsqueda y selección de reemplazo"
          required
        />
      </div>
      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles del plan de acción"
        />
      </div>
      <div>
        <Label htmlFor="responsable">Responsable</Label>
        <Input
          id="responsable"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          placeholder="Nombre del responsable"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fechaInicio">Fecha Inicio</Label>
          <Input
            id="fechaInicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="fechaFin">Fecha Fin</Label>
          <Input
            id="fechaFin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Crear Plan</Button>
      </div>
    </form>
  );
}
