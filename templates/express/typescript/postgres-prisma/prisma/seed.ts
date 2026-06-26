import 'dotenv/config';
import { disconnectPrisma, getPrisma } from '../src/lib/prisma.js';

const prisma = getPrisma();

try {
  await prisma.user.upsert({
    where: { email: 'ada@example.com' },
    update: {},
    create: {
      email: 'ada@example.com',
      name: 'Ada Lovelace',
    },
  });
  console.log('Seeded demo user: ada@example.com');
} finally {
  await disconnectPrisma();
}
