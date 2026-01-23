import { initDb } from "./server/db.ts";
import { db as getDb } from "./server/_core/db.ts";
import { planesSustitucion, planesSuccesion } from "./drizzle/schema.ts";
import { eq, isNull } from "drizzle-orm";

async function syncMissingPlanes() {
  try {
    console.log("🔄 Iniciando sincronización de planes faltantes...");
    
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Obtener todos los puestos críticos que no están en planesSuccesion
    const missingPlanes = await db
      .select()
      .from(planesSustitucion)
      .where(eq(planesSustitucion.puestoClave, "Si"));

    console.log(`📊 Total de puestos críticos: ${missingPlanes.length}`);

    // Obtener los IDs que ya están en planesSuccesion
    const existingIds = await db
      .select({ planSustitucionId: planesSuccesion.planSustitucionId })
      .from(planesSuccesion);

    const existingIdSet = new Set(existingIds.map(e => e.planSustitucionId));
    console.log(`✅ Planes ya vinculados: ${existingIdSet.size}`);

    // Filtrar los planes que faltan
    const planesToAdd = missingPlanes.filter(p => !existingIdSet.has(p.id));
    console.log(`❌ Planes faltantes: ${planesToAdd.length}`);

    if (planesToAdd.length === 0) {
      console.log("✨ Todos los planes están sincronizados.");
      return;
    }

    // Insertar los planes faltantes
    let insertedCount = 0;
    for (const plan of planesToAdd) {
      try {
        const hasReemplazo = plan.reemplazo && 
                            plan.reemplazo.trim() !== "" && 
                            plan.reemplazo.trim().toUpperCase() !== "NO APLICA";
        
        const newPlan = {
          planSustitucionId: plan.id,
          colaborador: plan.colaborador,
          cargo: plan.cargo,
          departamento: plan.departamento,
          reemplazo: plan.reemplazo || "",
          riesgoContinuidad: hasReemplazo ? "Bajo" : "Alto",
          prioridadSucesion: hasReemplazo ? "Baja" : "Alta",
          riesgoCritico: hasReemplazo ? "No" : "Si",
          estado: "Pendiente",
          usuario: plan.usuario,
        };

        await db.insert(planesSuccesion).values(newPlan);
        insertedCount++;
        process.stdout.write(`\r✅ Insertados: ${insertedCount}/${planesToAdd.length}`);
      } catch (error) {
        console.error(`\n❌ Error insertando plan ${plan.id}:`, error.message);
      }
    }

    console.log(`\n\n🎉 Sincronización completada: ${insertedCount} planes vinculados`);
  } catch (error) {
    console.error("❌ Error durante la sincronización:", error);
    process.exit(1);
  }
}

syncMissingPlanes().then(() => process.exit(0));
