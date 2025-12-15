import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    // setupFiles: ['./vitest.setup.ts'], // Temporarily disabled
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules/**',
      'e2e/**',
      'coverage/**',
      'dist/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})