import { useState } from "react";
import { useRole } from "@/hooks/useRole";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Download, Search, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as XLSX from "xlsx";

export default function Nomina() {
  const { isAdmin } = useRole();
  const { data: empleados, isLoading } = trpc.empleados.list.useQuery();
  const { data: departamentos } = trpc.empleados.departamentos.useQuery();
  const { data: sedes } = trpc.empleados.sedes.useQuery();
  const { data: areas } = trpc.empleados.areas.useQuery();
  const importMutation = trpc.empleados.importar.useMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSede, setFilterSede] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

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

  const handleImport = async () => {
    if (!importFile) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        await importMutation.mutateAsync({
          empleados: jsonData as any[],
        });
        
        setImportOpen(false);
        setImportFile(null);
      } catch (error) {
        console.error("Error importing file:", error);
      }
    };
    reader.readAsBinaryString(importFile);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {!isAdmin && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Tienes acceso de solo lectura a la nómina. No puedes editar ni eliminar datos.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nómina</h1>
            <p className="text-muted-foreground mt-2">Catálogo completo de empleados</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Importar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Empleados</DialogTitle>
                    <DialogDescription>
                      Carga un archivo Excel con la información de empleados
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500"
                    />
                    <Button
                      onClick={handleImport}
                      disabled={!importFile || importMutation.isPending}
                      className="w-full"
                    >
                      {importMutation.isPending ? "Importando..." : "Importar"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busca y filtra empleados por diferentes criterios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nombre, C.I. o cargo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Departamento</label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  {departamentos?.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Sede</label>
                <select
                  value={filterSede}
                  onChange={(e) => setFilterSede(e.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  {sedes?.map((sede) => (
                    <option key={sede} value={sede}>
                      {sede}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Área</label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  {areas?.map((area) => (
                    <option key={area} value={area}>
                      {area}
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
            <CardDescription>Total: {filteredEmpleados.length} empleados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Nombre</th>
                    <th className="text-left py-3 px-4 font-semibold">C.I.</th>
                    <th className="text-left py-3 px-4 font-semibold">Cargo</th>
                    <th className="text-left py-3 px-4 font-semibold">Departamento</th>
                    <th className="text-left py-3 px-4 font-semibold">Área</th>
                    <th className="text-left py-3 px-4 font-semibold">Sede</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        Cargando empleados...
                      </td>
                    </tr>
                  ) : filteredEmpleados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay empleados que coincidan con los filtros
                      </td>
                    </tr>
                  ) : (
                    filteredEmpleados.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{emp.nombre}</td>
                        <td className="py-3 px-4">{emp.cedula}</td>
                        <td className="py-3 px-4">{emp.cargo}</td>
                        <td className="py-3 px-4">{emp.departamento}</td>
                        <td className="py-3 px-4">{emp.area}</td>
                        <td className="py-3 px-4">{emp.sede}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
