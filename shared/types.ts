/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Tipos adicionales compartidos
export interface PlanStats {
  totalPlanes: number;
  puestosClaveCount: number;
  departamentosConCobertura: number;
  departamentosSinCobertura: string[];
}

export interface FilterOptions {
  departamento?: string;
  sede?: string;
  area?: string;
  puestoClave?: "Si" | "No" | "Todos";
  searchQuery?: string;
}
