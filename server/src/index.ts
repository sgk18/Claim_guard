import { buildServer } from "./app.js";
import { config } from "./config/index.js";

async function start() {
  const server = buildServer();

  try {
    await server.listen({ port: config.port, host: config.host });
    console.log(`[ClaimGuard Server] Listening on http://${config.host}:${config.port}`);
    console.log(`[ClaimGuard Server] Health check: http://${config.host}:${config.port}/health`);
    console.log(`[ClaimGuard Server] API Root: http://${config.host}:${config.port}/api/v1/claims`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
