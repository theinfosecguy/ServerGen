import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      // bin/servergen.js is the CLI entry point: it is exercised end to end by
      // the integration tests (which run it as a subprocess), so in-process
      // istanbul cannot see that coverage. Measure the importable library code.
      include: ['lib/**/*.js', 'index.js'],
      exclude: ['tests/**', 'node_modules/**'],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
