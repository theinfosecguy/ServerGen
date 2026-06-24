import assert from 'node:assert';
import test from 'node:test';
import app from '../src/index';

test('GET /health returns 200 with an ok status', async () => {
  const res = await app.request('/health');
  const body = await res.json();

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(body, { status: 'ok' });
});

test('GET / returns 200 with the welcome message', async () => {
  const res = await app.request('/');
  const body = await res.json();

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(body, { message: 'Welcome to ServerGen!' });
});

test('GET /missing returns a JSON 404', async () => {
  const res = await app.request('/missing');
  const body = await res.json();

  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(body, { error: 'Not Found' });
});
