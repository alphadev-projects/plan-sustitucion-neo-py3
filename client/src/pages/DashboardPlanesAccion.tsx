import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPlanesAccion() {
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "sucesion" | "sustitucion">("todos");
  const [departamentoFiltro, setDepartamentoFiltro] = useState<string>("todos");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");

  // Consultas
  const { data: planesAccionSucesion = [] } = trpc.planesAccionSucesion.listar.useQuery();
  const { data: planesAccionSustitucion = [] } = trpc.planesAccionSustitucion.listar.useQuery();

  // Combinar y filtrar planes
  const todosLosPlanes = [
    ...planesAccionSucesion.map((p: any) => ({ ...p, tipo: "Sucesión" })),
    ...planesAccionSustitucion.map((p: any) => ({ ...p, tipo: "Sustitución" })),
  ];

  const planesFiltrados = todosLosPlanes.filter((plan: any) => {
    if (tipoFiltro !== "todos" && plan.tipo.toLowerCase() !== tipoFiltro) return false;
    if (departamentoFiltro !== "todos" && plan.departamento !== departamentoFiltro) return false;
    if (estadoFiltro !== "todos" && plan.estado !== estadoFiltro) return false;
    return true;
  });

  // Calcular métricas
  const totalPlanes = planesFiltrados.length;
  const completados = planesFiltrados.filter((p: any) => p.estado === "Completado").length;
  const enProgreso = planesFiltrados.filter((p: any) => p.estado === "En Progreso").length;
  const retrasados = planesFiltrados.filter((p: any) => p.estado === "Retrasado").length;
  const noIniciados = planesFiltrados.filter((p: any) => p.estado === "No Iniciado").length;

  const porcentajeCompletacion = totalPlanes > 0 ? Math.round((completados / totalPlanes) * 100) : 0;

  // Obtener departamentos únicos
  const departamentosSet = new Set(todosLosPlanes.map((p: any) => p.departamento));
  const departamentos = Array.from(departamentosSet).sort();

  // Planes completados recientemente (últimos 5)
  const planesCompletadosRecientes = planesFiltrados
    .filter((p: any) => p.estado === "Completado")
    .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 5);

  // Planes próximos a vencer (próximos 7 días)
  const hoy = new Date();
  const proximaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
  const planesProximosAVencer = planesFiltrados
    .filter((p: any) => {
      const fechaFin = new Date(p.fechaFin);
      return fechaFin > hoy && fechaFin <= proximaSemana && p.estado !== "Completado";
    })
    .sort((a: any, b: any) => new Date(a.fechaFin).getTime() - new Date(b.fechaFin).getTime());

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Completado":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "En Progreso":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "Retrasado":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "No Iniciado":
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-green-100 text-green-800";
      case "En Progreso":
        return "bg-blue-100 text-blue-800";
      case "Retrasado":
        return "bg-red-100 text-red-800";
      case "No Iniciado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Planes de Acción</h1>
          <p className="text-gray-600">Monitoreo integral de planes de acción para Sucesión y Sustitución</p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Plan</label>
                <Select value={tipoFiltro} onValueChange={(value: any) => setTipoFiltro(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="sucesion">Sucesión</SelectItem>
                    <SelectItem value="sustitucion">Sustitución</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Departamento</label>
                <Select value={departamentoFiltro} onValueChange={setDepartamentoFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {(departamentos as any[]).map((dept: any) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="No Iniciado">No Iniciado</SelectItem>
                    <SelectItem value="En Progreso">En Progreso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Retrasado">Retrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Planes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlanes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completados}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">En Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{enProgreso}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Retrasados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{retrasados}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">% Completación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{porcentajeCompletacion}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        {planesProximosAVencer.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {planesProximosAVencer.length} plan(es) próximo(s) a vencer en los próximos 7 días
            </AlertDescription>
          </Alert>
        )}

        {/* Planes Próximos a Vencer */}
        {planesProximosAVencer.length > 0 && (
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg">Planes Próximos a Vencer</CardTitle>
              <CardDescription>Próximos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {planesProximosAVencer.map((plan: any) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                    <div className="flex-1">
                      <p className="font-medium">{plan.titulo}</p>
                      <p className="text-sm text-gray-600">{plan.descripcion}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{plan.tipo}</Badge>
                        <Badge variant="outline">{plan.departamento}</Badge>
                        <Badge className={getEstadoColor(plan.estado)}>
                          <span className="flex items-center gap-1">
                            {getEstadoIcon(plan.estado)}
                            {plan.estado}
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Vence: {new Date(plan.fechaFin).toLocaleDateString("es-UY")}</p>
                      <p className="text-sm text-gray-600">Progreso: {plan.progreso}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Planes Completados Recientemente */}
        {planesCompletadosRecientes.length > 0 && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">Planes Completados Recientemente</CardTitle>
              <CardDescription>Últimos 5 planes completados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {planesCompletadosRecientes.map((plan: any) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div className="flex-1">
                      <p className="font-medium">{plan.titulo}</p>
                      <p className="text-sm text-gray-600">{plan.descripcion}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{plan.tipo}</Badge>
                        <Badge variant="outline">{plan.departamento}</Badge>
                        <Badge className="bg-green-100 text-green-800">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completado
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Responsable: {plan.responsable}</p>
                      <p className="text-sm text-gray-600">Progreso: 100%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de Todos los Planes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Todos los Planes de Acción</CardTitle>
            <CardDescription>{planesFiltrados.length} plan(es) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {planesFiltrados.length === 0 ? (
              <p className="text-gray-600">No hay planes de acción con los filtros seleccionados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Título</th>
                      <th className="text-left py-2 px-2">Tipo</th>
                      <th className="text-left py-2 px-2">Departamento</th>
                      <th className="text-left py-2 px-2">Responsable</th>
                      <th className="text-left py-2 px-2">Estado</th>
                      <th className="text-left py-2 px-2">Progreso</th>
                      <th className="text-left py-2 px-2">Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planesFiltrados.map((plan: any) => (
                      <tr key={plan.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{plan.titulo}</td>
                        <td className="py-2 px-2">
                          <Badge variant="outline">{plan.tipo}</Badge>
                        </td>
                        <td className="py-2 px-2">{plan.departamento}</td>
                        <td className="py-2 px-2">{plan.responsable}</td>
                        <td className="py-2 px-2">
                          <Badge className={getEstadoColor(plan.estado)}>
                            <span className="flex items-center gap-1">
                              {getEstadoIcon(plan.estado)}
                              {plan.estado}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${plan.progreso}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{plan.progreso}%</span>
                          </div>
                        </td>
                        <td className="py-2 px-2">{new Date(plan.fechaFin).toLocaleDateString("es-UY")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
