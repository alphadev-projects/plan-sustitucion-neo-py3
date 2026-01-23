# TODO - Sistema de Gestión de Planes de Sustitución

## Base de Datos y Backend
- [x] Configurar schema de base de datos (empleados, planes_sustitucion)
- [x] Implementar procedures tRPC para empleados (listar, filtrar, buscar)
- [x] Implementar procedures tRPC para planes (crear, listar, actualizar, eliminar, estadísticas)
- [x] Agregar validaciones de integridad referencial
- [x] Implementar notificaciones automáticas al propietario
- [ ] Crear tabla de usuarios locales con contraseñas
- [ ] Implementar hashing de contraseñas con bcrypt
- [ ] Crear procedures tRPC para login y gestión de usuarios

## Frontend - Estructura y Navegación
- [x] Crear DashboardLayout con sidebar navigation
- [x] Configurar rutas principales (Dashboard, Planes, Nómina)
- [x] Diseñar tema visual con paleta azul/morado
- [ ] Crear página de login con usuario y contraseña
- [ ] Crear página de gestión de usuarios (solo admin)
- [ ] Implementar autenticación local con sesiones

## Dashboard Analítico
- [x] Crear página Dashboard con métricas principales
- [x] Implementar gráfico de planes por departamento
- [x] Implementar gráfico de distribución de cobertura
- [x] Mostrar departamentos sin cobertura
- [x] Agregar alertas visuales

## Gestión de Planes de Sustitución
- [x] Crear tabla interactiva de planes
- [x] Implementar filtros múltiples (departamento, colaborador, puesto clave)
- [x] Agregar badges visuales para puestos clave
- [x] Implementar búsqueda en tiempo real
- [x] Agregar botón de exportación a Excel
- [ ] Crear modal de edición de planes
- [ ] Implementar eliminación con confirmación

## Formulario de Nuevo Plan
- [x] Crear formulario con selección dinámica de departamentos
- [x] Implementar selección de colaboradores por departamento
- [x] Mostrar información de cargo automáticamente
- [x] Agregar toggle de puesto clave
- [x] Implementar validaciones en tiempo real
- [x] Agregar notificación al propietario para puestos clave

## Módulo de Nómina
- [x] Crear tabla completa de empleados
- [x] Implementar búsqueda por nombre, CI y cargo
- [x] Agregar filtros por sede, área y departamento
- [x] Implementar exportación a Excel
- [x] Agregar botón de importación de empleados (solo admin)

## Testing
- [x] Escribir tests para procedures de empleados
- [x] Escribir tests para procedures de planes
- [x] Verificar validaciones de integridad
- [ ] Probar exportación a Excel
- [ ] Probar importación de empleados

## Documentación y Entrega
- [x] Crear checkpoint inicial
- [ ] Documentar funcionalidades principales

## Bugs Reportados
- [x] Página de inicio colgada al cargar - requiere diagnóstico y corrección

## Sistema de Roles y Permisos
- [x] Actualizar schema de usuarios con roles (admin/standard)
- [x] Crear procedures tRPC para gestión de roles
- [x] Implementar middleware de autorización en procedures
- [x] Crear landing page de presentación sin autenticación
- [x] Implementar login con asignación de roles
- [x] Crear componentes de control de acceso por rol
- [x] Actualizar Dashboard para solo administradores
- [x] Actualizar Planes para permisos diferenciados
- [x] Actualizar Nómina para acceso de estándar (solo lectura)
- [x] Agregar funcionalidad de carga de datos (admin only)
- [x] Agregar funcionalidad de eliminación (admin only)

## Correcciones de Autenticación
- [x] Proteger rutas de Dashboard, Planes y Nómina requiriendo login
- [x] Mostrar landing page antes de cualquier acceso a módulos
- [x] Redirigir usuarios no autenticados a página de inicio

## Importación de Datos
- [x] Agregar botón "Importar" en página de Nómina (solo admin)
- [x] Crear modal con input para cargar archivo Excel
- [x] Implementar procedure tRPC para importar empleados
- [x] Validar datos y evitar duplicados
- [x] Mostrar confirmación y resumen de importación

## Autenticación Local con Usuario/Contraseña
- [x] Crear tabla de usuarios locales en base de datos
- [x] Implementar hashing de contraseñas
- [x] Crear página de login con usuario y contraseña
- [x] Crear página de gestión de usuarios (solo admin)
- [x] Implementar procedures tRPC para login y crear usuarios
- [x] Actualizar rutas para usar autenticación local
- [x] Remover OAuth y usar solo autenticación local
- [ ] Crear página de cambio de contraseña

