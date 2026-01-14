import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Planes from "./pages/Planes";
import NuevoPlan from "./pages/NuevoPlan";
import Nomina from "./pages/Nomina";
import GestionUsuarios from "./pages/GestionUsuarios";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
          <ProtectedRoute requiredRole="admin">
            <Planes {...props} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/planes/nuevo">
        {(props) => (
          <ProtectedRoute requiredRole="admin">
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
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
