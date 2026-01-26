import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { countOrphanedRecords, cleanOrphanedRecords } from "./integrity-check";

export const integrityRouter = router({
  checkIntegrity: adminProcedure.query(async () => {
    const orphanedCount = await countOrphanedRecords();
    return {
      isHealthy: orphanedCount === 0,
      orphanedRecords: orphanedCount,
      message: orphanedCount === 0 
        ? "Database integrity verified"
        : `Found ${orphanedCount} orphaned records in planesSuccesion`
    };
  }),

  cleanOrphaned: adminProcedure.mutation(async () => {
    const cleaned = await cleanOrphanedRecords();
    return {
      success: true,
      recordsCleaned: cleaned,
      message: `Cleaned ${cleaned} orphaned records`
    };
  }),
});
