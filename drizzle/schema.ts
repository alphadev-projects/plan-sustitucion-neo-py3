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
  puestoClave: mysqlEnum("puestoClave", ["Si", "No"]).default("No").notNull(),
  usuario: varchar("usuario", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanSustitucion = typeof planesSustitucion.$inferSelect;
export type InsertPlanSustitucion = typeof planesSustitucion.$inferInsert;