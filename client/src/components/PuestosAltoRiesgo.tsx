import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

export function PuestosAltoRiesgo() {
  const { data: planes, isLoading } = trpc.sucesion.listar.useQuery();

  // Debug logging
  console.log("[PuestosAltoRiesgo] Datos recibidos:", planes);
  console.log("[PuestosAltoRiesgo] Total planes:", planes?.length);
  
  const puestosAltoRiesgo = planes?.filter(p => !p.sucesor) || [];
  console.log("[PuestosAltoRiesgo] Puestos Alto Riesgo:", puestosAltoRiesgo);
  console.log("[PuestosAltoRiesgo] Total Alto Riesgo:", puestosAltoRiesgo.length);

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <CardTitle className="text-red-900">Puestos Críticos Sin Reemplazo</CardTitle>
              <CardDescription>Riesgo Alto - Requiere atención inmediata</CardDescription>
            </div>
          </div>
          <Badge className="bg-red-600 text-white text-lg px-3 py-1">
            {puestosAltoRiesgo.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Cargando...</div>
        ) : puestosAltoRiesgo.length === 0 ? (
          <div className="text-center py-4 text-green-600">
            ✓ Todos los puestos críticos tienen reemplazo asignado
          </div>
        ) : (
          <div className="space-y-3">
            {puestosAltoRiesgo.map(puesto => (
              <div
                key={puesto.id}
                className="pulse-red p-3 bg-white border border-red-300 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{puesto.puestoClave}</p>
                    <p className="text-sm text-gray-600">{puesto.cargoPuestoClave}</p>
                    <p className="text-xs text-gray-500 mt-1">{puesto.departamentoPuestoClave}</p>
                  </div>
                  <Badge variant="destructive" className="animate-pulse">
                    ALTO RIESGO
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
