import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, User, FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function HistorialSucesores() {
  const { data: historial, isLoading } = trpc.sucesion.obtenerHistorialSucesores.useQuery();
  const [filtroSucesor, setFiltroSucesor] = useState<string>("");

  const historialFiltrado = historial?.filter((item) =>
    filtroSucesor === "" || 
    item.sucesorNuevo.toLowerCase().includes(filtroSucesor.toLowerCase()) ||
    item.sucesorAnterior.toLowerCase().includes(filtroSucesor.toLowerCase())
  ) || [];

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial de Cambios de Sucesores</h1>
        <p className="text-muted-foreground mt-2">
          Registro completo de todos los cambios de sucesores realizados
        </p>
      </div>

      {/* Filtro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrar</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="Buscar por nombre de sucesor..."
            value={filtroSucesor}
            onChange={(e) => setFiltroSucesor(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-background"
          />
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Cambios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{historial?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cambios Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{historialFiltrado.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sucesores Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(historial?.map((h) => h.sucesorNuevo) || []).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de historial */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Cambios</CardTitle>
          <CardDescription>
            Últimos cambios de sucesores ordenados por fecha más reciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando historial...
            </div>
          ) : historialFiltrado.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {historial?.length === 0
                ? "No hay cambios registrados aún"
                : "No hay cambios que coincidan con el filtro"}
            </div>
          ) : (
            <div className="space-y-4">
              {historialFiltrado.map((cambio) => (
                <div
                  key={cambio.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Icono de cambio */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                      <ArrowRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">
                        {cambio.sucesorAnterior || "Sin sucesor"}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-sm text-green-600">
                        {cambio.sucesorNuevo || "Sin sucesor"}
                      </span>
                    </div>

                    {cambio.motivo && (
                      <div className="flex items-start gap-2 mb-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p className="italic">{cambio.motivo}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(cambio.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {cambio.usuario}
                      </div>
                    </div>
                  </div>

                  {/* Badge de estado */}
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Actualizado
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
