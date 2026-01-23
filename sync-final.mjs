import { getDb } from "./server/_core/db.js";
import { syncMissingPlanes } from "./server/db.ts";

async function main() {
  try {
    console.log("Sincronizando planes faltantes...");
    const result = await syncMissingPlanes();
    console.log("Resultado:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
