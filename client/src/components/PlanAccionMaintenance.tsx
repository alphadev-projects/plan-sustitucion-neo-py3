import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { HistorialPlanAccion } from "./HistorialPlanAccion";
import { DescargaEvidencias } from "./DescargaEvidencias";

interface PlanAccionMaintenanceProps {
  planAccionId: number;
  titulo: string;
  descripcion: string;
  responsable: string;
  fechaFin: Date;
  estado: string;
  progreso: number;
}

export function PlanAccionMaintenance({
  planAccionId,
  titulo,
  descripcion,
  responsable,
  fechaFin,
  estado,
  progreso,
}: PlanAccionMaintenanceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState(estado);
  const [comentario, setComentario] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);

  const updateMutation = trpc.sucesion.accionActualizar.useMutation();
  const comentarioMutation = trpc.sucesion.comentarioCrear.useMutation();
  const subirEvidenciaMutation = trpc.sucesion.subirEvidencia.useMutation();
  const utils = trpc.useUtils();

  // Convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleActualizar = async () => {
    try {
      setSubiendo(true);

      // Calcular progreso basado en estado
      let nuevoProgreso = progreso;
      if (nuevoEstado === "En Progreso" && progreso === 0) {
        nuevoProgreso = 50;
      } else if (nuevoEstado === "Completado") {
        nuevoProgreso = 100;
      } else if (nuevoEstado === "No Iniciado") {
        nuevoProgreso = 0;
      }

      // Actualizar estado del plan
      await updateMutation.mutateAsync({
        id: planAccionId,
        estado: nuevoEstado as any,
        progreso: nuevoProgreso,
      });

      // Crear comentario si existe
      if (comentario) {
        await comentarioMutation.mutateAsync({
          planAccionId,
          contenido: comentario,
        });
      }

      // Subir archivos de evidencia
      if (archivos.length > 0) {
        for (const archivo of archivos) {
          try {
            const base64 = await fileToBase64(archivo);
            await subirEvidenciaMutation.mutateAsync({
              planAccionId,
              archivoBase64: base64,
              nombreArchivo: archivo.name,
              estado: nuevoEstado as any,
              progreso: nuevoProgreso,
              comentario: comentario || undefined,
            });
            toast.success(`Archivo "${archivo.name}" subido correctamente`);
          } catch (error: any) {
            toast.error(`Error al subir "${archivo.name}": ${error.message}`);
          }
        }
      }

      // Invalidar caché para refrescar datos
      await utils.sucesion.accionesListar.invalidate();
      await utils.sucesion.dashboardMetricas.invalidate();
      await utils.sucesion.dashboardResumenDepartamentos.invalidate();
      await utils.sucesion.obtenerAlertas.invalidate();
      await utils.sucesion.obtenerHistorial.invalidate();
      await utils.sucesion.obtenerEvidenciasConArchivos.invalidate({ planAccionId });

      toast.success("Plan de acción actualizado correctamente");
      setIsEditing(false);
      setComentario("");
      setArchivos([]);
    } catch (error: any) {
      console.error("Error actualizando plan:", error);
      toast.error("Error al actualizar el plan de acción");
    } finally {
      setSubiendo(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files));
    }
  };

  const hoy = new Date();
  const diasParaVencer = Math.ceil((new Date(fechaFin).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determinar indicador de riesgo basado en estado y días
  let indicadorRiesgo = { color: "green", icon: CheckCircle, label: "Controlado" };
  
  if (estado === "Completado") {
    indicadorRiesgo = { color: "green", icon: CheckCircle, label: "Completado" };
  } else if (estado === "Retrasado") {
    indicadorRiesgo = { color: "red", icon: AlertTriangle, label: "Retrasado" };
  } else if (diasParaVencer <= 3) {
    indicadorRiesgo = { color: "red", icon: AlertTriangle, label: "Crítico" };
  } else if (diasParaVencer <= 7) {
    indicadorRiesgo = { color: "yellow", icon: Clock, label: "Próximo a vencer" };
  }

  const IconoRiesgo = indicadorRiesgo.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{titulo}</CardTitle>
            <CardDescription className="mt-2">{descripcion}</CardDescription>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "destructive" : "outline"}
            size="sm"
          >
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <IconoRiesgo className={`h-5 w-5 text-${indicadorRiesgo.color}-600`} />
            <span className={`text-sm font-medium text-${indicadorRiesgo.color}-600`}>
              {indicadorRiesgo.label}
            </span>
          </div>
          <Badge variant="outline">{estado}</Badge>
          <Badge variant="secondary">{progreso}%</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información General */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Responsable</p>
            <p className="font-medium">{responsable}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha de Vencimiento</p>
            <p className="font-medium">{new Date(fechaFin).toLocaleDateString("es-UY")}</p>
          </div>
        </div>

        {/* Formulario de Edición */}
        {isEditing && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No Iniciado">No Iniciado</SelectItem>
                  <SelectItem value="En Progreso">En Progreso</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                  <SelectItem value="Retrasado">Retrasado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {nuevoEstado === "En Progreso" && progreso === 0
                  ? "Se establecerá automáticamente a 50% de progreso"
                  : nuevoEstado === "Completado"
                  ? "Se establecerá automáticamente a 100% de progreso"
                  : ""}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comentario / Evidencia</label>
              <Textarea
                placeholder="Describe el progreso, adjunta evidencia o notas"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Adjuntar Evidencia (Imagen, PDF, Excel)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-gray-500" />
              </div>
              {archivos.length > 0 && (
                <div className="text-xs text-gray-600">
                  {archivos.length} archivo(s) seleccionado(s):
                  <ul className="list-disc list-inside mt-1">
                    {archivos.map((f, i) => (
                      <li key={i}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleActualizar}
                disabled={subiendo || updateMutation.isPending}
                className="flex-1"
              >
                {subiendo || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setNuevoEstado(estado);
                  setComentario("");
                  setArchivos([]);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Descarga de Evidencias */}
        <div className="mt-6 pt-6 border-t">
          <DescargaEvidencias planAccionId={planAccionId} planAccionTitulo={titulo} />
        </div>

        {/* Historial de Cambios */}
        <div className="mt-6 pt-6 border-t">
          <HistorialPlanAccion planAccionId={planAccionId} />
        </div>
      </CardContent>
    </Card>
  );
}
