import { defineConfig } from 'vitest/config';

// Dedicated config for the heavy, release-gated package smoke test. It is kept
// out of the default `npm test` run (see vitest.config.js, which only includes
// tests/unit and tests/integration). The smoke test packs, installs, builds and
// boots real servers, so it needs much longer timeouts than the unit suite.
export default defineConfig({
  test: {
    include: ['tests/smoke/**/*.test.js'],
    testTimeout: 180000,
    hookTimeout: 180000,
  },
});