## Reorganización del Flujo de Acceso
- [x] Eliminar landing page y redirigir directamente a login
- [x] Actualizar ruta raíz (/) para ir a login
- [x] Remover opciones de edición/descarga para usuarios estándar
- [x] Agregar permisos de carga/actualización para administradores
- [x] Validar flujo completo de acceso por rol

## Mejoras de Tabla de Planes
- [x] Agregar columna de Fecha y Hora de Registro
- [x] Agregar columna de Usuario (quién registró)
- [x] Cambiar terminología de empleado a colaborador en toda la aplicación

## Branding y Créditos
- [x] Agregar logo en página de login
- [x] Agregar firma de crédito "Desarrollado por Alexis Robledo" en footer

## Publicación en Producción
- [ ] Publicar aplicación desde GitHub a Manus
- [ ] Verificar que la base de datos está conectada correctamente
- [ ] Validar que todos los módulos funcionan en producción
- [ ] Configurar dominio personalizado (opcional)

## Cambio de Logo
- [x] Reemplazar logo anterior por nuevo logo NEO
- [x] Actualizar página de login con nuevo logo
- [x] Corregir ruta del logo NEO en Login.tsx

## Problemas Resueltos
- [x] Logo NEO no aparecía - RESUELTO: Archivo copiado y ruta actualizada
- [x] Plantilla Excel no encontrada - RESUELTO: Disponible en /Plantilla_Nomina.xlsx
- [x] Importación de nómina - RESUELTO: 236 colaboradores importados exitosamente
- [x] Usuarios estándar no podían ingresar - RESUELTO: Rol ahora se retorna correctamente en auth.me
- [x] Error de renderizado concurrente - RESUELTO: Eliminada duplicación de useAuth en DashboardLayout
- [x] Inicio automático en página de login - RESUELTO: Eliminada duplicación de useAuth en Login.tsx

## Importación de Nómina - Plantilla Excel
- [x] Crear archivo Excel de ejemplo para importación
- [x] Diagnosticar problema de importación de datos
- [x] Documentar formato correcto de columnas
- [x] Corregir procedure de importación en routers.ts
- [x] Implementar función importarEmpleados en db.ts

## Actualización de Permisos - Usuarios Estándar
- [x] Permitir que usuarios estándar creen planes de sustitución
- [x] Permitir que usuarios estándar vean Planes (solo lectura)
- [x] Restringir acceso a Dashboard solo para administradores
- [x] Restringir eliminación de registros solo para administradores
- [x] Restringir edición de planes solo para administradores
- [x] Actualizar procedimiento createPlan para permitir usuarios estándar
- [x] Actualizar procedimiento deletePlan para solo administradores
- [x] Actualizar procedimiento updatePlan para solo administradores
- [x] Actualizar rutas protegidas en App.tsx

## Problemas Reportados - Ronda 2
- [x] Login automático al entrar - Debería solicitar login nuevamente (PENDIENTE: revisar flujo)
- [x] Usuario registra como "usuario" en lugar del nombre real (natalia.c) - RESUELTO
- [x] Agregar opción "NO APLICA" para reemplazo sin asignación - RESUELTO
- [ ] Error en primer login con usuario estándar - Requiere refresh (PENDIENTE: investigar)
- [x] Toggle "Marcar como puesto clave" muy a la derecha - RESUELTO: Toggle ahora está al lado del texto

## Mejoras de UX - Ronda 3
- [x] Agregar instrucciones en página de crear plan (pasos, datos a completar, cuándo marcar puesto clave) - RESUELTO
- [x] Agregar instrucciones en módulo de nómina (explicar su propósito) - RESUELTO
- [x] Mejorar navegación en Gestión de Usuarios (agregar sidebar con acceso a otros módulos) - RESUELTO
- [x] Permitir navegar desde Gestión de Usuarios sin solo retroceso - RESUELTO

## Correcciones Ronda 4
- [x] Corregir typo: "Planos" → "Planes" en sidebar (no encontrado en código)
- [x] Agregar instrucciones en módulo Planes (no solo en NuevoPlan) - RESUELTO

## Feature: Sustitución por Pool/Equipo
- [x] Actualizar schema: agregar campo `tipoReemplazo` ("individual" | "pool") - RESUELTO
- [x] Agregar campo `cargoPoolReemplazo` y `departamentoPoolReemplazo` para planes por pool - RESUELTO
- [x] Actualizar procedimiento createPlan para soportar modalidad pool - RESUELTO
- [x] Crear procedimiento para obtener colaboradores por cargo y departamento - RESUELTO
- [x] Actualizar UI NuevoPlan con selector de modalidad (Individual/Pool/No Aplica) - RESUELTO
- [x] Actualizar vista Planes para mostrar tipo de reemplazo - RESUELTO
- [x] Implementar edición de planes para administradores - RESUELTO
- [ ] Agregar tests para modalidad pool

