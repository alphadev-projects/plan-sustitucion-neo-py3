import { drizzle } from "drizzle-orm/mysql2/http";
import { planesAccionSustitucion } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

try {
  const planes = await db.select().from(planesAccionSustitucion).limit(5);
  console.log("Planes encontrados:", planes);
} catch (error) {
  console.error("Error:", error.message);
}
