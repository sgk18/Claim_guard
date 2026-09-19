import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { config } from "./config/index.js";
import { InMemoryClaimRepository } from "./repositories/claimRepository.js";
import { InMemoryOrganizationRepository } from "./repositories/organizationRepository.js";
import { PgClaimRepository } from "./repositories/pgClaimRepository.js";
import { PgOrganizationRepository } from "./repositories/pgOrganizationRepository.js";
import { getPool } from "./db/pool.js";
import { MockStorageProvider } from "./providers/storage.js";
import { MockOCRProvider } from "./providers/ocr.js";
import { WebViewMessagingProvider } from "./providers/messaging.js";
import { ClaimService } from "./services/claimService.js";
import { OrganizationService } from "./services/organizationService.js";
import { ClaimController } from "./controllers/claimController.js";
import { OrganizationController } from "./controllers/organizationController.js";
import { ReceiptController } from "./controllers/receiptController.js";
import { claimRoutes } from "./routes/claims.js";
import { organizationRoutes } from "./routes/organizations.js";
import { receiptRoutes } from "./routes/receipts.js";
import { healthRoutes } from "./routes/health.js";

export function buildServer() {
  const fastify = Fastify({
    logger: false, // Clean test output
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
  // Aurora PostgreSQL when DB_HOST is set, otherwise in-memory demo data.
  const usePostgres = config.database.enabled;
  const claimRepo = usePostgres ? new PgClaimRepository(getPool()) : new InMemoryClaimRepository();
  const orgRepo = usePostgres ? new PgOrganizationRepository(getPool()) : new InMemoryOrganizationRepository();
  const storageProvider = new MockStorageProvider();
  const ocrProvider = new MockOCRProvider();
  const messagingProvider = new WebViewMessagingProvider();

  // Services
  const claimService = new ClaimService(claimRepo, messagingProvider);
  const orgService = new OrganizationService(orgRepo);

  // Controllers
  const claimController = new ClaimController(claimService);
  const orgController = new OrganizationController(orgService);
  const receiptController = new ReceiptController(storageProvider, ocrProvider);

  // Authentication PreHandler Hook (Bearer Session Token)
  fastify.decorateRequest("session", null);
  fastify.addHook("preHandler", async (req: any, reply) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const session = await orgService.validateSession(token);
      if (session) {
        req.session = session;
      }
    }
  });

  // Root Health Routes
  fastify.register(healthRoutes);

  // API v1 Routes
  fastify.register(
    async (v1) => {
      v1.register(healthRoutes);
      v1.register(organizationRoutes, { controller: orgController });
      v1.register(claimRoutes, { controller: claimController });
      v1.register(receiptRoutes, { controller: receiptController });
    },
    { prefix: "/api/v1" }
  );

  return fastify;
}
