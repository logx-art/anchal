import { PrismaClient } from "@prisma/client";

// Prevents exhausting the Postgres connection limit from hot-reloading
// Prisma Clients in development, where each file save would otherwise
// instantiate a brand new client.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
