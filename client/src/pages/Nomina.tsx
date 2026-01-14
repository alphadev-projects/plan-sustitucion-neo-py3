import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";
import * as XLSX from "xlsx";

export default function Nomina() {
  const { data: empleados, isLoading } = trpc.empleados.list.useQuery();
  const { data: departamentos } = trpc.empleados.departamentos.useQuery();
  const { data: sedes } = trpc.empleados.sedes.useQuery();
  const { data: areas } = trpc.empleados.areas.useQuery();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSede, setFilterSede] = useState("");
  const [filterArea, setFilterArea] = useState("");

  const filteredEmpleados = (empleados || []).filter((emp) => {
    const matchSearch =
      emp.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.cedula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.cargo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = !filterDept || emp.departamento === filterDept;
    const matchSede = !filterSede || emp.sede === filterSede;
    const matchArea = !filterArea || emp.area === filterArea;
    return matchSearch && matchDept && matchSede && matchArea;
  });

  const handleExport = () => {
    const data = filteredEmpleados.map((emp) => ({
      Nombre: emp.nombre,
      "C.I.": emp.cedula,
      Cargo: emp.cargo,
      Departamento: emp.departamento,
      Área: emp.area,
      Sede: emp.sede,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nómina");
    XLSX.writeFile(wb, "nomina.xlsx");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nómina</h1>
            <p className="text-muted-foreground mt-2">Catálogo completo de empleados</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busca y filtra empleados por diferentes criterios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nombre, C.I. o cargo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sede</label>
                <select
                  value={filterSede}
                  onChange={(e) => setFilterSede(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">Todas</option>
                  {(sedes || []).map((sede) => (
                    <option key={sede} value={sede}>
                      {sede}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Área</label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">Todas</option>
                  {(areas || []).map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empleados</CardTitle>
            <CardDescription>{filteredEmpleados.length} empleados encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : filteredEmpleados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay empleados registrados</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Nombre</th>
                      <th className="text-left py-3 px-4 font-medium">C.I.</th>
                      <th className="text-left py-3 px-4 font-medium">Cargo</th>
                      <th className="text-left py-3 px-4 font-medium">Departamento</th>
                      <th className="text-left py-3 px-4 font-medium">Área</th>
                      <th className="text-left py-3 px-4 font-medium">Sede</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmpleados.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{emp.nombre}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{emp.cedula}</td>
                        <td className="py-3 px-4">{emp.cargo}</td>
                        <td className="py-3 px-4">{emp.departamento}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{emp.area}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{emp.sede}</td>
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
