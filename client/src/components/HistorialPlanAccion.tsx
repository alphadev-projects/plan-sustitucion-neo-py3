import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Edit2, CheckCircle } from "lucide-react";

interface HistorialPlanAccionProps {
  planAccionId: number;
}

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

const getAccionIcon = (accion: string) => {
  switch (accion) {
    case "CREADO":
      return <Edit2 className="h-4 w-4" />;
    case "COMPLETADO":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export function HistorialPlanAccion({ planAccionId }: HistorialPlanAccionProps) {
  const { data: historial, isLoading } = trpc.sucesion.obtenerHistorial.useQuery({
    planAccionId,
  });

  if (isLoading) {
    return <div className="text-sm text-gray-500">Cargando historial...</div>;
  }

  if (!historial || historial.length === 0) {
    return <div className="text-sm text-gray-500">No hay cambios registrados</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial de Cambios
        </CardTitle>
        <CardDescription>Registro de todas las modificaciones</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {historial.map((evento: any, index: number) => (
            <div key={evento.id} className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full ${getAccionColor(evento.accion)}`}>
                  {getAccionIcon(evento.accion)}
                </div>
                {index < historial.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-200 my-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={getAccionColor(evento.accion)}>
                      {evento.accion.replace(/_/g, " ")}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {evento.usuario}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(evento.createdAt).toLocaleString()}
                  </span>
                </div>

                {evento.descripcion && (
                  <p className="text-sm mt-2 text-gray-700">{evento.descripcion}</p>
                )}

                {evento.campoModificado && (
                  <div className="text-xs mt-2 bg-gray-50 p-2 rounded">
                    <p className="font-medium text-gray-700">{evento.campoModificado}</p>
                    {evento.valorAnterior && (
                      <p className="text-red-600">
                        Antes: <span className="font-mono">{evento.valorAnterior}</span>
                      </p>
                    )}
                    {evento.valorNuevo && (
                      <p className="text-green-600">
                        Ahora: <span className="font-mono">{evento.valorNuevo}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
