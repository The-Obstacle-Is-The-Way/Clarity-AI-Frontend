/// <reference types="vitest" />
/*
 * Monkey-patch tinypool at config load time to prevent stack overflow on worker termination.
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// Project root definition for consistent path resolution
const projectRoot = path.resolve(__dirname, '..'); // Define project root dynamically

export default defineConfig({
  plugins: [

    react(), // React plugin for JSX support
    tsconfigPaths(), // Use paths from tsconfig.json
  ],
  test: {
    // Explicitly define aliases for the test environment
    alias: {
      // Use new URL for robust path resolution relative to config file
      '@': new URL('../src', import.meta.url).pathname,
      '@domain': new URL('../src/domain', import.meta.url).pathname,
      '@application': new URL('../src/application', import.meta.url).pathname,
      '@infrastructure': new URL('../src/infrastructure', import.meta.url).pathname,
      '@presentation': new URL('../src/presentation', import.meta.url).pathname,
      '@shared': new URL('../src/shared', import.meta.url).pathname,
      '@atoms': new URL('../src/presentation/atoms', import.meta.url).pathname,
      '@molecules': new URL('../src/presentation/molecules', import.meta.url).pathname,
      '@organisms': new URL('../src/presentation/organisms', import.meta.url).pathname,
      '@templates': new URL('../src/presentation/templates', import.meta.url).pathname,
      '@pages': new URL('../src/presentation/pages', import.meta.url).pathname,
      '@hooks': new URL('../src/application/hooks', import.meta.url).pathname,
      '@contexts': new URL('../src/application/contexts', import.meta.url).pathname,
      '@providers': new URL('../src/application/providers', import.meta.url).pathname,
      '@stores': new URL('../src/application/stores', import.meta.url).pathname,
      '@services': new URL('../src/application/services', import.meta.url).pathname,
      '@api': new URL('../src/infrastructure/api', import.meta.url).pathname,
      '@clients': new URL('../src/infrastructure/clients', import.meta.url).pathname,
      '@utils': new URL('../src/shared/utils', import.meta.url).pathname,
      '@constants': new URL('../src/shared/constants', import.meta.url).pathname,
      '@config': new URL('./', import.meta.url).pathname, // Point to current config dir
      '@test': new URL('../test', import.meta.url).pathname,
      '@public': new URL('../public', import.meta.url).pathname,
    },
    // Restore default threading behavior (remove threads: false, fileParallelism: false)
    // Core settings
    globals: true, // Enable global test APIs
    environment: 'jsdom', // Use JSDOM for browser environment
    
    // Mock behavior configuration
    mockReset: true, // Reset mocks between tests
    restoreMocks: true, // Restore original implementations after tests
    clearMocks: true, // Clear mock call history between tests
    
    // Timeout configuration
    testTimeout: 20000, // Increase default timeout per test
    hookTimeout: 20000, // Increase default timeout for hooks
    
    // Setup files in correct order - jest-dom setup must come before our main setup
    setupFiles: [
      './src/test/jest-dom-setup.ts', // Jest-dom matchers only
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**/*',
        'src/main.tsx',
        'src/**/index.ts',
        'src/**/types.ts',
        'src/vite-env.d.ts',
      ],
      all: true, // Report coverage on all files, not just tested ones
    },
    
    // File patterns
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'test/**/*.test.{ts,tsx}',
    ],
    
    exclude: [
      'node_modules/**/*',
      'dist/**/*',
      'coverage/**/*',
      'config/**/*',
      'test-puppeteer/**/*', // Puppeteer tests need separate runner
    ],
  },
});