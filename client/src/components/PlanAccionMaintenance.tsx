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
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";

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
  const [nuevoProgreso, setNuevoProgreso] = useState(progreso);
  const [comentario, setComentario] = useState("");

  const updateMutation = trpc.sucesion.accionActualizar.useMutation();
  const comentarioMutation = trpc.sucesion.comentarioCrear.useMutation();

  const handleActualizar = async () => {
    try {
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
      
      setIsEditing(false);
      setComentario("");
    } catch (error) {
      console.error("Error actualizando plan:", error);
    }
  };

  const hoy = new Date();
  const diasParaVencer = Math.ceil((new Date(fechaFin).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  let indicadorRiesgo = { color: "green", icon: CheckCircle, label: "Controlado" };
  
  if (diasParaVencer <= 3) {
    indicadorRiesgo = { color: "red", icon: AlertTriangle, label: "Crítico" };
  } else if (diasParaVencer <= 7) {
    indicadorRiesgo = { color: "orange", icon: AlertCircle, label: "Alto" };
  } else if (diasParaVencer <= 14) {
    indicadorRiesgo = { color: "yellow", icon: Clock, label: "Medio" };
  }

  const IconoRiesgo = indicadorRiesgo.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{titulo}</CardTitle>
            <CardDescription className="mt-1">{descripcion}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{estado}</Badge>
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
              className="bg-blue-600 h-2 rounded-full transition-all"
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
            Actualizar Estado / Progreso
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Progreso (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={nuevoProgreso}
                onChange={(e) => setNuevoProgreso(Number(e.target.value))}
              />
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
                  setNuevoProgreso(progreso);
                  setComentario("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
