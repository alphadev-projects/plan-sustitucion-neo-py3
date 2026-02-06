import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

// Helper: Verificar si un plan tiene reemplazo válido
const tieneReemplazoValido = (plan: any): boolean => {
  if (!plan) return false;
  
  // Para planes pool, verificar si hay reemplazos en el array
  if (plan.tipoReemplazo === "pool" && plan.reemplazos) {
    return plan.reemplazos.length > 0;
  }
  
  // Para planes individual, verificar si hay reemplazo1
  if (plan.reemplazo1 && plan.reemplazo1.trim() !== "") {
    return true;
  }
  
  return false;
};

export default function DashboardSustitucion() {
  const { data: planes, isLoading } = trpc.planes.list.useQuery();
  const [departamentoFiltro, setDepartamentoFiltro] = useState<string>("Todos");

  // Obtener lista de departamentos únicos
  const departamentos = useMemo(() => {
    if (!planes) return ["Todos"];
    const depts = new Set(planes.map((p: any) => p.departamento));
    return ["Todos", ...Array.from(depts).sort()];
  }, [planes]);

  // Filtrar planes por departamento
  const planesFiltrados = useMemo(() => {
    if (!planes) return [];
    if (departamentoFiltro === "Todos") {
      return planes;
    }
    return planes.filter((p: any) => p.departamento === departamentoFiltro);
  }, [planes, departamentoFiltro]);

  // Separar planes con y sin reemplazo
  const planesConReemplazo = useMemo(() => {
    return planesFiltrados.filter((p: any) => tieneReemplazoValido(p));
  }, [planesFiltrados]);

  const planesSinReemplazo = useMemo(() => {
    return planesFiltrados.filter((p: any) => !tieneReemplazoValido(p));
  }, [planesFiltrados]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = planesFiltrados.length;
    const conCobertura = planesConReemplazo.length;
    const sinCobertura = planesSinReemplazo.length;
    const porcentajeCobertura = total > 0 ? Math.round((conCobertura / total) * 100) : 0;
    
    // Contar puestos clave sin reemplazo
    const puestosClavesSinReemplazo = planesSinReemplazo.filter(
      (p: any) => p.puestoClave === "Si"
    ).length;

    return { 
      total, 
      conCobertura, 
      sinCobertura, 
      porcentajeCobertura,
      puestosClavesSinReemplazo
    };
  }, [planesFiltrados, planesConReemplazo, planesSinReemplazo]);

  // Función para exportar colaboradores CON reemplazo
  const handleExportConReemplazo = () => {
    const data = planesConReemplazo.map((plan: any) => ({
      "Colaborador": plan.colaborador,
      "Cargo": plan.cargo,
      "Departamento": plan.departamento,
      "Tipo Reemplazo": plan.tipoReemplazo === "pool" ? "Pool" : "Individual",
      "Reemplazo(s)": plan.tipoReemplazo === "pool" && plan.reemplazos
        ? plan.reemplazos.map((r: any) => r.reemplazo).join(", ")
        : plan.reemplazo1,
      "Puesto Clave": plan.puestoClave === "Si" ? "Sí" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Con Reemplazo");
    XLSX.writeFile(wb, `colaboradores_con_reemplazo_${departamentoFiltro === "Todos" ? "general" : departamentoFiltro}.xlsx`);
  };

  // Función para exportar colaboradores SIN reemplazo
  const handleExportSinReemplazo = () => {
    const data = planesSinReemplazo.map((plan: any) => ({
      "Colaborador": plan.colaborador,
      "Cargo": plan.cargo,
      "Departamento": plan.departamento,
      "Puesto Clave": plan.puestoClave === "Si" ? "Sí" : "No",
      "Prioridad": plan.puestoClave === "Si" ? "Alta" : "Normal",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sin Reemplazo");
    XLSX.writeFile(wb, `colaboradores_sin_reemplazo_${departamentoFiltro === "Todos" ? "general" : departamentoFiltro}.xlsx`);
  };

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
          <h1 className="text-3xl font-bold">Dashboard de Sustitución</h1>
          <p className="text-gray-600">Visualización de planes de sustitución y cobertura de reemplazos</p>
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
              <CardTitle className="text-sm font-medium">Total Planes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total}</div>
              <p className="text-xs text-gray-500">De sustitución</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Con Reemplazo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.conCobertura}</div>
              <p className="text-xs text-gray-500">Cobertura asignada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sin Reemplazo</CardTitle>
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
              <p className="text-xs text-gray-500">De reemplazo</p>
            </CardContent>
          </Card>
        </div>

        {/* Matriz 2x2 */}
        <div className="grid grid-cols-2 gap-4">
          {/* CON REEMPLAZO */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <CardTitle className="text-green-700">CUBIERTO</CardTitle>
              </div>
              <CardDescription className="text-green-600">Con Reemplazo Asignado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">{estadisticas.conCobertura}</div>
              <p className="text-sm text-green-700">✓ Cobertura garantizada</p>
            </CardContent>
          </Card>

          {/* SIN REEMPLAZO */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-700">DESCUBIERTO</CardTitle>
              </div>
              <CardDescription className="text-red-600">Sin Reemplazo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">{estadisticas.sinCobertura}</div>
              <p className="text-sm text-red-700">⚠️ Acción requerida</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de Puestos Clave sin Reemplazo */}
        {estadisticas.puestosClavesSinReemplazo > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>⚠️ Atención:</strong> Hay {estadisticas.puestosClavesSinReemplazo} puesto(s) clave sin reemplazo asignado. Estos requieren atención inmediata.
            </AlertDescription>
          </Alert>
        )}

        {/* Sección: Colaboradores CON Reemplazo (CUBIERTO) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-green-700">Colaboradores con Reemplazo Asignado</CardTitle>
              <CardDescription>Posiciones con cobertura de sustitución garantizada</CardDescription>
            </div>
            {planesConReemplazo.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportConReemplazo}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {planesConReemplazo.length === 0 ? (
              <p className="text-gray-500">No hay colaboradores con reemplazo asignado</p>
            ) : (
              <div className="space-y-4">
                {planesConReemplazo.map((plan: any) => (
                  <div key={plan.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Colaborador</p>
                        <p className="font-semibold">{plan.colaborador}</p>
                        <p className="text-xs text-gray-500">{plan.cargo}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Reemplazo(s)</p>
                        <div className="space-y-1">
                          {plan.tipoReemplazo === "pool" && plan.reemplazos ? (
                            plan.reemplazos.map((r: any, idx: number) => (
                              <div key={idx} className="text-sm font-semibold text-green-700">
                                {idx + 1}. {r.reemplazo}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm font-semibold text-green-700">{plan.reemplazo1}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tipo</p>
                        <Badge className={plan.tipoReemplazo === "pool" ? "bg-blue-500" : "bg-gray-500"}>
                          {plan.tipoReemplazo === "pool" ? "Pool" : "Individual"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Estado</p>
                        {plan.puestoClave === "Si" ? (
                          <Badge className="bg-amber-500">Puesto Clave</Badge>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección: Colaboradores SIN Reemplazo (DESCUBIERTO) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-red-700">Colaboradores sin Reemplazo - Acción Requerida</CardTitle>
              <CardDescription>Posiciones que requieren asignación de reemplazo</CardDescription>
            </div>
            {planesSinReemplazo.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSinReemplazo}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {planesSinReemplazo.length === 0 ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  ¡Excelente! Todos los colaboradores tienen reemplazo asignado.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {planesSinReemplazo.map((plan: any) => (
                  <div key={plan.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Colaborador</p>
                        <p className="font-semibold">{plan.colaborador}</p>
                        <p className="text-xs text-gray-500">{plan.cargo}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Departamento</p>
                        <p className="font-semibold">{plan.departamento}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Puesto Clave</p>
                        {plan.puestoClave === "Si" ? (
                          <Badge className="bg-red-600">Crítico</Badge>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Estado</p>
                        <p className="font-semibold text-red-700">Sin Reemplazo</p>
                      </div>
                    </div>
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
