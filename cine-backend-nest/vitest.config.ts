import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Umbrales de regresion: baseline actual ~49% (stmts/lines), ~36% (branches), ~41% (funcs).
      // Se fijan ligeramente por debajo; subirlos a medida que crezca la cobertura.
      thresholds: {
        statements: 45,
        lines: 45,
        functions: 38,
        branches: 32,
      },
    },
  },
});