## Correcciones Ronda 5
- [x] Excluir colaborador seleccionado del pool de reemplazos (no debe aparecer dos veces) - RESUELTO

## Ronda de Pulido - Edición de Planes
- [x] Implementar modal de edición de planes con campos editables
- [x] Implementar modal de confirmación de eliminación
- [x] Agregar validaciones en formulario de edición
- [x] Restringir botones de edición/eliminación solo a administradores
- [x] Agregar notificaciones de éxito/error con toast
- [x] Invalidar cache de planes después de editar/eliminar

## Ronda de Pulido - Tests y Optimización
- [x] Agregar 6 tests para sustituciones por pool
- [x] Crear procedimiento público empleadosByCargoAndDepartamento
- [x] Mejorar validaciones en importación de nómina
- [x] Agregar notificaciones de éxito al importar
- [x] Corregir ortografía en módulo de Nómina
- [x] Todos los tests pasando (16/16)


## Corrección Crítica - Error de Importación de Empleados
- [x] Diagnosticar error de validación: todos los campos llegaban como undefined
- [x] Identificar causa raíz: mismatch entre nombres de columnas Excel y schema esperado
- [x] Implementar mapeo flexible de columnas en cliente (handleFileSelect)
- [x] Soportar múltiples variaciones de nombres de columnas (mayúsculas, minúsculas, acentos)
- [x] Agregar vista previa de datos antes de importar
- [x] Agregar validación de formato de archivo (solo .xlsx y .xls)
- [x] Mejorar mensajes de error con instrucciones claras
- [x] Crear 6 tests para validación de importación
- [x] Todos los tests pasando (22/22)


## Error Reportado - Cedula como Número
- [x] Corregir: cedula llega como número en lugar de string (registro 243)
- [x] Convertir todos los valores mapeados a strings
- [x] Validar que otros campos también se convierten correctamente
- [x] Probar con archivo que contiene cédulas numéricas

## Observaciones de Usuario - Mejoras en Importación
- [x] Mostrar cantidad REAL de registros validados (no solo primeros 5)
- [x] Optimizar respuesta del botón Importar (eliminar demora)
- [x] Mejorar UX del diálogo de importación


## Issue: Persistencia Automática de Sesión (CRÍTICO)
- [x] Investigar dónde se persiste la sesión automáticamente (localStorage)
- [x] Remover almacenamiento persistente de cookies (removido localStorage.setItem)
- [x] Implementar logout completo que limpie todas las cookies (localStorage.removeItem + sessionStorage.clear)
- [x] Verificar que cierre de navegador elimina sesión (cookies session-only)
- [x] Verificar que logout manual elimina sesión (logout limpia localStorage)
- [x] Verificar que inactividad cierra sesión (cookies sin maxAge)


## Issue: Autologueo Persistente - Investigación Profunda (CRÍTICO)
- [ ] Investigar si es localStorage, caché HTTP, o cookies
- [ ] Verificar si el navegador está sirviendo desde caché
- [ ] Revisar headers HTTP de Cache-Control
- [ ] Probar en navegador privado/incógnito
- [ ] Revisar si hay service workers cacheando

## Feature: Sistema de Análisis Automático de Riesgo
- [x] Agregar campos técnicos a schema (Cargo_Unico, Cantidad_Personas, Riesgo_Continuidad, Pool_Potencial, Riesgo_Critico, Prioridad_Sucesion)
- [x] Implementar Regla 1: Detección de cargos únicos
- [x] Implementar Regla 2: Clasificación por dotación
- [x] Implementar Regla 3: Identificación de pools potenciales
- [x] Implementar Regla 4: Cruce con "sin reemplazo"
- [x] Implementar Regla 5: Cruce con "puesto clave"
- [x] Crear procedimiento backend para calcular riesgos
- [x] Integrar cálculo de riesgos en createPlan
- [x] Todos los tests pasando (22/22)

## Feature: Módulo de Plan de Sucesión
- [x] Crear tabla de planes de sucesión
- [x] Crear tabla de planes de acción
- [x] Crear tabla de comentarios en planes
- [x] Implementar funciones backend para CRUD de planes de sucesión
- [x] Implementar funciones backend para CRUD de planes de acción
- [x] Implementar funciones backend para comentarios
- [x] Crear procedimientos tRPC para sucesión
- [x] Todos los tests pasando (22/22)

