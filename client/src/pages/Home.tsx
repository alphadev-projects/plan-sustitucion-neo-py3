import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3, Users, FileText } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-white text-lg">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl font-bold text-white mb-4">
              Plan de Sustitución <span className="text-blue-500">Pro</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Sistema integral de gestión de planes de sustitución y nómina
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <BarChart3 className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Dashboard Analítico</h3>
              <p className="text-slate-400">
                Visualiza métricas en tiempo real, gráficos interactivos y alertas de cobertura
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <FileText className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Gestión de Planes</h3>
              <p className="text-slate-400">
                Crea, edita y gestiona planes de sustitución con filtros avanzados
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <Users className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Catálogo de Nómina</h3>
              <p className="text-slate-400">
                Accede al catálogo completo de empleados con búsqueda y filtros
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
            >
              Iniciar Sesión
            </Button>
            <p className="text-slate-400 mt-4">
              Requiere autenticación con Manus
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
