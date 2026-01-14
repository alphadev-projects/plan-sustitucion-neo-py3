# TODO - Sistema de Gestión de Planes de Sustitución Pro

## Base de Datos y Backend
- [x] Configurar schema de base de datos (empleados, planes_sustitucion)
- [x] Implementar procedures tRPC para empleados (listar, filtrar, buscar)
- [x] Implementar procedures tRPC para planes (crear, listar, actualizar, eliminar, estadísticas)
- [x] Agregar validaciones de integridad referencial
- [x] Implementar notificaciones automáticas al propietario

## Frontend - Estructura y Navegación
- [x] Crear DashboardLayout con sidebar navigation
- [x] Configurar rutas principales (Dashboard, Planes, Nómina)
- [x] Diseñar tema visual con paleta azul/morado

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
- [ ] Mostrar estadísticas de nómina

## Testing
- [x] Escribir tests para procedures de empleados
- [x] Escribir tests para procedures de planes
- [x] Verificar validaciones de integridad
- [ ] Probar exportación a Excel

## Documentación y Entrega
- [ ] Crear checkpoint final
- [ ] Documentar funcionalidades principales