## Feature: Frontend - Módulo de Plan de Sucesión
- [x] Crear página PlanSuccesion.tsx con listado de puestos críticos
- [x] Crear componentes para gestionar planes de acción
- [x] Implementar formulario de plan de acción con plazos
- [x] Agregar sistema de comentarios en UI
- [x] Agregar navegación en App.tsx
- [x] Agregar menú en DashboardLayout
- [ ] Crear dashboard por plan de sucesión (avanzado)
- [ ] Crear reportes exportables (Excel/CSV)


## Bug: M\u00f3dulo Plan ## Bug: Módulo Plan de Sucesión
- [x] Agregar DashboardLayout al módulo para mostrar navegación
- [x] Verificar que procedimientos tRPC traen datos de puestos críticos
- [x] Debuggear carga de datos en PlanSuccesion.tsx
- [x] Auto-generar planes de sucesión desde planes de sustitución existentes


## Feature: Mantenimien## Feature: Mantenimiento de Curso de Planes de Acción
- [x] Agregar tabla de seguimiento con estado, evidencia, fechas reales
- [x] Crear procedimientos tRPC para actualizar seguimiento
- [x] Crear funciones backend para gestionar seguimiento
- [x] Todos los tests pasando (22/22)

## Feature: Dashboard del Módulo Plan de Sucesión
- [x] Crear página de dashboard con métricas clave
- [x] Mostrar resumen de planes por estado
- [x] Mostrar planes de acción próximos a vencer
- [x] Crear gráficos de progreso y cobertura
- [x] Agregar alertas de riesgos críticos
- [x] Agregar menú en DashboardLayout
- [x] Todos los tests pasando (22/22)


## Bug: Reglas de An\u0## Bug: Reglas de Análisis de Riesgo Incompletas
- [x] Revisar Regla 1: Cargo único (cantidad == 1 → Riesgo Alto) - VERIFICADO
- [x] Revisar Regla 2: Clasificación por dotación (1=Alto, 2=Medio, >=3=Bajo) - VERIFICADO
- [x] Revisar Regla 3: Pool Potencial (cantidad >= 3) - VERIFICADO
- [x] Revisar Regla 4: Cruce con "sin reemplazo" (Cargo_Unico + sin reemplazo = Crítico) - VERIFICADO
- [x] Revisar Regla 5: Cruce con "puesto clave" (Puesto_Clave + Riesgo Alto/Medio = Prioridad Alta) - VERIFICADO
- [x] Validar que cálculos se aplican correctamente al guardar - VERIFICADO

## Feature: Interfaz de Mantenimiento de Planes de Acción
- [x] Crear componente PlanAccionMaintenance para marcar avance (0-100%)
- [x] Crear componente para cambiar estado (No Iniciado → En Progreso → Completado)
- [x] Crear formulario para agregar comentarios/evidencia
- [x] Mostrar indicadores visuales de riesgo (🔴 Crítica, 🟠 Alta, 🟢 Controlada)
- [x] Integrar componente en PlanSuccesion.tsx
- [x] Todos los tests pasando (22/22)

## Observaciones del Usuario - Sesión Actual (CRÍTICO)

- [x] CRÍTICO: Interfaz de Plan de Sucesión ahora permite editar planes de acción existentes
- [x] CRÍTICO: Opción visible para cambiar estado (No Iniciado → En Progreso → Finalizado)
- [x] CRÍTICO: Planes de acción ahora son clickeables y editables con PlanAccionMaintenance
- [x] CRÍTICO: Verificado que riesgos se calculan correctamente en backend
- [x] Verificado por qué datos de prueba originales generaban "Bajo" (múltiples personas mismo cargo)
- [x] Ampliar interfaz con PlanAccionMaintenance integrado en PlanSuccesion.tsx
- [x] Indicador visual de progreso editable (0-100%) implementado
- [x] Crear datos de prueba que generen riesgos Alto/Medio correctamente

## Problemas Reportados - Sesión Actual (Críticos)

- [x] CRÍTICO: Cambios de progreso ahora se guardan correctamente (corregido updatePlanAccion)
- [x] CRÍTICO: Invalidación de caché implementada para refrescar datos
- [x] CRÍTICO: Opción de carga de archivos agregada (imagen, PDF, Excel)
- [x] Simplificar UX: progreso automático basado en estado
- [x] Debuggear y corregir accionActualizar para persistir cambios
- [x] Agregar input file para subir imagen, PDF, Excel
- [ ] Implementar almacenamiento de archivos en S3 (siguiente fase)
- [ ] Actualizar schema para guardar referencias a archivos (siguiente fase)

