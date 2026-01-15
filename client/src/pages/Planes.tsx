import { useState } from "react";
import { useRole } from "@/hooks/useRole";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Edit2, Trash2, Search } from "lucide-react";
import { Link } from "wouter";
import * as XLSX from "xlsx";

export default function Planes() {
  const { isAdmin } = useRole();
  const { data: planes, isLoading } = trpc.planes.list.useQuery();
  const { data: departamentos } = trpc.empleados.departamentos.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterPuestoClave, setFilterPuestoClave] = useState("");

  const filteredPlanes = (planes || []).filter((plan) => {
    const matchSearch =
      plan.colaborador.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.reemplazo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = !filterDept || plan.departamento === filterDept;
    const matchPuestoClave = !filterPuestoClave || plan.puestoClave === filterPuestoClave;
    return matchSearch && matchDept && matchPuestoClave;
  });

  const handleExport = () => {
    const data = filteredPlanes.map((plan) => ({
      "Fecha y Hora": new Date(plan.createdAt).toLocaleString(),
      Usuario: plan.usuario,
      Colaborador: plan.colaborador,
      Departamento: plan.departamento,
      Cargo: plan.cargo,
      Reemplazo: plan.reemplazo,
      "Dpto. Reemplazo": plan.departamentoReemplazo,
      "Cargo Reemplazo": plan.cargoReemplazo,
      "Puesto Clave": plan.puestoClave,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planes");
    XLSX.writeFile(wb, "planes_sustitucion.xlsx");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planes de Sustitución</h1>
            <p className="text-muted-foreground mt-2">Gestión y seguimiento de planes de sustitución</p>
          </div>
          <Link href="/planes/nuevo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Plan
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busca y filtra los planes de sustitución</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Colaborador o reemplazo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Departamento</label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">Todos</option>
                  {(departamentos || []).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Puesto Clave</label>
                <select
                  value={filterPuestoClave}
                  onChange={(e) => setFilterPuestoClave(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">Todos</option>
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Planes Registrados</CardTitle>
              <CardDescription>{filteredPlanes.length} planes encontrados</CardDescription>
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : filteredPlanes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay planes registrados</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Fecha y Hora</th>
                      <th className="text-left py-3 px-4 font-medium">Usuario</th>
                      <th className="text-left py-3 px-4 font-medium">Colaborador</th>
                      <th className="text-left py-3 px-4 font-medium">Departamento</th>
                      <th className="text-left py-3 px-4 font-medium">Cargo</th>
                      <th className="text-left py-3 px-4 font-medium">Reemplazo</th>
                      <th className="text-left py-3 px-4 font-medium">Puesto Clave</th>
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlanes.map((plan) => (
                      <tr key={plan.id} className="border-b hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-4 text-sm whitespace-nowrap">{new Date(plan.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm font-medium">{plan.usuario}</td>
                        <td className="py-3 px-4">{plan.colaborador}</td>
                        <td className="py-3 px-4">{plan.departamento}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{plan.cargo}</td>
                        <td className="py-3 px-4">{plan.reemplazo}</td>
                        <td className="py-3 px-4">
                          {plan.puestoClave === "Si" ? (
                            <Badge className="bg-amber-500 hover:bg-amber-600">Clave</Badge>
                          ) : (
                            <Badge variant="outline">Regular</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
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
