import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

// Tabla de Planes de Sucesión (para puestos críticos)
export const planesSuccesion = mysqlTable("planes_sucesion", {
  id: int("id").autoincrement().primaryKey(),
  planSustitucionId: int("planSustitucionId").notNull(),
  departamento: varchar("departamento", { length: 150 }).notNull(),
  cargo: varchar("cargo", { length: 200 }).notNull(),
  colaborador: varchar("colaborador", { length: 255 }).notNull(),
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