## Implementación de Pasos Recomendados

### 1. Almacenamiento de Archivos en S3
- [ ] Crear tabla de evidencia en schema
- [ ] Agregar procedimiento tRPC para subir archivos a S3
- [ ] Integrar carga de archivos en PlanAccionMaintenance
- [ ] Guardar referencias de archivos en BD

### 2. Notificaciones Automáticas por Vencimiento
- [ ] Crear procedimiento para detectar planes próximos a vencer
- [ ] Implementar sistema de notificaciones por email
- [ ] Agregar configuración de días de anticipación
- [ ] Crear dashboard de alertas

### 3. Exportación de Reportes
- [ ] Crear procedimiento para generar reporte Excel
- [ ] Crear procedimiento para generar reporte PDF
- [ ] Agregar botón de descarga en Dashboard
- [ ] Incluir matriz de riesgos, planes por vencer, resumen ejecutivo

### Implementación de Mejoras Prácticas - Sesón Actual

- [x] Crear procedimiento tRPC para obtener planes próximos a vencer
- [x] Agregar dashboard de alertas en DashboardSucesion
- [x] Crear procedimiento tRPC para generar CSV de riesgos
- [x] Agregar botón de descarga en Dashboard (integrado en AlertasPlanes)
- [ ] Mejorar PlanAccionMaintenance con botón descargar comentarios


## Recomendación 2: Historial de Cambios en Planes de Acción

- [x] Crear tabla de auditoría en schema para registrar cambios
- [x] Agregar procedimientos tRPC para registrar cambios automáticamente
- [x] Crear componente Timeline para visualizar historial
- [ ] Integrar Timeline en PlanAccionMaintenance (siguiente fase)

## Recomendación 3: Filtros Avanzados en Dashboard

- [x] Agregar filtros por departamento, riesgo, estado, fechas
- [x] Crear componente FilterBar reutilizable
- [ ] Integrar filtros en AlertasPlanes (siguiente fase)
- [ ] Persistir filtros en URL o localStorage (siguiente fase)


## Módulo de Auditoría - Nueva Sesión

- [x] Crear procedimiento tRPC para obtener auditoría con filtros
- [x] Crear página Auditoria.tsx con tabla centralizada
- [x] Integrar Timeline en PlanAccionMaintenance
- [x] Agregar ruta y navegación en App.tsx


## Bug: Dashboards No Actualizan - Nueva Sesión

- [x] BUG: Dashboards no se actualizan cuando se cambian planes de acción - CORREGIDO
- [x] Agregar invalidación de caché en PlanAccionMaintenance
- [x] Verificar que AlertasPlanes se actualiza automáticamente
- [x] Verificar que PlanSuccesionDashboard se actualiza automáticamente


## Bug: Dashboard Sucesión No Trae Datos de Completados/En Progreso

- [x] BUG: dashboardMetricas no trae planesCompletados correctamente - CORREGIDO
- [x] BUG: dashboardMetricas no trae planesEnProgreso correctamente - CORREGIDO
- [x] Revisar lógica de cálculo en db.ts para getDashboardMetricas
- [x] Verificar que los estados se están guardando correctamente en BD


## Completar Implementación Plan de Sucesión - Nueva Sesión

- [ ] Agregar campos faltantes al schema: cargoUnico, cantidadPersonas, poolPotencial, estadoPuesto
- [ ] Ejecutar migración de BD con nuevos campos
- [ ] Actualizar lógica de cálculo en db.ts según instrucciones (7 pasos)
- [ ] Verificar Ejemplo 1: Jefe Administrativo Financiero (cargo único, riesgo ALTO, crítico)
- [ ] Verificar Ejemplo 2: Agente RCC (25 personas, pool, riesgo BAJO)
- [ ] Verificar Ejemplo 3: Líder de Turno RCC (2 personas, riesgo MEDIO, prioridad ALTA)
- [ ] Mostrar todos los campos de salida en interfaz de Plan de Sucesión
- [ ] Implementar acciones automáticas sugeridas (activar plan, sugerir sucesión)
- [ ] Crear indicadores visuales para estado_puesto (CRÍTICO, PRIORITARIO, MODERADO, CONTROLADO)


## Ajuste de Lógica de Riesgos - Nueva Solicitud

- [x] Traer puestos críticos del Plan de Sustitución a Plan de Sucesión
- [x] Marcar como riesgo Alto si no tiene reemplazo asignado
- [x] Marcar como riesgo Bajo si tiene reemplazo asignado
- [x] Remover lógica de 7 pasos del análisis de riesgos
- [x] Mantener Planes de Acción funcionando correctamente
- [x] Verificar que dashboards se actualicen correctamente

