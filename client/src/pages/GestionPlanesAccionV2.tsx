import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";
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
import { PlanAccionMaintenance } from "@/components/PlanAccionMaintenance";

export default function GestionPlanesAccionV2() {
  const [activeTab, setActiveTab] = useState<"sucesion" | "sustitucion">("sucesion");
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);

  // Consultas para Planes de Acción de Sucesión
  const { data: planesAccionSucesion = [], isLoading: loadingSucesion } = 
    trpc.planesAccionSucesion.listar.useQuery();

  const { data: puestosRequierenPlan = [], isLoading: loadingPuestos } = 
    trpc.planesAccionSucesion.puestosRequierenPlan.useQuery();

  // Consultas para Planes de Acción de Sustitución
  const { data: planesAccionSustitucion = [], isLoading: loadingSustitucion } = 
    trpc.planesAccionSustitucion.listar.useQuery();

  const { data: planesRequierenAccion = [], isLoading: loadingPlanes } = 
    trpc.planesAccionSustitucion.planesRequierenAccion.useQuery();

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-bold">Gestión de Planes de Acción</h1>
          <p className="text-gray-600">Administra planes de acción para Sucesión y Sustitución con comentarios y evidencias</p>
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
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Crear Plan
                        </Button>
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
                    <Card key={plan.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{plan.titulo}</CardTitle>
                            <CardDescription>{plan.descripcion}</CardDescription>
                          </div>
                          <Badge className={getEstadoColor(plan.estado)}>
                            {plan.estado}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <Badge variant="secondary">{plan.progreso}%</Badge>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${plan.progreso}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {expandedPlan === plan.id && (
                        <CardContent>
                          <PlanAccionMaintenance
                            planAccionId={plan.id}
                            titulo={plan.titulo}
                            descripcion={plan.descripcion}
                            responsable={plan.responsable}
                            fechaFin={new Date(plan.fechaFin)}
                            estado={plan.estado}
                            progreso={plan.progreso}
                          />
                        </CardContent>
                      )}
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
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Crear Plan
                        </Button>
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

            {/* Sección: Planes de Acción Existentes */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Planes de Acción Existentes</h2>
              {loadingSustitucion ? (
                <div className="flex items-center justify-center p-8">
                  <p>Cargando planes de acción...</p>
                </div>
              ) : planesAccionSustitucion && planesAccionSustitucion.length > 0 ? (
                <div className="space-y-4">
                  {planesAccionSustitucion.map((plan: any) => (
                    <Card key={plan.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{plan.titulo}</CardTitle>
                            <CardDescription>{plan.descripcion}</CardDescription>
                          </div>
                          <Badge className={getEstadoColor(plan.estado)}>
                            {plan.estado}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <Badge variant="secondary">{plan.progreso}%</Badge>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${plan.progreso}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {expandedPlan === plan.id && (
                        <CardContent>
                          <PlanAccionMaintenance
                            planAccionId={plan.id}
                            titulo={plan.titulo}
                            descripcion={plan.descripcion}
                            responsable={plan.responsable}
                            fechaFin={new Date(plan.fechaFin)}
                            estado={plan.estado}
                            progreso={plan.progreso}
                          />
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay planes de acción registrados aún.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
