import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      include: ['lib/**/*.js', 'bin/**/*.js', 'index.js'],
      exclude: ['tests/**', 'node_modules/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 85,
        lines: 80,
      },
    },
  },
});
