import assert from 'node:assert';
import test from 'node:test';
import request from 'supertest';
import app from '../src/index';

test('GET /health returns 200 with an ok status', async () => {
  const res = await request(app).get('/health');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.status, 'ok');
});

test('GET / returns 200', async () => {
  const res = await request(app).get('/');
  assert.strictEqual(res.statusCode, 200);
});