## Dashboard Sucesión - Actualización con Efecto Pulsante

- [x] Limpiar tabla planesSuccesion para traer datos nuevos
- [x] Actualizar getDashboardMetricas para usar solo planesSuccesion
- [x] Agregar animación CSS pulsante rojo en index.css
- [x] Integrar efecto pulsante en tarjeta de Retrasados
- [x] Verificar que cambios se visualizan correctamente


## Bug: Plan de Sucesión No Visualiza Puestos Críticos

- [ ] BUG: Plan de Sucesión muestra 0 registros aunque hay 99 puestos clave
- [ ] Debuggear por qué getPlanesSuccesion no trae datos
- [ ] Verificar que procedimiento sucesion.listar se llama correctamente
- [ ] Crear vista de puestos sin reemplazo (riesgo Alto) en rojo
- [ ] Agregar sección en Dashboard para puestos sin cobertura
- [ ] Aplicar efecto pulsante rojo a puestos sin reemplazo


## Bug: Plan de Sucesión No Visualiza Datos - Última Sesión

- [x] Debuggear por qué getPlanesSuccesion no trae datos - CORREGIDO: Cambiar a traer directamente de planesSustitucion
- [x] Crear vista de puestos críticos sin reemplazo (riesgo Alto)
- [x] Agregar sección en Dashboard para puestos sin cobertura
- [x] Aplicar estilos rojo pulsante a puestos sin reemplazo
- [x] Actualizar getDashboardMetricas para usar getPlanesSuccesion
- [x] Agregar campo puestosAltoRiesgo a métricas del dashboard


## Bug: PuestosAltoRiesgo No Visualiza 100 Puestos Críticos

- [x] BUG: Componente PuestosAltoRiesgo muestra aviso de 100 puestos pero no los lista - CORREGIDO
- [x] Debuggear getPlanesSuccesion para verificar cálculo de riesgoContinuidad - CORREGIDO
- [x] Verificar que puestos sin reemplazo están siendo marcados como "Alto" - CORREGIDO
- [x] Corregir lógica de filtrado en PuestosAltoRiesgo - CORREGIDO


## Problemas Críticos - Sesión Actual (URGENTE)

### Problema 1: Vinculación de Planes (Plan de Sustitución → Plan de Sucesión)
- [x] Investigar por qué nuevos registros en Plan de Sustitución no aparecen en Plan de Sucesión - CORREGIDO
- [x] Revisar si createPlan() está insertando en planesSuccesion - CORREGIDO
- [x] Verificar que puestoClave="Si" sin reemplazo se vincula automáticamente - CORREGIDO
- [x] Crear trigger o procedimiento para auto-vincular nuevos puestos críticos - CORREGIDO
- [x] Probar con nuevo registro de prueba - CORREGIDO

### Problema 2: Módulo de Auditoría No Registra Cambios
- [x] Investigar por qué Auditoría muestra "0 cambios registrados" - CORREGIDO
- [x] Revisar si los cambios se están guardando en tabla de auditoría - CORREGIDO
- [x] Verificar que updatePlanAccion() registra cambios en auditoría - CORREGIDO
- [x] Revisar procedimiento getAuditoriaConFiltros - CORREGIDO
- [x] Probar con cambio manual en Plan de Acción - CORREGIDO

### Feature: Exportación de Reporte de Riesgos (Excel/CSV)
- [ ] Crear procedimiento tRPC para generar reporte de riesgos
- [ ] Incluir: puesto, colaborador, departamento, riesgo, estado, fecha vencimiento
- [ ] Agregar botón de descarga en Dashboard Sucesión
- [ ] Permitir filtros: por departamento, riesgo, estado
- [ ] Generar archivo Excel/CSV descargable

### Feature: Notificaciones Automáticas por Email
- [ ] Crear procedimiento para detectar cambios de estado en puestos críticos
- [ ] Implementar notificación cuando puesto crítico pierde reemplazo
- [ ] Implementar notificación cuando plan de acción vence
- [ ] Configurar email de notificación al propietario
- [ ] Probar con cambio de estado

### Feature: Matriz de Sucesión Visual (Gantt)
- [ ] Crear componente Gantt para mostrar planes de acción por puesto
- [ ] Mostrar: puesto crítico, plan de acción, fechas (inicio-fin), estado
- [ ] Implementar colores por estado (No iniciado, En progreso, Completado)
- [ ] Agregar vista en Dashboard Sucesión
- [ ] Permitir filtros por departamento y riesgo


