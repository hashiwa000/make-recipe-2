import { defineConfig } from 'vitest/config';

// Vitest config for menu-core (library)
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    globals: true,
    reporters: 'default',
  },
});

