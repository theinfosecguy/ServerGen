import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: ['lib/**/*.js', 'bin/**/*.js', 'index.js'],
      exclude: ['tests/**', 'node_modules/**'],
      // Thresholds reflect the true baseline now that all source files are
      // measured (previously only 2 files were counted, inflating coverage).
      // Raise these as coverage of the core generator modules improves.
      thresholds: {
        statements: 12,
        branches: 15,
        functions: 10,
        lines: 12,
      },
    },
  },
});
