import { describe, it, expect } from "vitest";
import { getPlanesSuccesion } from "./db";

describe("getPlanesSuccesion", () => {
  it("should calculate riesgoContinuidad correctly", async () => {
    const planes = await getPlanesSuccesion();
    
    console.log("Total planes:", planes.length);
    
    const puestosAltoRiesgo = planes.filter(p => p.riesgoContinuidad === "Alto");
    const puestosBajoRiesgo = planes.filter(p => p.riesgoContinuidad === "Bajo");
    
    console.log("Puestos Alto Riesgo:", puestosAltoRiesgo.length);
    console.log("Puestos Bajo Riesgo:", puestosBajoRiesgo.length);
    
    // Verificar que hay 36 puestos sin reemplazo (Alto riesgo)
    expect(puestosAltoRiesgo.length).toBe(36);
    expect(puestosBajoRiesgo.length).toBe(67);
    
    // Verificar que todos los puestos Alto Riesgo tienen riesgoCritico = Si
    puestosAltoRiesgo.forEach(p => {
      expect(p.riesgoCritico).toBe("Si");
      expect(p.prioridadSucesion).toBe("Alta");
    });
    
    // Verificar que todos los puestos Bajo Riesgo tienen riesgoCritico = No
    puestosBajoRiesgo.forEach(p => {
      expect(p.riesgoCritico).toBe("No");
      expect(p.prioridadSucesion).toBe("Baja");
    });
  });
});
