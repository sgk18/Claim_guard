import { FastifyInstance } from "fastify";
import { ReceiptController } from "../controllers/receiptController.js";

export async function receiptRoutes(fastify: FastifyInstance, options: { controller: ReceiptController }) {
  const { controller } = options;
  fastify.post("/receipts/upload", (req, reply) => controller.upload(req, reply));
}
