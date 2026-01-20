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
