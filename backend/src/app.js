import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import documentsRouter from "./routes/documents.js";
import healthRouter from "./routes/health.js";
import ingestRouter from "./routes/ingest.js";
import ragRouter from "./routes/rag.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST", "OPTIONS"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", healthRouter);
  app.use("/api/documents", documentsRouter);
  app.use("/api/ingest", ingestRouter);
  app.use("/api/rag", ragRouter);

  app.use(errorHandler);
  return app;
}
