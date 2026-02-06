import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["standard", "admin"]).default("standard").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabla de usuarios locales para autenticación con usuario/contraseña
export const usuariosLocales = mysqlTable("usuarios_locales", {
  id: int("id").autoincrement().primaryKey(),
  usuario: varchar("usuario", { length: 100 }).notNull().unique(),
  contraseña: varchar("contraseña", { length: 255 }).notNull(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["standard", "admin"]).default("standard").notNull(),
  activo: int("activo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsuarioLocal = typeof usuariosLocales.$inferSelect;
export type InsertUsuarioLocal = typeof usuariosLocales.$inferInsert;

// Tabla de empleados para gestión de nómina
export const empleados = mysqlTable("empleados", {
  id: int("id").autoincrement().primaryKey(),
  sede: varchar("sede", { length: 100 }).notNull(),
  cedula: varchar("cedula", { length: 20 }).notNull().unique(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  area: varchar("area", { length: 150 }).notNull(),
  departamento: varchar("departamento", { length: 150 }).notNull(),
  cargo: varchar("cargo", { length: 200 }).notNull(),
});

export type Empleado = typeof empleados.$inferSelect;
export type InsertEmpleado = typeof empleados.$inferInsert;

// Tabla de planes de sustitución
export const planesSustitucion = mysqlTable("planes_sustitucion", {
  id: int("id").autoincrement().primaryKey(),
  empleadoId: int("empleadoId").notNull(),
  departamento: varchar("departamento", { length: 150 }).notNull(),
  colaborador: varchar("colaborador", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 200 }).notNull(),
  departamentoReemplazo: varchar("departamentoReemplazo", { length: 150 }).notNull(),
  reemplazo: varchar("reemplazo", { length: 255 }).notNull(),
  cargoReemplazo: varchar("cargoReemplazo", { length: 200 }).notNull(),
  tipoReemplazo: mysqlEnum("tipoReemplazo", ["individual", "pool"]).default("individual").notNull(),
  cargoPoolReemplazo: varchar("cargoPoolReemplazo", { length: 200 }),
  departamentoPoolReemplazo: varchar("departamentoPoolReemplazo", { length: 150 }),
  puestoClave: mysqlEnum("puestoClave", ["Si", "No"]).default("No").notNull(),
  usuario: varchar("usuario", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  // Campos técnicos internos para análisis automático de riesgo (NO visibles al usuario)
  cargoUnico: mysqlEnum("cargoUnico", ["Si", "No"]).default("No").notNull(),
  cantidadPersonasMismoCargo: int("cantidadPersonasMismoCargo").default(0).notNull(),
  riesgoContinuidad: mysqlEnum("riesgoContinuidad", ["Alto", "Medio", "Bajo"]).default("Bajo").notNull(),
  poolPotencial: mysqlEnum("poolPotencial", ["Si", "No"]).default("No").notNull(),
  riesgoCritico: mysqlEnum("riesgoCritico", ["Si", "No"]).default("No").notNull(),
  prioridadSucesion: mysqlEnum("prioridadSucesion", ["Alta", "Media", "Baja"]).default("Baja").notNull(),
});

export type PlanSustitucion = typeof planesSustitucion.$inferSelect;
export type InsertPlanSustitucion = typeof planesSustitucion.$inferInsert;
// Tabla de Reemplazos para Planes de Sustitución (relación 1:N, máximo 2 reemplazos por plan)
export const planReemplazos = mysqlTable("plan_reemplazos", {
  id: int("id").autoincrement().primaryKey(),
  planSustitucionId: int("planSustitucionId").notNull(),
  reemplazo: varchar("reemplazo", { length: 255 }).notNull(),
  cargoReemplazo: varchar("cargoReemplazo", { length: 200 }).notNull(),
  departamentoReemplazo: varchar("departamentoReemplazo", { length: 150 }).notNull(),
  orden: int("orden").default(1).notNull(), // 1 o 2 para indicar primer o segundo reemplazo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlanReemplazo = typeof planReemplazos.$inferSelect;
export type InsertPlanReemplazo = typeof planReemplazos.$inferInsert;

// Tabla de Planes de Sucesión (para puestos críticos)
export const planesSuccesion = mysqlTable("planes_sucesion", {
  id: int("id").autoincrement().primaryKey(),
  planSustitucionId: int("planSustitucionId").notNull(),
  departamento: varchar("departamento", { length: 150 }).notNull(),
  cargo: varchar("cargo", { length: 200 }).notNull(),
  colaborador: varchar("colaborador", { length: 255 }).notNull(),
  reemplazo: varchar("reemplazo", { length: 255 }).default("").notNull(),
  riesgoContinuidad: mysqlEnum("riesgoContinuidad", ["Alto", "Medio", "Bajo"]).notNull(),
  riesgoCritico: mysqlEnum("riesgoCritico", ["Si", "No"]).default("No").notNull(),
  prioridadSucesion: mysqlEnum("prioridadSucesion", ["Alta", "Media", "Baja"]).notNull(),
  estado: mysqlEnum("estado", ["Pendiente", "En Progreso", "Completado"]).default("Pendiente").notNull(),
  usuario: varchar("usuario", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanSuccesion = typeof planesSuccesion.$inferSelect;
export type InsertPlanSuccesion = typeof planesSuccesion.$inferInsert;

// Tabla de Planes de Acción
export const planesAccion = mysqlTable("planes_accion", {
  id: int("id").autoincrement().primaryKey(),
  planSuccesionId: int("planSuccesionId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descripcion: text("descripcion").notNull(),
  responsable: varchar("responsable", { length: 255 }).notNull(),
  fechaInicio: timestamp("fechaInicio").notNull(),
  fechaFin: timestamp("fechaFin").notNull(),
  estado: mysqlEnum("estado", ["No Iniciado", "En Progreso", "Completado", "Retrasado"]).default("No Iniciado").notNull(),
  progreso: int("progreso").default(0).notNull(), // Porcentaje 0-100
  usuario: varchar("usuario", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanAccion = typeof planesAccion.$inferSelect;
export type InsertPlanAccion = typeof planesAccion.$inferInsert;

// Tabla de Comentarios en Planes
export const comentariosPlanes = mysqlTable("comentarios_planes", {
  id: int("id").autoincrement().primaryKey(),
  planAccionId: int("planAccionId").notNull(),
  autor: varchar("autor", { length: 255 }).notNull(),
  contenido: text("contenido").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComentarioPlan = typeof comentariosPlanes.$inferSelect;
export type InsertComentarioPlan = typeof comentariosPlanes.$inferInsert;

// Tabla de Seguimiento de Planes de Acción (con evidencia)
export const seguimientoPlanes = mysqlTable("seguimiento_planes", {
  id: int("id").autoincrement().primaryKey(),
  planAccionId: int("planAccionId").notNull(),
  estado: mysqlEnum("estado", ["No Iniciado", "En Progreso", "Completado", "Retrasado"]).default("No Iniciado").notNull(),
  progreso: int("progreso").default(0).notNull(), // Porcentaje 0-100
  fechaInicio: timestamp("fechaInicio"),
  fechaFin: timestamp("fechaFin"),
  evidencia: text("evidencia"), // URL o descripción de evidencia
  archivoEvidencia: varchar("archivoEvidencia", { length: 500 }), // Ruta del archivo en S3
  comentario: text("comentario"),
  validadoPor: varchar("validadoPor", { length: 255 }), // Usuario que validó
  fechaValidacion: timestamp("fechaValidacion"),
  usuario: varchar("usuario", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SeguimientoPlan = typeof seguimientoPlanes.$inferSelect;
export type InsertSeguimientoPlan = typeof seguimientoPlanes.$inferInsert;

// Tabla de Auditoría para Historial de Cambios en Planes de Acción
export const auditoriaPlanesAccion = mysqlTable("auditoria_planes_accion", {
  id: int("id").autoincrement().primaryKey(),
  planAccionId: int("planAccionId").notNull(),
  usuarioId: varchar("usuarioId", { length: 255 }).notNull(),
  usuario: varchar("usuario", { length: 100 }).notNull(),
  accion: mysqlEnum("accion", ["CREADO", "ACTUALIZADO", "ESTADO_CAMBIO", "PROGRESO_CAMBIO", "COMPLETADO"]).notNull(),
  campoModificado: varchar("campoModificado", { length: 100 }),
  valorAnterior: text("valorAnterior"),
  valorNuevo: text("valorNuevo"),
  descripcion: text("descripcion"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditoriaPlanAccion = typeof auditoriaPlanesAccion.$inferSelect;
export type InsertAuditoriaPlanAccion = typeof auditoriaPlanesAccion.$inferInsert;

// Tabla de Sucesión de Puestos (para registrar sucesor de puestos clave)
export const sucesionPuestos = mysqlTable("sucesion_puestos", {
  id: int("id").autoincrement().primaryKey(),
  planSustitucionId: int("planSustitucionId").notNull(),
  puestoClave: varchar("puestoClave", { length: 255 }).notNull(), // Nombre del puesto crítico
  departamentoPuestoClave: varchar("departamentoPuestoClave", { length: 150 }).notNull(),
  cargoPuestoClave: varchar("cargoPuestoClave", { length: 200 }).notNull(),
  sucesor: varchar("sucesor", { length: 255 }).default("").notNull(), // Nombre del sucesor (vacío si no aplica)
  departamentoSucesor: varchar("departamentoSucesor", { length: 150 }).default("").notNull(),
  cargoSucesor: varchar("cargoSucesor", { length: 200 }).default("").notNull(),
  aplicaSucesion: mysqlEnum("aplicaSucesion", ["Si", "No"]).default("No").notNull(),
  usuario: varchar("usuario", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniquePuestoDepartamento: unique("unique_puesto_departamento").on(table.puestoClave, table.departamentoPuestoClave),
}));

export type SucesionPuesto = typeof sucesionPuestos.$inferSelect;
export type InsertSucesionPuesto = typeof sucesionPuestos.$inferInsert;

// Tabla de Historial de Sucesores (para auditoría)
export const historialSucesores = mysqlTable("historial_sucesores", {
  id: int("id").autoincrement().primaryKey(),
  sucesionPuestoId: int("sucesionPuestoId").notNull(),
  sucesorAnterior: varchar("sucesorAnterior", { length: 255 }).default("").notNull(),
  sucesorNuevo: varchar("sucesorNuevo", { length: 255 }).default("").notNull(),
  motivo: text("motivo"),
  usuario: varchar("usuario", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistorialSucesor = typeof historialSucesores.$inferSelect;
export type InsertHistorialSucesor = typeof historialSucesores.$inferInsert;

// Tabla de Planes de Acción para Sustitución
export const planesAccionSustitucion = mysqlTable("planes_accion_sustitucion", {
  id: int("id").autoincrement().primaryKey(),
  planSustitucionId: int("planSustitucionId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descripcion: text("descripcion").notNull(),
  responsable: varchar("responsable", { length: 255 }).notNull(),
  fechaInicio: timestamp("fechaInicio").notNull(),
  fechaFin: timestamp("fechaFin").notNull(),
  estado: mysqlEnum("estado", ["No Iniciado", "En Progreso", "Completado", "Retrasado"]).default("No Iniciado").notNull(),
  progreso: int("progreso").default(0).notNull(), // Porcentaje 0-100
  evidencia: text("evidencia"), // URL o descripción de evidencia
  archivoEvidencia: varchar("archivoEvidencia", { length: 500 }), // Ruta del archivo en S3
  comentarios: text("comentarios"),
  usuario: varchar("usuario", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanAccionSustitucion = typeof planesAccionSustitucion.$inferSelect;
export type InsertPlanAccionSustitucion = typeof planesAccionSustitucion.$inferInsert;

// Tabla de Auditoría para Planes de Acción de Sustitución
export const auditoriaPlanesAccionSustitucion = mysqlTable("auditoria_planes_accion_sustitucion", {
  id: int("id").autoincrement().primaryKey(),
  planAccionSustitucionId: int("planAccionSustitucionId").notNull(),
  usuarioId: varchar("usuarioId", { length: 255 }).notNull(),
  usuario: varchar("usuario", { length: 100 }).notNull(),
  accion: mysqlEnum("accion", ["CREADO", "ACTUALIZADO", "ESTADO_CAMBIO", "PROGRESO_CAMBIO", "COMPLETADO"]).notNull(),
  campoModificado: varchar("campoModificado", { length: 100 }),
  valorAnterior: text("valorAnterior"),
  valorNuevo: text("valorNuevo"),
  descripcion: text("descripcion"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditoriaPlanAccionSustitucion = typeof auditoriaPlanesAccionSustitucion.$inferSelect;
export type InsertAuditoriaPlanAccionSustitucion = typeof auditoriaPlanesAccionSustitucion.$inferInsert;
