import { AlertCircle, TrendingDown, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface PuestoAlerta {
  id: number;
  puestoClave: string;
  cargoPuestoClave: string;
  departamentoPuestoClave: string;
  sucesor: string | null;
  aplicaSucesion: "Si" | "No";
}

interface AlertasTempranaProps {
  puestos: PuestoAlerta[];
}

export function AlertasTempranas({ puestos }: AlertasTempranaProps) {
  // Filtrar puestos críticos sin sucesor
  const puestosCriticosSinSucesor = puestos.filter(
    (p) => p.aplicaSucesion === "Si" && !p.sucesor
  );

  // Filtrar puestos con sucesor (bajo riesgo)
  const puestosConSucesor = puestos.filter(
    (p) => p.aplicaSucesion === "Si" && p.sucesor
  );

  const porcentajeCobertura =
    puestos.length > 0
      ? Math.round((puestosConSucesor.length / puestos.length) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Resumen de Alertas */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-5 w-5" />
            Alertas Tempranas - Puestos Críticos
          </CardTitle>
          <CardDescription className="text-red-700">
            Monitoreo de cobertura de sucesión para puestos críticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Métricas Clave */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-white p-3 border border-red-200">
              <p className="text-xs font-medium text-gray-600">Total Puestos Críticos</p>
              <p className="text-2xl font-bold text-red-600">{puestos.length}</p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-red-200">
              <p className="text-xs font-medium text-gray-600">Sin Sucesor (CRÍTICO)</p>
              <p className="text-2xl font-bold text-red-600">{puestosCriticosSinSucesor.length}</p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-green-200">
              <p className="text-xs font-medium text-gray-600">% Cobertura</p>
              <p className="text-2xl font-bold text-green-600">{porcentajeCobertura}%</p>
            </div>
          </div>

          {/* Alerta Principal */}
          {puestosCriticosSinSucesor.length > 0 && (
            <Alert className="border-red-300 bg-red-100">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>{puestosCriticosSinSucesor.length} puesto(s) crítico(s)</strong> requieren atención inmediata. 
                Estos puestos no tienen sucesor identificado y representan un riesgo alto de continuidad.
              </AlertDescription>
            </Alert>
          )}

          {puestosCriticosSinSucesor.length === 0 && (
            <Alert className="border-green-300 bg-green-100">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✓ Excelente: Todos los puestos críticos tienen sucesor identificado.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Lista de Puestos Sin Sucesor */}
      {puestosCriticosSinSucesor.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Puestos que Requieren Acción Inmediata</CardTitle>
            <CardDescription>Estos puestos no tienen sucesor asignado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {puestosCriticosSinSucesor.map((puesto) => (
                <div
                  key={puesto.id}
                  className="flex items-start justify-between rounded-lg border border-red-200 bg-white p-3"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{puesto.puestoClave}</p>
                    <p className="text-sm text-gray-600">{puesto.cargoPuestoClave}</p>
                    <p className="text-xs text-gray-500">{puesto.departamentoPuestoClave}</p>
                  </div>
                  <Badge variant="destructive" className="ml-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Sin Sucesor
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Puestos Con Sucesor */}
      {puestosConSucesor.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Puestos Cubiertos (Bajo Riesgo)</CardTitle>
            <CardDescription className="text-green-700">
              {puestosConSucesor.length} puesto(s) con sucesor identificado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {puestosConSucesor.map((puesto) => (
                <div
                  key={puesto.id}
                  className="rounded-lg border border-green-200 bg-white p-3"
                >
                  <p className="font-semibold text-gray-900">{puesto.puestoClave}</p>
                  <p className="text-sm text-gray-600">{puesto.cargoPuestoClave}</p>
                  <p className="text-xs text-green-700 mt-2">
                    <strong>Sucesor:</strong> {puesto.sucesor}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
