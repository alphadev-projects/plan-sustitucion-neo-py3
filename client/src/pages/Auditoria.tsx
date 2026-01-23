import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Download, Clock, User, Edit2 } from "lucide-react";

const ACCIONES = ["CREADO", "ACTUALIZADO", "ESTADO_CAMBIO", "PROGRESO_CAMBIO", "COMPLETADO"];

const getAccionColor = (accion: string) => {
  switch (accion) {
    case "CREADO":
      return "bg-blue-100 text-blue-800";
    case "ACTUALIZADO":
      return "bg-yellow-100 text-yellow-800";
    case "ESTADO_CAMBIO":
      return "bg-purple-100 text-purple-800";
    case "PROGRESO_CAMBIO":
      return "bg-orange-100 text-orange-800";
    case "COMPLETADO":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function AuditoriaContent() {
  const [filtros, setFiltros] = useState({
    usuario: "",
    accion: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const { data: auditoria, isLoading, refetch } = trpc.sucesion.obtenerAuditoria.useQuery(filtros);

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      usuario: "",
      accion: "",
      fechaInicio: "",
      fechaFin: "",
    });
  };

  const handleDescargarCSV = () => {
    if (!auditoria || auditoria.length === 0) return;

    const headers = ["Fecha", "Usuario", "Acción", "Plan Acción ID", "Campo", "Valor Anterior", "Valor Nuevo", "Descripción"];
    const rows = auditoria.map((evento: any) => [
      new Date(evento.createdAt).toLocaleString(),
      evento.usuario,
      evento.accion,
      evento.planAccionId,
      evento.campoModificado || "-",
      evento.valorAnterior || "-",
      evento.valorNuevo || "-",
      evento.descripcion || "-",
    ]);

    const csv = [headers, ...rows].map((row: any) => row.map((cell: any) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filtrosActivos = Object.values(filtros).filter((v) => v !== "").length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Auditoría de Cambios</h1>
        <p className="text-gray-600 mt-2">Registro centralizado de todas las modificaciones en planes de acción</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Usuario */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <Input
                placeholder="Buscar usuario..."
                value={filtros.usuario}
                onChange={(e) => handleFiltroChange("usuario", e.target.value)}
              />
            </div>

            {/* Acción */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Acción</label>
              <Select value={filtros.accion} onValueChange={(v) => handleFiltroChange("accion", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {ACCIONES.map((accion) => (
                    <SelectItem key={accion} value={accion}>
                      {accion.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha Inicio */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Desde</label>
              <Input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => handleFiltroChange("fechaInicio", e.target.value)}
              />
            </div>

            {/* Fecha Fin */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hasta</label>
              <Input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange("fechaFin", e.target.value)}
              />
            </div>

            {/* Botones */}
            <div className="flex items-end gap-2">
              {filtrosActivos > 0 && (
                <Button variant="outline" size="sm" onClick={handleLimpiarFiltros}>
                  Limpiar
                </Button>
              )}
              <Button size="sm" onClick={() => refetch()}>
                Aplicar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Auditoría */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Registro de Cambios
              </CardTitle>
              <CardDescription>
                {auditoria?.length || 0} cambios registrados
                {filtrosActivos > 0 && ` (${filtrosActivos} filtro${filtrosActivos > 1 ? "s" : ""} activo${filtrosActivos > 1 ? "s" : ""})`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDescargarCSV}
              disabled={!auditoria || auditoria.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Cargando auditoría...</div>
          ) : auditoria && auditoria.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Plan ID</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Cambio</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditoria.map((evento: any) => (
                    <TableRow key={evento.id}>
                      <TableCell className="text-sm">
                        {new Date(evento.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="font-medium">{evento.usuario}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAccionColor(evento.accion)}>
                          {evento.accion.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">#{evento.planAccionId}</TableCell>
                      <TableCell className="text-sm">
                        {evento.campoModificado ? (
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                            {evento.campoModificado}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {evento.valorAnterior || evento.valorNuevo ? (
                          <div className="space-y-1">
                            {evento.valorAnterior && (
                              <div className="text-red-600">
                                <span className="text-xs">De:</span> {evento.valorAnterior}
                              </div>
                            )}
                            {evento.valorNuevo && (
                              <div className="text-green-600">
                                <span className="text-xs">A:</span> {evento.valorNuevo}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                        {evento.descripcion || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay cambios registrados con los filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Auditoria() {
  return (
    <DashboardLayout>
      <AuditoriaContent />
    </DashboardLayout>
  );
}
