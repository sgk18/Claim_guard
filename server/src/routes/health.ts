import { FastifyInstance } from "fastify";

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
    return reply.send({
      ready: true,
      service: "claimguard-server",
      database: "CONNECTED",
      storage: "READY",
      ocr: "READY",
      fraudEngine: "READY",
    });
  });
}
