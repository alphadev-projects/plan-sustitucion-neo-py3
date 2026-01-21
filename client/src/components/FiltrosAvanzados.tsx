import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";

interface FiltrosAvanzadosProps {
  departamentos: string[];
  onFiltrosChange: (filtros: FiltrosState) => void;
}

export interface FiltrosState {
  departamento: string;
  riesgo: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

const RIESGOS = ["Bajo", "Medio", "Alto", "Crítico"];
const ESTADOS = ["No Iniciado", "En Progreso", "Completado", "Retrasado"];

export function FiltrosAvanzados({ departamentos, onFiltrosChange }: FiltrosAvanzadosProps) {
  const [filtros, setFiltros] = useState<FiltrosState>({
    departamento: "",
    riesgo: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleChange = (campo: keyof FiltrosState, valor: string) => {
    const nuevosFiltros = { ...filtros, [campo]: valor };
    setFiltros(nuevosFiltros);
    onFiltrosChange(nuevosFiltros);
  };

  const handleLimpiar = () => {
    const filtrosVacios: FiltrosState = {
      departamento: "",
      riesgo: "",
      estado: "",
      fechaInicio: "",
      fechaFin: "",
    };
    setFiltros(filtrosVacios);
    onFiltrosChange(filtrosVacios);
  };

  const filtrosActivos = Object.values(filtros).filter(v => v !== "").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros Avanzados
          {filtrosActivos > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {filtrosActivos}
            </span>
          )}
        </Button>

        {filtrosActivos > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLimpiar}
            className="gap-1 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {mostrarFiltros && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Departamento */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Departamento</label>
                <Select value={filtros.departamento} onValueChange={(v) => handleChange("departamento", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {departamentos.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Riesgo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Riesgo</label>
                <Select value={filtros.riesgo} onValueChange={(v) => handleChange("riesgo", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {RIESGOS.map((riesgo) => (
                      <SelectItem key={riesgo} value={riesgo}>
                        {riesgo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={filtros.estado} onValueChange={(v) => handleChange("estado", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {ESTADOS.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha Inicio */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Desde</label>
                <Input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => handleChange("fechaInicio", e.target.value)}
                />
              </div>

              {/* Fecha Fin */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Hasta</label>
                <Input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => handleChange("fechaFin", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
