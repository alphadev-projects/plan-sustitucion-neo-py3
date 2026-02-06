import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Edit2, Trash2, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function GestionPlanesAccion() {
  const [activeTab, setActiveTab] = useState<"sucesion" | "sustitucion">("sucesion");

  // Consultas para Planes de Acción de Sucesión
  const { data: planesAccionSucesion = [], isLoading: loadingSucesion } = { data: [], isLoading: false };

  // Consultas para Planes de Acción de Sustitución
  const { data: planesAccionSustitucion = [], isLoading: loadingSustitucion } = { data: [], isLoading: false };

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
          <TabsContent value="sucesion" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Planes de Acción - Sucesión</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Plan
              </Button>
            </div>

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
                  No hay planes de acción de sucesión registrados. Crea uno para comenzar.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Tab: Planes de Acción para Sustitución */}
          <TabsContent value="sustitucion" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Planes de Acción - Sustitución</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Plan
              </Button>
            </div>

            {loadingSustitucion ? (
              <div className="flex items-center justify-center p-8">
                <p>Cargando planes de acción...</p>
              </div>
            ) : planesAccionSustitucion && planesAccionSustitucion.length > 0 ? (
              <div className="space-y-4">
                {planesAccionSustitucion.map((plan: any) => (
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
                  No hay planes de acción de sustitución registrados. Crea uno para comenzar.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
