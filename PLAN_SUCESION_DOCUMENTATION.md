# Documentación: Plan de Sucesión - Cálculo de Riesgos

## Descripción General

El módulo de Plan de Sucesión implementa un análisis automático de riesgos basado en **7 pasos** que evalúan la vulnerabilidad organizacional de cada puesto de trabajo.

## Los 7 Pasos del Análisis de Riesgos

### PASO 1: Cantidad de Personas con el Mismo Cargo
**Entrada:** Cargo + Departamento del plan de sustitución  
**Proceso:** Contar empleados activos con el mismo cargo en el mismo departamento  
**Salida:** `cantidadPersonasMismoCargo` (número entero)

```
Cantidad = COUNT(empleados WHERE cargo = X AND departamento = Y)
```

---

### PASO 2: Detección de Cargos Únicos
**Entrada:** `cantidadPersonasMismoCargo`  
**Proceso:** Identificar si el cargo es único (solo 1 persona lo desempeña)  
**Salida:** `cargoUnico` (Si/No)

```
cargoUnico = SI si cantidadPersonasMismoCargo == 1
cargoUnico = NO si cantidadPersonasMismoCargo > 1
```

---

### PASO 3: Clasificación por Dotación (Riesgo de Continuidad)
**Entrada:** `cantidadPersonasMismoCargo`  
**Proceso:** Clasificar el riesgo de continuidad según la cantidad de personas  
**Salida:** `riesgoContinuidad` (Alto/Medio/Bajo)

```
SI cantidadPersonasMismoCargo == 1 → riesgoContinuidad = ALTO
SI cantidadPersonasMismoCargo == 2 → riesgoContinuidad = MEDIO
SI cantidadPersonasMismoCargo >= 3 → riesgoContinuidad = BAJO
```

**Justificación:**
- **Alto:** Cargo único, sin respaldo. Salida = crisis inmediata
- **Medio:** Solo 2 personas. Salida de una = crisis
- **Bajo:** 3+ personas. Existe cobertura

---

### PASO 4: Identificación de Pools Potenciales
**Entrada:** `cantidadPersonasMismoCargo`  
**Proceso:** Determinar si existe pool de reemplazo potencial  
**Salida:** `poolPotencial` (Si/No)

```
poolPotencial = SI si cantidadPersonasMismoCargo >= 3
poolPotencial = NO si cantidadPersonasMismoCargo < 3
```

**Justificación:** Con 3+ personas en el cargo, existe potencial para crear un pool de reemplazo.

---

### PASO 5: Riesgo Crítico (Cruce: Sin Reemplazo + Riesgo Alto)
**Entrada:** `tipoSustitucion` + `riesgoContinuidad`  
**Proceso:** Detectar situaciones críticas (sin reemplazo disponible + riesgo alto)  
**Salida:** `riesgoCritico` (Si/No)

```
SI tipoSustitucion == "NO_APLICA" Y riesgoContinuidad == "ALTO"
  → riesgoCritico = SI
SINO
  → riesgoCritico = NO
```

**Justificación:** Combinación más peligrosa: cargo único + sin reemplazo = crisis garantizada.

---

### PASO 6: Prioridad de Sucesión (Cruce: Puesto Clave + Riesgo)
**Entrada:** `puestoClave` + `riesgoContinuidad`  
**Proceso:** Determinar prioridad de sucesión  
**Salida:** `prioridadSucesion` (Alta/Media/Baja)

```
SI puestoClave == "SI"
  SI riesgoContinuidad == "ALTO" O riesgoContinuidad == "MEDIO"
    → prioridadSucesion = ALTA
  SINO
    → prioridadSucesion = MEDIA
SINO
  → prioridadSucesion = BAJA
```

**Justificación:**
- Puestos clave con riesgo alto/medio = máxima prioridad
- Puestos clave con riesgo bajo = prioridad media
- Puestos no clave = prioridad baja

---

### PASO 7: Clasificación Final del Puesto (Estado Puesto)
**Entrada:** `riesgoCritico` + `prioridadSucesion` + `riesgoContinuidad`  
**Proceso:** Clasificación descriptiva final del estado del puesto  
**Salida:** `estadoPuesto` (texto descriptivo)

