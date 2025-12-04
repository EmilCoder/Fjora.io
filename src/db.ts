import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL mangler i .env");
}

// PrismaMariaDb lager selv en connection pool basert på URL/konfig
const adapter = new PrismaMariaDb(databaseUrl);

// PrismaClient støtter adapter i runtime; type-cast for å unngå TS-klaging.
export const prisma = new PrismaClient({ adapter } as any);

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
