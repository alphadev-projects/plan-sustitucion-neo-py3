import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertasTempranas } from "@/components/AlertasTempranas";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardAlertas() {
  const [selectedDepartamento, setSelectedDepartamento] = useState("Todos");

  // Obtener todos los puestos críticos
  const { data: puestos, isLoading } = trpc.sucesion.listarConSucesor.useQuery();

  // Obtener departamentos únicos
  const departamentos = puestos
    ? ["Todos", ...Array.from(new Set(puestos.map((p) => p.departamentoPuestoClave)))]
    : ["Todos"];

  // Filtrar puestos por departamento
  const puestosFiltered =
    selectedDepartamento === "Todos"
      ? puestos
      : puestos?.filter((p) => p.departamentoPuestoClave === selectedDepartamento);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Alertas Tempranas</h1>
          <p className="text-gray-600 mt-2">
            Monitoreo en tiempo real de cobertura de sucesión para puestos críticos
          </p>
        </div>

        {/* Filtro por Departamento */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por Departamento:</label>
          <select
            value={selectedDepartamento}
            onChange={(e) => setSelectedDepartamento(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {departamentos.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Contenido Principal */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : puestosFiltered ? (
          <AlertasTempranas puestos={puestosFiltered} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay datos disponibles</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
