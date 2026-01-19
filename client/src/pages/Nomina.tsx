import { useState } from "react";
import { useRole } from "@/hooks/useRole";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Download, Search, Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function Nomina() {
  const { isAdmin } = useRole();
  const { data: colaboradors, isLoading } = trpc.empleados.list.useQuery();
  const { data: departamentos } = trpc.empleados.departamentos.useQuery();
  const { data: sedes } = trpc.empleados.sedes.useQuery();
  const { data: areas } = trpc.empleados.areas.useQuery();
  const importMutation = trpc.empleados.importar.useMutation();
  const utils = trpc.useUtils();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSede, setFilterSede] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const filteredColaboradors = (colaboradors || []).filter((emp: any) => {
    const matchSearch =
      emp.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.cedula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.cargo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = !filterDept || emp.departamento === filterDept;
    const matchSede = !filterSede || emp.sede === filterSede;
    const matchArea = !filterArea || emp.area === filterArea;
    return matchSearch && matchDept && matchSede && matchArea;
  });

  // Función auxiliar para convertir cualquier valor a string
  const toString = (val: any): string => {
    if (val === null || val === undefined) return "";
    return String(val).trim();
  };

  const mapearEmpleados = (jsonData: any[]) => {
    return jsonData.map((row: any) => {
      const rowLower = Object.keys(row).reduce((acc: any, key: string) => {
        acc[key.toLowerCase().trim()] = row[key];
        return acc;
      }, {});

      return {
        sede: toString(rowLower.sede || rowLower["sede"]),
        cedula: toString(rowLower.cedula || rowLower["c.i."] || rowLower["ci"]),
        nombre: toString(rowLower.nombre || rowLower["nombre"]),
        area: toString(rowLower.area || rowLower["área"]),
        departamento: toString(rowLower.departamento || rowLower["departamento"]),
        cargo: toString(rowLower.cargo || rowLower["cargo"]),
      };
    });
  };

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) {
      setImportFile(null);
      setImportPreview(null);
      setImportError(null);
      return;
    }

    // Validar que sea un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setImportError("El archivo debe ser en formato Excel (.xlsx o .xls)");
      setImportFile(null);
      setImportPreview(null);
      return;
    }

    setImportFile(file);
    setImportError(null);

    // Leer el archivo para mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (!jsonData || jsonData.length === 0) {
          setImportError("El archivo no contiene datos");
          setImportPreview(null);
          return;
        }

        // Mapear columnas y convertir a strings
        const empleadosMapeados = mapearEmpleados(jsonData);

        // Validar que hay datos mapeados correctamente
        const validEmpleados = empleadosMapeados.filter((emp: any) =>
          emp.sede && emp.cedula && emp.nombre && emp.area && emp.departamento && emp.cargo
        );

        if (validEmpleados.length === 0) {
          setImportError("No se encontraron datos válidos. Verifica que las columnas sean: Sede, C.I., Nombre, Área, Departamento, Cargo");
          setImportPreview(null);
          return;
        }

        setImportPreview(validEmpleados.slice(0, 5)); // Mostrar solo los primeros 5 registros
        setImportError(null);
      } catch (error) {
        setImportError("Error al leer el archivo. Asegúrate de que sea un archivo Excel válido.");
        setImportPreview(null);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const data = filteredColaboradors.map((emp: any) => ({
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
    if (!importFile) {
      toast.error("Por favor selecciona un archivo");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        if (!jsonData || jsonData.length === 0) {
          toast.error("El archivo no contiene datos");
          return;
        }
        
        // Mapear columnas y convertir a strings
        const empleadosMapeados = mapearEmpleados(jsonData);
        
        // Validar que hay datos mapeados correctamente
        const validEmpleados = empleadosMapeados.filter((emp: any) => 
          emp.sede && emp.cedula && emp.nombre && emp.area && emp.departamento && emp.cargo
        );
        
        if (validEmpleados.length === 0) {
          toast.error("El archivo no contiene datos válidos. Verifica que las columnas sean: Sede, C.I., Nombre, Área, Departamento, Cargo");
          console.error("Sample row:", empleadosMapeados[0]);
          return;
        }
        
        await importMutation.mutateAsync({
          empleados: validEmpleados,
        });
        
        toast.success(`${validEmpleados.length} colaboradores importados exitosamente`);
        setImportOpen(false);
        setImportFile(null);
        setImportPreview(null);
        setImportError(null);
        // Refrescar la lista de colaboradores
        await utils.empleados.list.invalidate();
      } catch (error: any) {
        toast.error(error.message || "Error al importar el archivo");
        console.error("Error importing file:", error);
      }
    };
    reader.readAsBinaryString(importFile);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">📊 Modulo de Nomina</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-green-800">
            <p>Este módulo te permite <strong>visualizar y gestionar el catálogo completo de colaboradores</strong> de la organización.</p>
            <div className="space-y-2 mt-3">
              <p className="font-semibold">Funcionalidades disponibles:</p>
              <ul className="list-disc list-inside text-green-700 space-y-1">
                <li><strong>Buscar colaboradores:</strong> Por nombre, cédula de identidad o cargo</li>
                <li><strong>Filtrar por:</strong> Departamento, área o sede</li>
                <li><strong>Exportar datos:</strong> Descarga la lista en formato Excel (solo administradores)</li>
                <li><strong>Importar colaboradores:</strong> Carga nuevos colaboradores desde un archivo Excel (solo administradores)</li>
              </ul>
            </div>
            <p className="mt-3 text-green-700"><strong>Tip:</strong> Usa esta información para crear planes de sustitución en el módulo Planes de Sustitución.</p>
          </CardContent>
        </Card>

        {!isAdmin && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Tienes acceso de solo lectura a la nomina. No puedes editar ni eliminar datos.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nómina</h1>
            <p className="text-muted-foreground mt-2">Catálogo completo de colaboradores</p>
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
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Importar colaboradores</DialogTitle>
                    <DialogDescription>
                      Carga un archivo Excel con la información de colaboradores. El archivo debe contener las columnas: Sede, C.I., Nombre, Área, Departamento, Cargo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Seleccionar archivo Excel</label>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        className="block w-full text-sm text-slate-500"
                      />
                    </div>

                    {importError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{importError}</AlertDescription>
                      </Alert>
                    )}

                    {importPreview && importPreview.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-medium text-green-700">
                            Vista previa: {importPreview.length} registros válidos encontrados
                          </p>
                        </div>
                        <div className="overflow-x-auto bg-slate-50 rounded-md p-3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-2 font-semibold">Nombre</th>
                                <th className="text-left py-2 px-2 font-semibold">C.I.</th>
                                <th className="text-left py-2 px-2 font-semibold">Cargo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {importPreview.map((emp: any, idx: number) => (
                                <tr key={idx} className="border-b">
                                  <td className="py-1 px-2">{emp.nombre}</td>
                                  <td className="py-1 px-2">{emp.cedula}</td>
                                  <td className="py-1 px-2">{emp.cargo}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleImport}
                      disabled={!importFile || !importPreview || importMutation.isPending || !!importError}
                      className="w-full"
                    >
                      {importMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        "Importar colaboradores"
                      )}
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
            <CardDescription>Busca y filtra colaboradores por diferentes criterios</CardDescription>
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
                  {departamentos?.map((dept: string) => (
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
                  {sedes?.map((sede: string) => (
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
                  {areas?.map((area: string) => (
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
            <CardTitle>Colaboradores</CardTitle>
            <CardDescription>Total: {filteredColaboradors.length} colaboradores</CardDescription>
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
                        Cargando colaboradors...
                      </td>
                    </tr>
                  ) : filteredColaboradors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay colaboradores que coincidan con los filtros
                      </td>
                    </tr>
                  ) : (
                    filteredColaboradors.map((emp: any) => (
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
