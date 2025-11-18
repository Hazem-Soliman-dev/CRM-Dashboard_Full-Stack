import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/server";
import { initializeDatabaseWithSeed } from "../src/config/database";

let initializationPromise: Promise<void> | null = null;

export const ensureServerInitialized = async (): Promise<void> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    console.log("🔄 Bootstrapping Express app for serverless handler…");
    await initializeDatabaseWithSeed();
    console.log("✅ Express app ready for serverless handler");
  })().catch((error) => {
    initializationPromise = null;
    console.error("❌ Failed to initialize serverless app:", error);
    throw error;
  });

  return initializationPromise;
};

export const vercelAppHandler = async (
  req: VercelRequest,
  res: VercelResponse
): Promise<void> => {
  await ensureServerInitialized();
  return app(req, res);
};

// Pre-warm during cold starts but ignore failures (middleware will retry)
ensureServerInitialized().catch(() => undefined);

export default vercelAppHandler;

