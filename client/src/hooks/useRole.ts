import { useAuth } from "@/_core/hooks/useAuth";

export function useRole() {
  const { user } = useAuth();

  return {
    isAdmin: user?.role === "admin",
    isStandard: user?.role === "standard",
    role: user?.role,
    canViewDashboard: user?.role === "admin",
    canCreatePlan: user?.role === "admin",
    canEditPlan: user?.role === "admin",
    canDeletePlan: user?.role === "admin",
    canViewNomina: true, // Ambos roles pueden ver nómina
    canEditNomina: user?.role === "admin",
    canLoadData: user?.role === "admin",
  };
}