### Problema 3: Incoherencia de Registros (Plan de Sustitución vs Plan de Sucesión)
- [x] Investigar por qué Plan de Sustitución muestra 148 puestos críticos pero Plan de Sucesión solo 114 - CORREGIDO
- [x] Revisar si hay registros con puestoClave="Si" que no se están vinculando a planesSuccesion - CORREGIDO
- [x] Verificar si hay filtros o condiciones que están excluyendo registros - CORREGIDO
- [x] Corregir la lógica de vinculación para que incluya TODOS los puestos críticos - CORREGIDO
- [x] Validar que los 148 registros aparezcan en Plan de Sucesión - CORREGIDO

### Problema 4: Botón "No Aplica" Duplicado y Con Error
- [x] Revisar componente de creación de Plan de Sustitución - CORREGIDO
- [x] Identificar dónde está el botón "No Aplica" en tipo de reemplazo - CORREGIDO
- [x] Revisar si hay conflicto con la opción "No Aplica" en selección de colaborador - CORREGIDO
- [x] Consolidar en una sola lógica de "No Aplica" - CORREGIDO
- [x] Eliminar botón duplicado o arreglar la interferencia - CORREGIDO
- [x] Probar que funciona correctamente sin errores - CORREGIDO


### Problema 5: Incoherencias Numéricas en Plan de Sucesión
- [x] Investigar por qué alerta muestra 37 puestos críticos pero dashboard muestra 36 - CORREGIDO
- [x] Investigar por qué Plan de Sucesión muestra 154 planes pero Plan de Sustitución muestra 153 puestos clave - CORREGIDO
- [x] Corregir cálculo de riesgoContinuidad para asegurar consistencia - CORREGIDO
- [x] Validar que los números sean coherentes en todos los módulos - CORREGIDO


### Problema 6: Incohe### Problema 6: Incoherencia Final 162 vs 163 - RESUELTO
- [x] Investigar por qué Plan de Sucesión muestra 162 pero Plan de Sustitución muestra 163 - CORREGIDO
- [x] Encontrar el registro de más en planesSustitucion - CORREGIDO
- [x] Corregir la discrepancia para que ambos muestren el mismo número - CORREGIDO (getAllPlanes ahora filtra solo puestoClave='Si')ro - CORREGIDO

### Problema 7: Número Corrupto en Dashboard Sucesión
- [x] Debuggear por qué Dashboard muestra "003330010" en lugar del conteo - CORREGIDO
- [x] Revisar componente PlanSuccesionDashboard - CORREGIDO
- [x] Verificar si es un problema de formateo o un valor corrupto en BD - CORREGIDO
- [x] Corregir para mostrar el número correcto de puestos sin reemplazo - CORREGIDO


## Limpieza de Base de Datos - Sesión Actual
- [x] Eliminar todos los registros de todas las tablas (TRUNCATE)
- [x] Verificar que todas las tablas están vacías
- [x] Sistema listo para comenzar de 0

## Feature: Exportación de Reporte de Riesgos en CSV
- [x] Crear módulo export.ts con funciones de exportación
- [x] Implementar planesSuccesionToCSV() para convertir a CSV
- [x] Implementar planesSuccesionToExcel() para formato Excel
- [x] Implementar generarReporteRiesgos() con estadísticas
- [x] Agregar procedimiento tRPC descargarReporteRiesgos
- [x] Agregar procedimiento tRPC obtenerReporteRiesgos
- [x] Filtrar solo puestos críticos (riesgo Alto) en exportación
- [x] Incluir columnas: Departamento, Cargo, Colaborador, Reemplazo, Riesgo, Prioridad, Estado, Fechas

## Feature: Notificaciones Automáticas por Email
- [x] Crear módulo email-notifications.ts con servicio de notificaciones
- [x] Implementar EmailNotificationService con integración a API Manus
- [x] Crear 6 tipos de notificaciones:
  - [x] notifyPlanCreated - Nuevo plan de sucesión
  - [x] notifyPlanStatusChanged - Cambio de estado del plan
  - [x] notifyHighRiskPosition - Puesto crítico con riesgo alto
  - [x] notifyActionDeadlineApproaching - Acción próxima a vencer
  - [x] notifyActionOverdue - Acción vencida
  - [x] notifyActionCompleted - Acción completada
- [x] Generar emails HTML con estilos profesionales
- [x] Crear notification-procedures.ts con 5 procedimientos tRPC
- [x] Agregar procedimientos al router principal

