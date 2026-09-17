import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { config } from "./config/index.js";
import { InMemoryClaimRepository } from "./repositories/claimRepository.js";
import { MockStorageProvider } from "./providers/storage.js";
import { MockOCRProvider } from "./providers/ocr.js";
import { MockAIProvider } from "./providers/ai.js";
import { WebViewMessagingProvider } from "./providers/messaging.js";
import { RiskService } from "./services/riskService.js";
import { ClaimService } from "./services/claimService.js";
import { ClaimController } from "./controllers/claimController.js";
import { ReceiptController } from "./controllers/receiptController.js";
import { claimRoutes } from "./routes/claims.js";
import { receiptRoutes } from "./routes/receipts.js";
import { healthRoutes } from "./routes/health.js";

export function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  // Plugins
  fastify.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });

  // Providers & Repositories
  const claimRepo = new InMemoryClaimRepository();
  const storageProvider = new MockStorageProvider();
  const ocrProvider = new MockOCRProvider();
  const aiProvider = new MockAIProvider();
  const messagingProvider = new WebViewMessagingProvider();

  // Services
  const riskService = new RiskService(aiProvider);
  const claimService = new ClaimService(claimRepo, riskService, messagingProvider);

  // Controllers
  const claimController = new ClaimController(claimService);
  const receiptController = new ReceiptController(storageProvider, ocrProvider);

  // Register Health Routes
  fastify.register(healthRoutes);

  // Register API v1 Routes
  fastify.register(
    async (v1) => {
      v1.register(claimRoutes, { controller: claimController });
      v1.register(receiptRoutes, { controller: receiptController });
    },
    { prefix: "/api/v1" }
  );

  return fastify;
}
