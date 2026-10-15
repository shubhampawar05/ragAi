import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closePool } from "./db/pool.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`RAG Lab API listening on http://localhost:${env.PORT}`);
});

async function shutdown() {
  server.close();
  await closePool();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
