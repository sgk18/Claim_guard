import { FastifyInstance } from "fastify";
import { config } from "../config/index.js";
import { getPool } from "../db/pool.js";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async (req, reply) => {
    return reply.send({
      status: "HEALTHY",
      service: "claimguard-server",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  fastify.get("/ready", async (req, reply) => {
    let database = "CONNECTED"; // in-memory repositories are always available
    if (config.database.enabled) {
      try {
        await getPool().query("SELECT 1");
      } catch {
        database = "UNAVAILABLE";
      }
    }
    if (database !== "CONNECTED") {
      return reply.code(503).send({ ready: false, service: "claimguard-server", database });
    }
    return reply.send({
      ready: true,
      service: "claimguard-server",
      database,
      storage: "READY",
      ocr: "READY",
      fraudEngine: "READY",
    });
  });
}
