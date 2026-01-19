import { describe, it, expect } from "vitest";
import { importarEmpleados } from "./db";

describe("Employee Import - Validation Logic", () => {
  it("should reject employees with missing sede field", async () => {
    const empleadosData = [
      {
        sede: "",
        cedula: `test-${Date.now()}`,
        nombre: "Juan Pérez",
        area: "Test Area",
        departamento: "Test Dept",
        cargo: "Gerente",
      },
    ];

    const result = await importarEmpleados(empleadosData);
    
    // Should reject due to empty sede
    expect(result.importedCount).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should reject employees with missing cedula field", async () => {
    const empleadosData = [
      {
        sede: "Test Sede",
        cedula: "",
        nombre: "Juan Pérez",
        area: "Test Area",
        departamento: "Test Dept",
        cargo: "Gerente",
      },
    ];

    const result = await importarEmpleados(empleadosData);
    
    // Should reject due to empty cedula
    expect(result.importedCount).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should reject employees with missing nombre field", async () => {
    const empleadosData = [
      {
        sede: "Test Sede",
        cedula: `test-${Date.now()}`,
        nombre: "",
        area: "Test Area",
        departamento: "Test Dept",
        cargo: "Gerente",
      },
    ];

    const result = await importarEmpleados(empleadosData);
    
    // Should reject due to empty nombre
    expect(result.importedCount).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should reject employees with missing area field", async () => {
    const empleadosData = [
      {
        sede: "Test Sede",
        cedula: `test-${Date.now()}`,
        nombre: "Juan Pérez",
        area: "",
        departamento: "Test Dept",
        cargo: "Gerente",
      },
    ];

    const result = await importarEmpleados(empleadosData);
    
    // Should reject due to empty area
    expect(result.importedCount).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should reject employees with missing departamento field", async () => {
    const empleadosData = [
      {
        sede: "Test Sede",
        cedula: `test-${Date.now()}`,
        nombre: "Juan Pérez",
        area: "Test Area",
        departamento: "",
        cargo: "Gerente",
      },
    ];

    const result = await importarEmpleados(empleadosData);
    
    // Should reject due to empty departamento
    expect(result.importedCount).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should reject employees with missing cargo field", async () => {
    const empleadosData = [
      {
        sede: "Test Sede",
        cedula: `test-${Date.now()}`,
        nombre: "Juan Pérez",
        area: "Test Area",
        departamento: "Test Dept",
        cargo: "",
      },
    ];

    const result = await importarEmpleados(empleadosData);
    
    // Should reject due to empty cargo
    expect(result.importedCount).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
