import { PrismaClient } from "@prisma/client";
import logger from "./utils/logger";

let prisma: PrismaClient;

try {
  prisma = new PrismaClient();
  logger.info("Prisma Client initialized successfully.");
} catch (error) {
  logger.error("Error initializing Prisma Client:", error);
  throw error;
}

export default prisma;
