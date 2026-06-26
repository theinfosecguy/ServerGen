import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

let prisma: PrismaClient | undefined;

export const getPrisma = function () {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for Prisma database access.');
  }

  if (!prisma) {
    const adapter = new PrismaPg({ connectionString });
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
};

export const disconnectPrisma = async function () {
  if (prisma) {
    await prisma.$disconnect();
    prisma = undefined;
  }
};
