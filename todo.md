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
