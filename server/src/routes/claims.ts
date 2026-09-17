import { FastifyInstance } from "fastify";
import { ClaimController } from "../controllers/claimController.js";

export async function claimRoutes(fastify: FastifyInstance, options: { controller: ClaimController }) {
  const { controller } = options;

  fastify.get("/claims", (req, reply) => controller.getAll(req, reply));
  fastify.get("/claims/:id", (req: any, reply) => controller.getById(req, reply));
  fastify.post("/claims", (req, reply) => controller.submit(req, reply));
  fastify.post("/claims/:id/approve", (req: any, reply) => controller.approve(req, reply));
  fastify.post("/claims/:id/reject", (req: any, reply) => controller.reject(req, reply));
  fastify.post("/claims/:id/clarification", (req: any, reply) => controller.requestClarification(req, reply));
  fastify.get("/claims/:id/audit", (req: any, reply) => controller.getAuditLogs(req, reply));
  fastify.get("/employees/me/claims", (req, reply) => controller.getAll(req, reply));
}
