import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Planes from "./pages/Planes";
import NuevoPlan from "./pages/NuevoPlan";
import Nomina from "./pages/Nomina";
import GestionUsuarios from "./pages/GestionUsuarios";
import PlanSuccesion from "./pages/PlanSuccesion";
import PlanSuccesionDashboard from "./pages/PlanSuccesionDashboard";

import Auditoria from "./pages/Auditoria";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        {(props) => (
          <ProtectedRoute requiredRole="admin">
            <Dashboard {...props} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/planes">
        {(props) => (
          <ProtectedRoute>
            <Planes {...props} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/planes/nuevo">
        {(props) => (
          <ProtectedRoute>
            <NuevoPlan {...props} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/nomina">
        {(props) => (
          <ProtectedRoute>
            <Nomina {...props} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/usuarios">
        {(props) => (
          <ProtectedRoute requiredRole="admin">
            <GestionUsuarios {...props} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/sucesion">
        {(props) => (
          <ProtectedRoute requiredRole="admin">
            <PlanSuccesion {...props} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/sucesion-dashboard">
        {(props) => (
          <ProtectedRoute requiredRole="admin">
            <PlanSuccesionDashboard {...props} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/auditoria">
        {(props) => (
          <ProtectedRoute requiredRole="admin">
            <Auditoria {...props} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Clean up localStorage on app load to prevent autologin from stale data
  useEffect(() => {
    localStorage.removeItem("manus-runtime-user-info");
    sessionStorage.clear();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
