import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DialogoAsignarSustitutoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: number;
  planTipo: "sustitucion" | "sucesion";
  colaboradores: any[];
  onAsignar: (tipo: "existente" | "nuevo" | "capacitacion", valor: string) => Promise<void>;
  isLoading?: boolean;
}

export function DialogoAsignarSustituto({
  open,
  onOpenChange,
  planId,
  planTipo,
  colaboradores,
  onAsignar,
  isLoading = false,
}: DialogoAsignarSustitutoProps) {
  const [tab, setTab] = useState<"existente" | "nuevo" | "capacitacion">("existente");
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<string>("");
  const [nombreNuevo, setNombreNuevo] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setValidationError("");
      setColaboradorSeleccionado("");
      setNombreNuevo("");
    }
  }, [open]);

  const handleAsignar = async () => {
    setValidationError("");

    if (tab === "existente") {
      if (!colaboradorSeleccionado) {
        setValidationError("Debe seleccionar un colaborador");
        return;
      }
      try {
        await onAsignar("existente", colaboradorSeleccionado);
        onOpenChange(false);
      } catch (error: any) {
        setValidationError(error.message || "Error al asignar colaborador");
      }
    } else if (tab === "nuevo") {
      if (!nombreNuevo.trim()) {
        setValidationError("Debe ingresar el nombre del nuevo colaborador");
        return;
      }
      try {
        await onAsignar("nuevo", nombreNuevo);
        onOpenChange(false);
      } catch (error: any) {
        setValidationError(error.message || "Error al registrar nuevo colaborador");
      }
    } else if (tab === "capacitacion") {
      if (!colaboradorSeleccionado) {
        setValidationError("Debe seleccionar el colaborador capacitado");
        return;
      }
      try {
        await onAsignar("capacitacion", colaboradorSeleccionado);
        onOpenChange(false);
      } catch (error: any) {
        setValidationError(error.message || "Error al registrar capacitación");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            ¡Todos los Planes Completados!
          </DialogTitle>
          <DialogDescription>
            Selecciona cómo deseas asignar el {planTipo === "sustitucion" ? "sustituto" : "sucesor"}
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Todos los planes de acción han sido completados al 100%. Ahora debes asignar un {planTipo === "sustitucion" ? "sustituto" : "sucesor"}.
          </AlertDescription>
        </Alert>

        <Tabs value={tab} onValueChange={(value: any) => setTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="existente">Existente</TabsTrigger>
            <TabsTrigger value="nuevo">Nuevo</TabsTrigger>
            <TabsTrigger value="capacitacion">Capacitación</TabsTrigger>
          </TabsList>

          {/* Tab: Colaborador Existente */}
          <TabsContent value="existente" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="colaborador">Selecciona un colaborador</Label>
              <Select value={colaboradorSeleccionado} onValueChange={setColaboradorSeleccionado}>
                <SelectTrigger id="colaborador">
                  <SelectValue placeholder="Buscar colaborador..." />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores && colaboradores.length > 0 ? (
                    colaboradores.map((col: any) => (
                      <SelectItem key={col.id} value={col.id.toString()}>
                        {col.nombre} - {col.cargo}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-options" disabled>
                      No hay colaboradores disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-600">
              Selecciona un colaborador existente que asumirá el rol.
            </p>
          </TabsContent>

          {/* Tab: Nuevo Colaborador */}
          <TabsContent value="nuevo" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del nuevo colaborador</Label>
              <Input
                id="nombre"
                placeholder="Ej: Juan Pérez García"
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-600">
              Ingresa el nombre del nuevo colaborador que será contratado para este puesto.
            </p>
          </TabsContent>

          {/* Tab: Capacitación Completada */}
          <TabsContent value="capacitacion" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="colaborador-capacitado">Colaborador capacitado</Label>
              <Select value={colaboradorSeleccionado} onValueChange={setColaboradorSeleccionado}>
                <SelectTrigger id="colaborador-capacitado">
                  <SelectValue placeholder="Selecciona colaborador..." />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores && colaboradores.length > 0 ? (
                    colaboradores.map((col: any) => (
                      <SelectItem key={col.id} value={col.id.toString()}>
                        {col.nombre} - {col.cargo}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-options" disabled>
                      No hay colaboradores disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-600">
              Selecciona el colaborador que completó la capacitación y asumirá el nuevo rol.
            </p>
          </TabsContent>
        </Tabs>

        {validationError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAsignar}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Asignando..." : "Asignar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
