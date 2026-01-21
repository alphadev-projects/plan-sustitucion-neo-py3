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
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Upload } from "lucide-react";
import { HistorialPlanAccion } from "./HistorialPlanAccion";

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

  const updateMutation = trpc.sucesion.accionActualizar.useMutation();
  const comentarioMutation = trpc.sucesion.comentarioCrear.useMutation();
  const utils = trpc.useUtils();

  const handleActualizar = async () => {
    try {
      // Calcular progreso basado en estado
      let nuevoProgreso = progreso;
      if (nuevoEstado === "En Progreso" && progreso === 0) {
        nuevoProgreso = 50; // Si cambia a "En Progreso", establecer 50%
      } else if (nuevoEstado === "Completado") {
        nuevoProgreso = 100;
      } else if (nuevoEstado === "No Iniciado") {
        nuevoProgreso = 0;
      }

      await updateMutation.mutateAsync({
        id: planAccionId,
        estado: nuevoEstado as any,
        progreso: nuevoProgreso,
      });

      if (comentario) {
        await comentarioMutation.mutateAsync({
          planAccionId,
          contenido: comentario,
        });
      }

      // Invalidar caché para refrescar datos
      await utils.sucesion.accionesListar.invalidate();
      await utils.sucesion.dashboardMetricas.invalidate();
      await utils.sucesion.dashboardResumenDepartamentos.invalidate();
      await utils.sucesion.obtenerAlertas.invalidate();
      await utils.sucesion.obtenerHistorial.invalidate();

      setIsEditing(false);
      setComentario("");
      setArchivos([]);
    } catch (error) {
      console.error("Error actualizando plan:", error);
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
    indicadorRiesgo = { color: "orange", icon: AlertCircle, label: "Alto" };
  } else if (diasParaVencer <= 14) {
    indicadorRiesgo = { color: "yellow", icon: Clock, label: "Medio" };
  }

  const IconoRiesgo = indicadorRiesgo.icon;

  // Mapeo de colores para estados
  const getEstadoColor = (est: string) => {
    switch (est) {
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{titulo}</CardTitle>
            <CardDescription className="mt-1">{descripcion}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getEstadoColor(estado)}>{estado}</Badge>
            <Badge className={`bg-${indicadorRiesgo.color}-100 text-${indicadorRiesgo.color}-800`}>
              <IconoRiesgo className="h-3 w-3 mr-1" />
              {indicadorRiesgo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información Básica */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Responsable</p>
            <p className="font-medium">{responsable}</p>
          </div>
          <div>
            <p className="text-gray-600">Vencimiento</p>
            <p className="font-medium">{new Date(fechaFin).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">({diasParaVencer} días)</p>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progreso</span>
            <span className="font-medium">{progreso}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                estado === "Completado"
                  ? "bg-green-600"
                  : estado === "En Progreso"
                  ? "bg-blue-600"
                  : estado === "Retrasado"
                  ? "bg-red-600"
                  : "bg-gray-400"
              }`}
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Formulario de Mantenimiento */}
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="w-full"
          >
            Actualizar Estado
          </Button>
        ) : (
          <div className="space-y-4 border-t pt-4">
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
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
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

        {/* Historial de Cambios */}
        <div className="mt-6 pt-6 border-t">
          <HistorialPlanAccion planAccionId={planAccionId} />
        </div>
      </CardContent>
    </Card>
  );
}
