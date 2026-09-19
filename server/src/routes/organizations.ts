import { FastifyInstance } from "fastify";
import { OrganizationController } from "../controllers/organizationController.js";

export async function organizationRoutes(
  fastify: FastifyInstance,
  options: { controller: OrganizationController }
) {
  const { controller } = options;

  fastify.post("/organizations", controller.registerOrganization);
  fastify.post("/organizations/join", controller.joinOrganization);
  fastify.post("/organizations/join-code/regenerate", controller.regenerateJoinCode);
  fastify.post("/organizations/join-code/revoke", controller.revokeJoinCode);
  fastify.get("/organizations/:id", controller.getOrganization);
  fastify.get("/organizations/:id/employees", controller.getEmployees);
  fastify.delete("/organizations/:id/employees/:employeeId", controller.removeEmployee);
  fastify.post("/organizations/:id/employees/:employeeId/suspend", controller.suspendEmployee);
}
