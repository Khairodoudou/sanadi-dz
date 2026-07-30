import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Use Turso (LibSQL) in production, SQLite locally
  if (url && url.startsWith("libsql://")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const adapterLibsql = require("@prisma/adapter-libsql");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    const libsql = createClient({ url, authToken });
    const AdapterClass = adapterLibsql.PrismaLibSQL || adapterLibsql.PrismaLibSql;
    const adapter = new AdapterClass(libsql);
    return new PrismaClient({ adapter });
  }

  // Local SQLite fallback
  return new PrismaClient({ log: ["query"] });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