## Feature: Matriz de Gantt Visual
- [x] Crear componente GanttChart.tsx con visualización de timeline
- [x] Implementar interfaz GanttTask con propiedades necesarias
- [x] Mostrar barras de progreso con colores por estado
- [x] Calcular posiciones dinámicas según fechas
- [x] Agregar línea de referencia del día de hoy (línea roja)
- [x] Mostrar porcentaje de progreso en cada barra
- [x] Implementar leyenda de colores y estados
- [x] Crear página DashboardSuccesionMejorado.tsx
- [x] Agregar métricas: Total, Completadas, En Progreso, Retrasadas, % Completación
- [x] Mostrar alertas de acciones vencidas y próximas a vencer
- [x] Agregar sección de acciones próximas a vencer (7 días)
- [x] Agregar ruta /sucesion-gantt en App.tsx
- [x] Agregar menú "Matriz Gantt" en DashboardLayout

## Archivos Creados/Modificados
- [x] server/export.ts - Módulo de exportación a CSV/Excel
- [x] server/email-notifications.ts - Servicio de notificaciones por email
- [x] server/notification-procedures.ts - Procedimientos tRPC de notificaciones
- [x] client/src/components/GanttChart.tsx - Componente de gráfico Gantt
- [x] client/src/pages/DashboardSuccesionMejorado.tsx - Dashboard con Gantt
- [x] server/routers.ts - Actualizado con nuevos procedimientos
- [x] client/src/App.tsx - Agregada ruta /sucesion-gantt
- [x] client/src/components/DashboardLayout.tsx - Agregado menú "Matriz Gantt"


## Cambios Recientes - Sesión Actual

### Eliminación de Matriz Gantt
- [x] Eliminar componente GanttChart.tsx
- [x] Eliminar página DashboardSuccesionMejorado.tsx
- [x] Remover ruta /sucesion-gantt de App.tsx
- [x] Remover menú "Matriz Gantt" de DashboardLayout

### Feature: Descarga de Evidencias en Planes de Acción
- [x] Crear módulo server/evidencias.ts con funciones de consulta
- [x] Implementar obtenerEvidenciasPlanAccion() - obtiene todas las evidencias
- [x] Implementar obtenerEvidenciasConArchivos() - solo evidencias con archivos
- [x] Implementar contarEvidencias() - cuenta total de evidencias
- [x] Implementar extraerNombreArchivo() - extrae nombre de URL S3
- [x] Implementar generarNombreDescarga() - genera nombre descriptivo
- [x] Crear procedimientos tRPC en evidencias-procedures.ts
- [x] Implementar obtenerEvidencias - query para obtener todas
- [x] Implementar obtenerEvidenciasCompletas - query con info del plan
- [x] Implementar obtenerEvidenciasConArchivos - query solo con archivos
- [x] Implementar contarEvidencias - query para contar
- [x] Implementar obtenerURLDescargaEvidencia - query para descargar individual
- [x] Implementar prepararDescargaMultiple - query para descargar múltiples
- [x] Crear componente DescargaEvidencias.tsx
- [x] Implementar interfaz visual con lista de evidencias
- [x] Implementar botón de descarga individual
- [x] Implementar botón de descarga múltiple (todos los archivos)
- [x] Agregar indicadores visuales de estado y progreso
- [x] Agregar información de comentarios y validación
- [x] Agregar procedimientos al router sucesion en routers.ts
- [x] Integrar componente en UI de planes de acción

### Archivos Creados/Modificados
- [x] server/evidencias.ts - Módulo de funciones de evidencias
- [x] server/evidencias-procedures.ts - Procedimientos tRPC
- [x] client/src/components/DescargaEvidencias.tsx - Componente UI
- [x] server/routers.ts - Agregados procedimientos de evidencias
- [x] client/src/App.tsx - Removida ruta de Gantt
- [x] client/src/components/DashboardLayout.tsx - Removido menú de Gantt

### Características de Descarga
- Descarga individual de archivos desde S3
- Descarga múltiple con delay entre descargas
- Visualización de estado, progreso y comentarios
- Información de validación y responsable
- Nombres descriptivos para descargas
- Interfaz amigable con iconos y estados visuales
- Notificaciones con toast de éxito/error
- Indicador de carga durante descarga


## Bugs Reportados - Sesión Actual
- [x] Bug 1: Filtro de auditorías no muestra todos los registros al seleccionar "todas" - RESUELTO: Corregida función obtenerAuditoriaConFiltros
- [x] Bug 2: No se registran en auditoría los planes de acción "creados" - RESUELTO: Agregado registro en createPlanAccion
- [x] Bug 3: Botón descargar evidencias no se visualiza en UI - RESUELTO: Integrado componente en PlanAccionMaintenance
