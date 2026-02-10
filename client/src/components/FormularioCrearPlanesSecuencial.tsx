import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PlanFormData {
  titulo: string;
  descripcion: string;
  responsable: string;
  fechaInicio: string;
  fechaFin: string;
}

interface FormularioCrearPlanesSecuencialProps {
  onCrearPlanes: (planes: PlanFormData[]) => Promise<void>;
  isLoading?: boolean;
}

export function FormularioCrearPlanesSecuencial({
  onCrearPlanes,
  isLoading = false,
}: FormularioCrearPlanesSecuencialProps) {
  const [planes, setPlanes] = useState<PlanFormData[]>([
    {
      titulo: "",
      descripcion: "",
      responsable: "",
      fechaInicio: "",
      fechaFin: "",
    },
  ]);

  const [errors, setErrors] = useState<{ [key: number]: { [key: string]: string } }>({});

  const handleChangePlan = (index: number, field: keyof PlanFormData, value: string) => {
    const nuevosPlan = [...planes];
    nuevosPlan[index] = { ...nuevosPlan[index], [field]: value };
    setPlanes(nuevosPlan);
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[index]?.[field]) {
      const nuevosErrors = { ...errors };
      if (nuevosErrors[index]) {
        delete nuevosErrors[index][field];
      }
      setErrors(nuevosErrors);
    }
  };

  const agregarOtroPlan = () => {
    setPlanes([
      ...planes,
      {
        titulo: "",
        descripcion: "",
        responsable: "",
        fechaInicio: "",
        fechaFin: "",
      },
    ]);
  };

  const eliminarPlan = (index: number) => {
    if (planes.length === 1) {
      toast.error("Debe haber al menos un plan");
      return;
    }
    const nuevosPlan = planes.filter((_, i) => i !== index);
    setPlanes(nuevosPlan);
    
    const nuevosErrors = { ...errors };
    delete nuevosErrors[index];
    setErrors(nuevosErrors);
  };

  const validarPlanes = (): boolean => {
    const nuevosErrors: { [key: number]: { [key: string]: string } } = {};
    let valido = true;

    planes.forEach((plan, index) => {
      const erroresDelPlan: { [key: string]: string } = {};

      if (!plan.titulo.trim()) {
        erroresDelPlan.titulo = "El título es requerido";
        valido = false;
      }

      if (!plan.responsable.trim()) {
        erroresDelPlan.responsable = "El responsable es requerido";
        valido = false;
      }

      if (!plan.fechaInicio) {
        erroresDelPlan.fechaInicio = "La fecha de inicio es requerida";
        valido = false;
      }

      if (!plan.fechaFin) {
        erroresDelPlan.fechaFin = "La fecha de fin es requerida";
        valido = false;
      }

      if (plan.fechaInicio && plan.fechaFin) {
        const inicio = new Date(plan.fechaInicio);
        const fin = new Date(plan.fechaFin);
        if (inicio >= fin) {
          erroresDelPlan.fechaFin = "La fecha de fin debe ser posterior a la de inicio";
          valido = false;
        }
      }

      if (Object.keys(erroresDelPlan).length > 0) {
        nuevosErrors[index] = erroresDelPlan;
      }
    });

    setErrors(nuevosErrors);
    return valido;
  };

  const handleCrearPlanes = async () => {
    if (!validarPlanes()) {
      toast.error("Por favor, corrija los errores en los formularios");
      return;
    }

    try {
      await onCrearPlanes(planes);
      setPlanes([
        {
          titulo: "",
          descripcion: "",
          responsable: "",
          fechaInicio: "",
          fechaFin: "",
        },
      ]);
      setErrors({});
      toast.success(`${planes.length} plan(es) creado(s) exitosamente`);
    } catch (error: any) {
      toast.error(error.message || "Error al crear planes");
    }
  };

  return (
    <div className="space-y-4">
      {planes.map((plan, index) => (
        <Card key={index} className="relative">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Plan {index + 1}</CardTitle>
                <CardDescription>Información del plan de acción</CardDescription>
              </div>
              {planes.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarPlan(index)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor={`titulo-${index}`}>Título del Plan</Label>
              <Input
                id={`titulo-${index}`}
                placeholder="Ej: Capacitación en nuevos sistemas"
                value={plan.titulo}
                onChange={(e) => handleChangePlan(index, "titulo", e.target.value)}
                disabled={isLoading}
                className={errors[index]?.titulo ? "border-red-500" : ""}
              />
              {errors[index]?.titulo && (
                <p className="text-xs text-red-600">{errors[index].titulo}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor={`descripcion-${index}`}>Descripción</Label>
              <Textarea
                id={`descripcion-${index}`}
                placeholder="Describe los detalles del plan de acción"
                value={plan.descripcion}
                onChange={(e) => handleChangePlan(index, "descripcion", e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <Label htmlFor={`responsable-${index}`}>Responsable</Label>
              <Input
                id={`responsable-${index}`}
                placeholder="Nombre del responsable"
                value={plan.responsable}
                onChange={(e) => handleChangePlan(index, "responsable", e.target.value)}
                disabled={isLoading}
                className={errors[index]?.responsable ? "border-red-500" : ""}
              />
              {errors[index]?.responsable && (
                <p className="text-xs text-red-600">{errors[index].responsable}</p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`fechaInicio-${index}`}>Fecha de Inicio</Label>
                <Input
                  id={`fechaInicio-${index}`}
                  type="date"
                  value={plan.fechaInicio}
                  onChange={(e) => handleChangePlan(index, "fechaInicio", e.target.value)}
                  disabled={isLoading}
                  className={errors[index]?.fechaInicio ? "border-red-500" : ""}
                />
                {errors[index]?.fechaInicio && (
                  <p className="text-xs text-red-600">{errors[index].fechaInicio}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`fechaFin-${index}`}>Fecha de Fin</Label>
                <Input
                  id={`fechaFin-${index}`}
                  type="date"
                  value={plan.fechaFin}
                  onChange={(e) => handleChangePlan(index, "fechaFin", e.target.value)}
                  disabled={isLoading}
                  className={errors[index]?.fechaFin ? "border-red-500" : ""}
                />
                {errors[index]?.fechaFin && (
                  <p className="text-xs text-red-600">{errors[index].fechaFin}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Información */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Puedes crear múltiples planes de acción secuencialmente. Haz clic en "Agregar otro plan" para añadir más.
        </AlertDescription>
      </Alert>

      {/* Botones de acción */}
      <div className="flex gap-2 justify-between">
        <Button
          variant="outline"
          onClick={agregarOtroPlan}
          disabled={isLoading}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar otro plan
        </Button>

        <div className="flex gap-2">
          <Badge variant="secondary">{planes.length} plan(es)</Badge>
          <Button
            onClick={handleCrearPlanes}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Creando..." : "Crear planes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
