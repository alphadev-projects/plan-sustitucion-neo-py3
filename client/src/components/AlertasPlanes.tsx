import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Download } from "lucide-react";

export function AlertasPlanes() {
  const { data: alertas, isLoading } = trpc.sucesion.obtenerAlertas.useQuery();
  const { data: reporte } = trpc.sucesion.descargarReporteRiesgos.useQuery();

  const handleDescargarReporte = () => {
    if (!reporte?.csv) return;

    const blob = new Blob([reporte.csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", reporte.filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Cargando alertas...</div>;
  }

  if (!alertas || alertas.total === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <p className="text-sm text-green-800">✅ No hay planes próximos a vencer o retrasados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle>Alertas de Planes</CardTitle>
          </div>
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            {alertas.total} alerta(s)
          </Badge>
        </div>
        <CardDescription>Planes próximos a vencer o retrasados</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Planes Retrasados */}
        {alertas.retrasados.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Retrasados ({alertas.retrasados.length})
            </h4>
            <div className="space-y-2">
              {alertas.retrasados.map((plan) => (
                <div key={plan.id} className="bg-red-100 border border-red-300 rounded p-2 text-sm">
                  <p className="font-medium text-red-900">{plan.titulo}</p>
                  <p className="text-red-800">Responsable: {plan.responsable}</p>
                  <p className="text-red-700 text-xs">
                    Vencimiento: {new Date(plan.fechaFin).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Planes Próximos a Vencer */}
        {alertas.proximosAVencer.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Próximos a Vencer ({alertas.proximosAVencer.length})
            </h4>
            <div className="space-y-2">
              {alertas.proximosAVencer.map((plan) => (
                <div key={plan.id} className="bg-yellow-100 border border-yellow-300 rounded p-2 text-sm">
                  <p className="font-medium text-yellow-900">{plan.titulo}</p>
                  <p className="text-yellow-800">Responsable: {plan.responsable}</p>
                  <p className="text-yellow-700 text-xs">
                    Vencimiento: {new Date(plan.fechaFin).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón Descargar Reporte */}
        <Button
          onClick={handleDescargarReporte}
          variant="outline"
          className="w-full gap-2 mt-4"
          disabled={!reporte?.csv}
        >
          <Download className="h-4 w-4" />
          Descargar Reporte de Riesgos (CSV)
        </Button>
      </CardContent>
    </Card>
  );
}
