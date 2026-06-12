import { defineConfig } from 'vitest/config';

/** Node-environment Vitest config for the standalone updater scripts (scripts/**). */
export default defineConfig({
  test: {
    include: ['scripts/**/*.spec.ts'],
    environment: 'node',
  },
});
