import app from "../src/server";
import { initializeDatabaseWithSeed } from "../src/config/database";

// Initialize database, schema, and seed data for serverless
// This runs on cold start to ensure database is ready
let initializationPromise: Promise<void> | null = null;
let initialized = false;

const initializeDatabase = async (): Promise<void> => {
  // Prevent multiple initialization attempts
  if (initialized) {
    return;
  }

  // If initialization is already in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      console.log("🔄 Initializing database for serverless environment...");
      await initializeDatabaseWithSeed();
      initialized = true;
      console.log("✅ Serverless database initialization complete");
    } catch (error: any) {
      console.error(
        "❌ Failed to initialize database for serverless:",
        error.message
      );
      if (error.stack) {
        console.error(error.stack);
      }
      // Reset promise so we can retry on next request
      initializationPromise = null;
      // Don't throw - let the app continue, middleware will handle retries
    }
  })();

  return initializationPromise;
};

// Initialize on module load (cold start)
initializeDatabase().catch(() => {
  // Error already logged above
});

export default app;
