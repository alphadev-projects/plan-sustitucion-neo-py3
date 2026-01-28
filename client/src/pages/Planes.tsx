import { useState, useEffect } from "react";
import { useRole } from "@/hooks/useRole";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Edit2, Trash2, Search, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function Planes() {
  const { isAdmin } = useRole();
  const { data: planes, isLoading } = trpc.planes.list.useQuery();
  const { data: departamentos } = trpc.empleados.departamentos.useQuery();
  const { data: empleados } = trpc.empleados.list.useQuery();
  const { data: sucesores } = trpc.sucesion.listarConSucesor.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterPuestoClave, setFilterPuestoClave] = useState("");
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
    const [selectedReemplazoId, setSelectedReemplazoId] = useState<string>("");
  const [selectedSucesorId, setSelectedSucesorId] = useState<string>("");
  const [sucesorDuplicado, setSucesorDuplicado] = useState<{ valido: boolean; puestoExistente?: string; departamentoExistente?: string } | null>(null);
  
  const validarSucesor = trpc.sucesion.validarSucesor.useQuery(
    { sucesor: editFormData?.sucesor || "", sucesionPuestoIdActual: editingPlan?.id },
    { enabled: !!editFormData?.sucesor && editFormData.puestoClave }
  );
  
  const updatePlan = trpc.planes.update.useMutation();
  const deletePlan = trpc.planes.delete.useMutation();
  const utils = trpc.useUtils();
  
  // Obtener sucesor asignado para el plan actual
  const getSucesorForPlan = (planId: number) => {
    return sucesores?.find((s: any) => s.planSustitucionId === planId)?.sucesor || "";
  };

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

  const handleEditClick = (plan: any) => {
    setEditingPlan(plan);
    const reemplazoEmpleado = empleados?.find((e: any) => e.nombre === plan.reemplazo);
    setSelectedReemplazoId(reemplazoEmpleado?.id ? String(reemplazoEmpleado.id) : "");
    setEditFormData({
      reemplazo: plan.reemplazo,
      departamentoReemplazo: plan.departamentoReemplazo,
      cargoReemplazo: plan.cargoReemplazo,
      puestoClave: plan.puestoClave === "Si",
      sucesor: getSucesorForPlan(plan.id),
    });
    setShowEditDialog(true);
  };
  
  const handleReemplazoChange = (empleadoId: string) => {
    const empleado = empleados?.find((e: any) => e.id === parseInt(empleadoId));
    if (empleado) {
      setSelectedReemplazoId(String(empleado.id));
      setEditFormData({
        ...editFormData,
        reemplazo: empleado.nombre,
        departamentoReemplazo: empleado.departamento,
        cargoReemplazo: empleado.cargo,
      });
    }
  };
  
  const handleSucesorChange = (empleadoId: string) => {
    const empleado = empleados?.find((e: any) => e.id === parseInt(empleadoId));
    if (empleado) {
      setSelectedSucesorId(String(empleado.id));
      setEditFormData({
        ...editFormData,
        sucesor: empleado.nombre,
      });
    }
  };

  // Actualizar estado de sucesor duplicado cuando la validación cambie
  useEffect(() => {
    if (validarSucesor.data) {
      setSucesorDuplicado(validarSucesor.data);
    }
  }, [validarSucesor.data]);

  const handleSaveEdit = async () => {
    if (!editingPlan || !editFormData) return;

    // Validar que el sucesor no esté duplicado
    if (editFormData.puestoClave && editFormData.sucesor && sucesorDuplicado && !sucesorDuplicado.valido) {
      toast.error(`El sucesor "${editFormData.sucesor}" ya está asignado a "${sucesorDuplicado.puestoExistente}" en ${sucesorDuplicado.departamentoExistente}`);
      return;
    }

    try {
      await updatePlan.mutateAsync({
        id: editingPlan.id,
        reemplazo: editFormData.reemplazo,
        departamentoReemplazo: editFormData.departamentoReemplazo,
        cargoReemplazo: editFormData.cargoReemplazo,
        puestoClave: editFormData.puestoClave ? "Si" : "No",
      });
      
      await utils.planes.list.invalidate();
      await utils.sucesion.listarConSucesor.invalidate();
      setShowEditDialog(false);
      setEditingPlan(null);
      setEditFormData(null);
      setSelectedReemplazoId("");
      setSelectedSucesorId("");
      toast.success("Plan actualizado exitosamente");
    } catch (error) {
      toast.error("Error al actualizar el plan");
    }
  };

  const handleDeleteClick = (plan: any) => {
    setPlanToDelete(plan);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

    try {
      await deletePlan.mutateAsync({ id: planToDelete.id });
      await utils.planes.list.invalidate();
      setShowDeleteDialog(false);
      setPlanToDelete(null);
      toast.success("Plan eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar el plan");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">📄 Módulo de Planes de Sustitución</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-purple-800">
            <p>Este módulo te permite <strong>gestionar y visualizar todos los planes de sustitución</strong> de la organización.</p>
            <div className="space-y-2 mt-3">
              <p className="font-semibold">Funcionalidades disponibles:</p>
              <ul className="list-disc list-inside text-purple-700 space-y-1">
                <li><strong>Ver todos los planes:</strong> Lista completa de planes de sustitución registrados</li>
                <li><strong>Buscar planes:</strong> Por nombre de colaborador o reemplazo</li>
                <li><strong>Filtrar por:</strong> Departamento o si es puesto clave</li>
                <li><strong>Crear nuevo plan:</strong> Haz clic en "Nuevo Plan" para crear un plan de sustitución</li>
                <li><strong>Editar/Eliminar:</strong> Solo administradores pueden editar o eliminar planes (solo administradores)</li>
                <li><strong>Exportar datos:</strong> Descarga los planes en formato Excel (solo administradores)</li>
              </ul>
            </div>
            <p className="mt-3 text-purple-700"><strong>Tip:</strong> Los puestos marcados como "Clave" son críticos para la organización y requieren atención especial.</p>
          </CardContent>
        </Card>

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
                      <th className="text-left py-3 px-4 font-medium">Tipo Reemplazo</th>
                      <th className="text-left py-3 px-4 font-medium">Reemplazo</th>
                      <th className="text-left py-3 px-4 font-medium">Sucesor</th>
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
                        <td className="py-3 px-4">
                          {plan.tipoReemplazo === "pool" ? (
                            <Badge className="bg-blue-500 hover:bg-blue-600">Pool - {plan.cargoPoolReemplazo}</Badge>
                          ) : (
                            <Badge variant="outline">Individual</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">{plan.reemplazo}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{getSucesorForPlan(plan.id) || "Sin asignar"}</td>
                        <td className="py-3 px-4">
                          {plan.puestoClave === "Si" ? (
                            <Badge className="bg-amber-500 hover:bg-amber-600">Clave</Badge>
                          ) : (
                            <Badge variant="outline">Regular</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleEditClick(plan)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteClick(plan)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
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

        {/* Dialog de Edición */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Plan de Sustitución</DialogTitle>
              <DialogDescription>
                Actualiza los datos del plan para {editingPlan?.colaborador}
              </DialogDescription>
            </DialogHeader>
            {editFormData && (
                <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reemplazo</Label>
                  <select
                    value={selectedReemplazoId}
                    onChange={(e) => handleReemplazoChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  >
                    <option value="">Seleccionar colaborador...</option>
                    {(empleados || []).map((emp: any) => (
                      <option key={emp.id} value={String(emp.id)}>
                        {emp.nombre} - {emp.cargo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Departamento Reemplazo</Label>
                  <Input
                    value={editFormData?.departamentoReemplazo || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo Reemplazo</Label>
                  <Input
                    value={editFormData?.cargoReemplazo || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                {editFormData?.puestoClave && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold text-sm mb-3">Sucesión</h4>
                    </div>
                    <div className="space-y-2">
                      <Label>Sucesor</Label>
                      <select
                        value={selectedSucesorId}
                        onChange={(e) => handleSucesorChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                      >
                        <option value="">Sin sucesor</option>
                        {(empleados || []).map((emp: any) => (
                          <option key={emp.id} value={String(emp.id)}>
                            {emp.nombre} - {emp.cargo}
                          </option>
                        ))}
                      </select>
                      {sucesorDuplicado && !sucesorDuplicado.valido && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-semibold">Advertencia: Sucesor duplicado</p>
                            <p>Este colaborador ya está asignado como sucesor de "{sucesorDuplicado.puestoExistente}" en {sucesorDuplicado.departamentoExistente}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editFormData.puestoClave}
                    onCheckedChange={(checked) =>
                      setEditFormData({ ...editFormData, puestoClave: checked })
                    }
                  />
                  <Label>Marcar como puesto clave</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updatePlan.isPending}
              >
                {updatePlan.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmación de Eliminación */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Eliminar Plan
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar el plan de sustitución para{" "}
                <strong>{planToDelete?.colaborador}</strong>?
              </DialogDescription>
            </DialogHeader>
            <div className="bg-destructive/10 p-3 rounded-lg text-sm text-destructive">
              Esta acción no se puede deshacer.
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deletePlan.isPending}
              >
                {deletePlan.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
