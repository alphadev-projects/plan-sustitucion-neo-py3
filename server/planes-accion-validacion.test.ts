import { describe, it, expect } from "vitest";

describe("Validación de Planes de Acción", () => {
  it("debe detectar cuando todos los planes están completados al 100%", () => {
    const planes = [
      { id: 1, progreso: 100, estado: "Completado" },
      { id: 2, progreso: 100, estado: "Completado" },
      { id: 3, progreso: 100, estado: "Completado" },
    ];

    const todosCompletados = planes.every(
      (p) => p.progreso === 100 && p.estado === "Completado"
    );

    expect(todosCompletados).toBe(true);
  });

  it("debe detectar cuando NO todos los planes están completados", () => {
    const planes = [
      { id: 1, progreso: 100, estado: "Completado" },
      { id: 2, progreso: 75, estado: "En Progreso" },
      { id: 3, progreso: 100, estado: "Completado" },
    ];

    const todosCompletados = planes.every(
      (p) => p.progreso === 100 && p.estado === "Completado"
    );

    expect(todosCompletados).toBe(false);
  });

  it("debe detectar cuando no hay planes de acción", () => {
    const planes: any[] = [];

    expect(planes.length).toBe(0);
  });

  it("debe validar que el progreso esté entre 0 y 100", () => {
    const validarProgreso = (progreso: number) => {
      return progreso >= 0 && progreso <= 100;
    };

    expect(validarProgreso(0)).toBe(true);
    expect(validarProgreso(50)).toBe(true);
    expect(validarProgreso(100)).toBe(true);
    expect(validarProgreso(-1)).toBe(false);
    expect(validarProgreso(101)).toBe(false);
  });

  it("debe validar que el estado sea válido", () => {
    const estadosValidos = ["No Iniciado", "En Progreso", "Completado", "Retrasado"];
    
    const validarEstado = (estado: string) => {
      return estadosValidos.includes(estado);
    };

    expect(validarEstado("Completado")).toBe(true);
    expect(validarEstado("En Progreso")).toBe(true);
    expect(validarEstado("Inválido")).toBe(false);
  });

  it("debe validar que el tipo de asignación sea válido", () => {
    const tiposValidos = ["existente", "nuevo", "capacitacion"];
    
    const validarTipo = (tipo: string) => {
      return tiposValidos.includes(tipo);
    };

    expect(validarTipo("existente")).toBe(true);
    expect(validarTipo("nuevo")).toBe(true);
    expect(validarTipo("capacitacion")).toBe(true);
    expect(validarTipo("otro")).toBe(false);
  });

  it("debe validar que el nombre del sustituto no esté vacío", () => {
    const validarNombreSustituto = (nombre: string) => {
      return nombre.trim().length > 0;
    };

    expect(validarNombreSustituto("Juan Pérez")).toBe(true);
    expect(validarNombreSustituto("")).toBe(false);
    expect(validarNombreSustituto("   ")).toBe(false);
  });

  it("debe filtrar planes por estado", () => {
    const planes = [
      { id: 1, estado: "Completado", progreso: 100 },
      { id: 2, estado: "En Progreso", progreso: 50 },
      { id: 3, estado: "Completado", progreso: 100 },
      { id: 4, estado: "Retrasado", progreso: 30 },
    ];

    const completados = planes.filter((p) => p.estado === "Completado");
    expect(completados.length).toBe(2);

    const enProgreso = planes.filter((p) => p.estado === "En Progreso");
    expect(enProgreso.length).toBe(1);
  });

  it("debe calcular el porcentaje promedio de completación", () => {
    const planes = [
      { progreso: 100 },
      { progreso: 75 },
      { progreso: 50 },
    ];

    const promedio = planes.reduce((sum, p) => sum + p.progreso, 0) / planes.length;
    expect(promedio).toBe(75);
  });

  it("debe validar fechas correctamente", () => {
    const validarFechas = (fechaInicio: string, fechaFin: string) => {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return inicio < fin;
    };

    expect(validarFechas("2024-01-01", "2024-12-31")).toBe(true);
    expect(validarFechas("2024-12-31", "2024-01-01")).toBe(false);
  });

  it("debe contar planes por departamento", () => {
    const planes = [
      { departamento: "IT", estado: "Completado" },
      { departamento: "IT", estado: "En Progreso" },
      { departamento: "HR", estado: "Completado" },
      { departamento: "HR", estado: "Completado" },
      { departamento: "Finance", estado: "Retrasado" },
    ];

    const porDepartamento = planes.reduce((acc: any, p) => {
      acc[p.departamento] = (acc[p.departamento] || 0) + 1;
      return acc;
    }, {});

    expect(porDepartamento.IT).toBe(2);
    expect(porDepartamento.HR).toBe(2);
    expect(porDepartamento.Finance).toBe(1);
  });

  it("debe detectar planes próximos a vencer", () => {
    const hoy = new Date();
    const proximaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const planes = [
      { id: 1, fechaFin: new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000), estado: "En Progreso" },
      { id: 2, fechaFin: new Date(hoy.getTime() + 10 * 24 * 60 * 60 * 1000), estado: "En Progreso" },
      { id: 3, fechaFin: new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000), estado: "En Progreso" },
    ];

    const proximosAVencer = planes.filter(
      (p) => p.fechaFin > hoy && p.fechaFin <= proximaSemana && p.estado !== "Completado"
    );

    expect(proximosAVencer.length).toBe(2);
  });

  it("debe validar que un plan tenga todos los campos requeridos", () => {
    const validarPlan = (plan: any) => {
      return (
        plan.titulo &&
        plan.responsable &&
        plan.fechaInicio &&
        plan.fechaFin &&
        typeof plan.progreso === "number"
      );
    };

    const planValido = {
      titulo: "Test",
      responsable: "Juan",
      fechaInicio: "2024-01-01",
      fechaFin: "2024-12-31",
      progreso: 50,
    };

    const planInvalido = {
      titulo: "Test",
      responsable: "Juan",
      // falta fechaInicio
      fechaFin: "2024-12-31",
      progreso: 50,
    };

    expect(validarPlan(planValido)).toBe(true);
    expect(validarPlan(planInvalido)).toBe(false);
  });
});
