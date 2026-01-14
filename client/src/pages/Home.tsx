import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3, Users, FileText, Shield, Eye, Lock } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [showPresentation, setShowPresentation] = useState(true);

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

  if (showPresentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
              <h1 className="text-6xl font-bold text-white mb-4">
                Plan de Sustitución <span className="text-blue-500">Pro</span>
              </h1>
              <p className="text-2xl text-slate-300 mb-8">
                Sistema integral de gestión de planes de sustitución y nómina
              </p>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Administra efectivamente los planes de sustitución de tu organización, controla la cobertura de puestos críticos y mantén un catálogo actualizado de tu nómina.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                <BarChart3 className="h-14 w-14 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Dashboard Analítico</h3>
                <p className="text-slate-400">
                  Visualiza métricas en tiempo real, gráficos interactivos y alertas de cobertura de departamentos.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                <FileText className="h-14 w-14 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Gestión de Planes</h3>
                <p className="text-slate-400">
                  Crea, edita y gestiona planes de sustitución con filtros avanzados y exportación a Excel.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                <Users className="h-14 w-14 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Catálogo de Nómina</h3>
                <p className="text-slate-400">
                  Accede al catálogo completo de empleados con búsqueda avanzada y filtros por departamento.
                </p>
              </div>
            </div>

            {/* Roles Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white text-center mb-12">Niveles de Acceso</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Admin Role */}
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/50 rounded-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-8 w-8 text-blue-400" />
                    <h3 className="text-2xl font-bold text-white">Administrador</h3>
                  </div>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold mt-1">✓</span>
                      <span>Acceso completo al Dashboard analítico</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold mt-1">✓</span>
                      <span>Crear, editar y eliminar planes de sustitución</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold mt-1">✓</span>
                      <span>Cargar y gestionar datos de empleados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold mt-1">✓</span>
                      <span>Visualizar y exportar nómina completa</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold mt-1">✓</span>
                      <span>Recibir notificaciones de puestos críticos</span>
                    </li>
                  </ul>
                </div>

                {/* Standard Role */}
                <div className="bg-gradient-to-br from-slate-700/30 to-slate-600/20 border border-slate-500/50 rounded-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Eye className="h-8 w-8 text-slate-400" />
                    <h3 className="text-2xl font-bold text-white">Estándar</h3>
                  </div>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="text-slate-400 font-bold mt-1">✓</span>
                      <span>Visualizar nómina (solo lectura)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-slate-400 font-bold mt-1">✓</span>
                      <span>Buscar y filtrar empleados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-slate-400 font-bold mt-1">✓</span>
                      <span>Exportar catálogo de nómina</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-slate-400 font-bold mt-1">✗</span>
                      <span>Sin acceso a Dashboard</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-slate-400 font-bold mt-1">✗</span>
                      <span>Sin permisos para editar datos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="text-center space-y-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
              >
                Iniciar Sesión
              </Button>
              <p className="text-slate-400">
                Requiere autenticación con Manus
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
