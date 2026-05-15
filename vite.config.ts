import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const repoBase = process.env.VITE_BASE ?? '/app-costura-nana/';

export default defineConfig({
  base: repoBase,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
});
