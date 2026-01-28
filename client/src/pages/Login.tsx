import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useSessionTimeout } from "@/_core/hooks/useSessionTimeout";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [, setLocation] = useLocation();
  const loginMutation = trpc.auth.login.useMutation();
  const { user, refresh, logout } = useAuth();

  // Manejar timeout de sesión (10 minutos de inactividad)
  useSessionTimeout(() => {
    logout();
    toast.error("Sesión expirada por inactividad");
  });

  // NO redirigir automáticamente si ya está autenticado
  // El usuario debe clickear "Iniciar Sesión" manualmente
  // Solo redirigir después de un login exitoso
  useEffect(() => {
    if (user && loginMutation.isSuccess) {
      if (user.role === "admin") {
        setLocation("/dashboard");
      } else {
        setLocation("/nomina");
      }
    }
  }, [user, setLocation, loginMutation.isSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario || !contraseña) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({ usuario, contraseña });
      if (result.success) {
        toast.success("Sesión iniciada correctamente");
        // Refrescar el estado de autenticación
        await refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center mb-2">
            <img src="/logo-neo.png" alt="Logo NEO" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Sistema de Gestión de Planes de Sustitución y Sucesión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <Input
                type="text"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <Input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
          
          {user && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Sesión detectada. Ingresa tus credenciales nuevamente para continuar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
