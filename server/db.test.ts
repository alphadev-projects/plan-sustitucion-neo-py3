import { describe, it, expect } from "vitest";
import { getPlanesSuccesion } from "./db";

describe("getPlanesSuccesion", () => {
  it("should calculate riesgoContinuidad correctly (37 Alto, resto Bajo)", async () => {
    const planes = await getPlanesSuccesion();
    
    console.log("Total planes:", planes.length);
    
    const puestosAltoRiesgo = planes.filter(p => p.riesgoContinuidad === "Alto");
    const puestosBajoRiesgo = planes.filter(p => p.riesgoContinuidad === "Bajo");
    
    console.log("Puestos Alto Riesgo:", puestosAltoRiesgo.length);
    console.log("Puestos Bajo Riesgo:", puestosBajoRiesgo.length);
    
    // Verificar que hay exactamente 37 puestos sin reemplazo (Alto riesgo)
    expect(puestosAltoRiesgo.length).toBe(37);
    // Verificar que el total es consistente
    expect(planes.length).toBe(puestosAltoRiesgo.length + puestosBajoRiesgo.length);
    
    // Verificar que todos los puestos Alto Riesgo tienen riesgoCritico = Si
    puestosAltoRiesgo.forEach(p => {
      expect(p.riesgoCritico).toBe("Si");
      expect(p.prioridadSucesion).toBe("Alta");
    });
    
    // Verificar que todos los puestos Bajo Riesgo tienen prioridadSucesion = Baja
    puestosBajoRiesgo.forEach(p => {
      expect(p.prioridadSucesion).toBe("Baja");
    });
  });
});