```
SI riesgoCritico == "SI"
  → estadoPuesto = "CRÍTICO SIN REEMPLAZO"
SINO SI prioridadSucesion == "ALTA"
  → estadoPuesto = "PUESTO CLAVE PRIORITARIO"
SINO SI riesgoContinuidad == "MEDIO"
  → estadoPuesto = "RIESGO MODERADO"
SINO
  → estadoPuesto = "CONTROLADO"
```

---

## Ejemplos Prácticos

### Ejemplo 1: Cargo Único - RIESGO CRÍTICO
```
Entrada:
- Cargo: "Director Ejecutivo"
- Departamento: "Dirección"
- Cantidad de personas con este cargo: 1
- Tipo de sustitución: "NO_APLICA"
- Puesto clave: "Si"

Cálculo:
1. cantidadPersonasMismoCargo = 1
2. cargoUnico = SI
3. riesgoContinuidad = ALTO
4. poolPotencial = NO
5. riesgoCritico = SI (sin reemplazo + riesgo alto)
6. prioridadSucesion = ALTA (puesto clave + riesgo alto)
7. estadoPuesto = "CRÍTICO SIN REEMPLAZO"

Resultado: ⚠️ CRÍTICO - Requiere plan de sucesión inmediato
```

---

### Ejemplo 2: Dos Personas - RIESGO MODERADO
```
Entrada:
- Cargo: "Gerente de Operaciones"
- Departamento: "Operaciones"
- Cantidad de personas con este cargo: 2
- Tipo de sustitución: "individual"
- Puesto clave: "Si"

Cálculo:
1. cantidadPersonasMismoCargo = 2
2. cargoUnico = NO
3. riesgoContinuidad = MEDIO
4. poolPotencial = NO
5. riesgoCritico = NO (existe reemplazo)
6. prioridadSucesion = ALTA (puesto clave + riesgo medio)
7. estadoPuesto = "PUESTO CLAVE PRIORITARIO"

Resultado: 🟡 MODERADO - Plan de sucesión recomendado
```

---

### Ejemplo 3: Pool de Reemplazo - RIESGO BAJO
```
Entrada:
- Cargo: "Analista de Sistemas"
- Departamento: "Tecnología"
- Cantidad de personas con este cargo: 5
- Tipo de sustitución: "pool"
- Puesto clave: "No"

Cálculo:
1. cantidadPersonasMismoCargo = 5
2. cargoUnico = NO
3. riesgoContinuidad = BAJO
4. poolPotencial = SI
5. riesgoCritico = NO
6. prioridadSucesion = BAJA (no es puesto clave)
7. estadoPuesto = "CONTROLADO"

Resultado: 🟢 BAJO - Cobertura adecuada, monitoreo periódico
```

---

## Campos de Salida

| Campo | Tipo | Valores | Descripción |
|-------|------|--------|-------------|
| `cantidadPersonasMismoCargo` | Número | 1, 2, 3+ | Cantidad de empleados con el mismo cargo |
| `cargoUnico` | Enum | Si, No | ¿Es el cargo único en la organización? |
| `riesgoContinuidad` | Enum | Alto, Medio, Bajo | Riesgo de continuidad del negocio |
| `poolPotencial` | Enum | Si, No | ¿Existe potencial para pool de reemplazo? |
| `riesgoCritico` | Enum | Si, No | ¿Es una situación crítica sin reemplazo? |
| `prioridadSucesion` | Enum | Alta, Media, Baja | Prioridad de crear plan de sucesión |
| `estadoPuesto` | Texto | Ver PASO 7 | Clasificación descriptiva del puesto |

---

## Integración en la Interfaz

### Ubicaciones donde se visualizan estos datos:

1. **Plan de Sucesión** → Tarjeta de cada plan muestra:
   - `riesgoContinuidad` (color: rojo/amarillo/verde)
   - `estadoPuesto` (descripción textual)
   - `prioridadSucesion` (badge)

2. **Dashboard de Sucesión** → Métricas:
   - Planes por riesgo (Alto/Medio/Bajo)
   - Planes críticos sin reemplazo
   - Planes por prioridad

3. **Auditoría** → Historial de cambios en estos campos

---

## Notas Técnicas

- El cálculo se ejecuta automáticamente al crear un plan de sustitución
- Los valores se almacenan en la tabla `planes_sustitucion`
- El sistema recalcula automáticamente si cambia la cantidad de empleados con el mismo cargo
- Los campos son de solo lectura para el usuario (calculados por el sistema)
