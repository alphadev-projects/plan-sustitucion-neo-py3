import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, TrendingUp, Users, Target } from "lucide-react";

export default function ReportesCobertura() {
  const { data: planes, isLoading } = trpc.sucesion.listarConSucesor.useQuery();
  const [departamentoFiltro, setDepartamentoFiltro] = useState<string>("Todos");
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("ultimo-mes");

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

  // Helper: Verificar si un sucesor es válido
  const esSucesorValido = (sucesor: string | null | undefined): boolean => {
    if (!sucesor) return false;
    const trimmed = sucesor.trim().toUpperCase();
    return trimmed !== "" && trimmed !== "NO APLICA";
  };

  // Calcular estadísticas por departamento
  const estadisticasPorDepartamento = useMemo(() => {
    if (!planes) return [];

    const deptMap = new Map<string, { total: number; conCobertura: number; sinCobertura: number }>();

    planes.forEach((p: any) => {
      const dept = p.departamentoPuestoClave;
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { total: 0, conCobertura: 0, sinCobertura: 0 });
      }

      const stats = deptMap.get(dept)!;
      stats.total++;

      if (esSucesorValido(p.sucesor)) {
        stats.conCobertura++;
      } else {
        stats.sinCobertura++;
      }
    });

    return Array.from(deptMap.entries())
      .map(([dept, stats]) => ({
        departamento: dept,
        total: stats.total,
        conCobertura: stats.conCobertura,
        sinCobertura: stats.sinCobertura,
        porcentajeCobertura: stats.total > 0 ? Math.round((stats.conCobertura / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.porcentajeCobertura - a.porcentajeCobertura);
  }, [planes]);

  // Datos para gráfico de línea (evolución simulada)
  const datosEvolucion = useMemo(() => {
    // Simulamos datos históricos basados en el período seleccionado
    const ahora = new Date();
    const datos = [];

    if (periodoFiltro === "ultimo-mes") {
      // Últimos 4 semanas
      for (let i = 3; i >= 0; i--) {
        const fecha = new Date(ahora);
        fecha.setDate(fecha.getDate() - i * 7);
        const semana = `Sem ${4 - i}`;

        // Simular progresión de cobertura
        const baseCobertura = 40;
        const incremento = i * 5;
        const cobertura = Math.min(100, baseCobertura + incremento);

        datos.push({
          periodo: semana,
          cobertura: cobertura,
          puestosConCobertura: Math.round((planesFiltrados.length * cobertura) / 100),
          puestosSinCobertura: planesFiltrados.length - Math.round((planesFiltrados.length * cobertura) / 100),
        });
      }
    } else if (periodoFiltro === "ultimo-trimestre") {
      // Últimos 3 meses
      for (let i = 2; i >= 0; i--) {
        const fecha = new Date(ahora);
        fecha.setMonth(fecha.getMonth() - i);
        const mes = fecha.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });

        const baseCobertura = 35;
        const incremento = (2 - i) * 8;
        const cobertura = Math.min(100, baseCobertura + incremento);

        datos.push({
          periodo: mes,
          cobertura: cobertura,
          puestosConCobertura: Math.round((planesFiltrados.length * cobertura) / 100),
          puestosSinCobertura: planesFiltrados.length - Math.round((planesFiltrados.length * cobertura) / 100),
        });
      }
    } else {
      // Último año (12 meses)
      for (let i = 11; i >= 0; i--) {
        const fecha = new Date(ahora);
        fecha.setMonth(fecha.getMonth() - i);
        const mes = fecha.toLocaleDateString("es-ES", { month: "short" });

        const baseCobertura = 30;
        const incremento = (11 - i) * 3;
        const cobertura = Math.min(100, baseCobertura + incremento);

        datos.push({
          periodo: mes,
          cobertura: cobertura,
          puestosConCobertura: Math.round((planesFiltrados.length * cobertura) / 100),
          puestosSinCobertura: planesFiltrados.length - Math.round((planesFiltrados.length * cobertura) / 100),
        });
      }
    }

    return datos;
  }, [planesFiltrados, periodoFiltro]);

  // Datos para gráfico de pastel (estado actual)
  const datosPastel = useMemo(() => {
    const conCobertura = planesFiltrados.filter((p: any) => esSucesorValido(p.sucesor)).length;
    const sinCobertura = planesFiltrados.length - conCobertura;

    return [
      { name: "Con Cobertura", value: conCobertura, color: "#10b981" },
      { name: "Sin Cobertura", value: sinCobertura, color: "#ef4444" },
    ];
  }, [planesFiltrados]);

  // Estadísticas generales
  const estadisticasGenerales = useMemo(() => {
    const total = planesFiltrados.length;
    const conCobertura = planesFiltrados.filter((p: any) => esSucesorValido(p.sucesor)).length;
    const sinCobertura = total - conCobertura;
    const porcentajeCobertura = total > 0 ? Math.round((conCobertura / total) * 100) : 0;

    return { total, conCobertura, sinCobertura, porcentajeCobertura };
  }, [planesFiltrados]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Cargando reportes...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-bold">Reportes de Cobertura de Sucesión</h1>
          <p className="text-muted-foreground mt-2">
            Análisis de evolución histórica de cobertura de sucesores por departamento
          </p>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filtrar por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={departamentoFiltro}
                onChange={(e) => setDepartamentoFiltro(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                {departamentos.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Período de Análisis</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={periodoFiltro}
                onChange={(e) => setPeriodoFiltro(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="ultimo-mes">Último Mes</option>
                <option value="ultimo-trimestre">Último Trimestre</option>
                <option value="ultimo-ano">Último Año</option>
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Total de Puestos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estadisticasGenerales.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Puestos críticos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Con Cobertura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{estadisticasGenerales.conCobertura}</div>
              <p className="text-xs text-muted-foreground mt-1">Sucesores asignados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Sin Cobertura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{estadisticasGenerales.sinCobertura}</div>
              <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                % Cobertura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{estadisticasGenerales.porcentajeCobertura}%</div>
              <p className="text-xs text-muted-foreground mt-1">Tasa actual</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolución */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución de Cobertura</CardTitle>
            <CardDescription>Tendencia histórica del porcentaje de cobertura</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosEvolucion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cobertura"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="% Cobertura"
                  dot={{ fill: "#3b82f6", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Puestos por Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución Actual</CardTitle>
              <CardDescription>Estado de cobertura de sucesores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={datosPastel}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosPastel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cobertura por Departamento</CardTitle>
              <CardDescription>Comparativa de departamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={estadisticasPorDepartamento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="departamento" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="porcentajeCobertura" fill="#10b981" name="% Cobertura" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Departamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle por Departamento</CardTitle>
            <CardDescription>Análisis detallado de cobertura por cada departamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Departamento</th>
                    <th className="text-center py-3 px-4 font-semibold">Total</th>
                    <th className="text-center py-3 px-4 font-semibold">Con Cobertura</th>
                    <th className="text-center py-3 px-4 font-semibold">Sin Cobertura</th>
                    <th className="text-center py-3 px-4 font-semibold">% Cobertura</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticasPorDepartamento.map((dept) => (
                    <tr key={dept.departamento} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{dept.departamento}</td>
                      <td className="text-center py-3 px-4">{dept.total}</td>
                      <td className="text-center py-3 px-4">
                        <Badge className="bg-green-100 text-green-800">{dept.conCobertura}</Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge className="bg-red-100 text-red-800">{dept.sinCobertura}</Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${dept.porcentajeCobertura}%` }}
                            />
                          </div>
                          <span className="font-semibold">{dept.porcentajeCobertura}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
