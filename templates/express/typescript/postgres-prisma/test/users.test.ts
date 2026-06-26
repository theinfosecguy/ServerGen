import assert from 'node:assert';
import { after, test } from 'node:test';
import request from 'supertest';
import app from '../src/index.js';
import { disconnectPrisma, getPrisma } from '../src/lib/prisma.js';

const hasDatabase = Boolean(process.env.DATABASE_URL);
const dbTestOptions = {
  skip: hasDatabase ? false : 'DATABASE_URL is required for Prisma route tests.',
};

after(async () => {
  if (hasDatabase) {
    await disconnectPrisma();
  }
});

test('POST /users creates a user and GET /users returns it', dbTestOptions, async () => {
  const prisma = getPrisma();
  const email = `servergen-${Date.now()}@example.com`;
  await prisma.user.deleteMany({ where: { email } });

  const createRes = await request(app)
    .post('/users')
    .send({ email, name: 'ServerGen User' });

  assert.strictEqual(createRes.statusCode, 201);
  assert.strictEqual(createRes.body.user.email, email);
  assert.strictEqual(createRes.body.user.name, 'ServerGen User');

  const listRes = await request(app).get('/users');
  assert.strictEqual(listRes.statusCode, 200);
  assert.ok(listRes.body.users.some((user: { email: string }) => user.email === email));
});

test('GET /users/:id returns a user and DELETE /users/:id removes it', dbTestOptions, async () => {
  const prisma = getPrisma();
  const email = `servergen-delete-${Date.now()}@example.com`;
  await prisma.user.deleteMany({ where: { email } });
  const user = await prisma.user.create({
    data: { email, name: 'Delete Me' },
  });

  const getRes = await request(app).get(`/users/${user.id}`);
  assert.strictEqual(getRes.statusCode, 200);
  assert.strictEqual(getRes.body.user.email, email);

  const deleteRes = await request(app).delete(`/users/${user.id}`);
  assert.strictEqual(deleteRes.statusCode, 204);

  const missingRes = await request(app).get(`/users/${user.id}`);
  assert.strictEqual(missingRes.statusCode, 404);
});

test('POST /users validates email', dbTestOptions, async () => {
  const res = await request(app).post('/users').send({ email: 'not-an-email' });
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.error, 'A valid email is required.');
});
