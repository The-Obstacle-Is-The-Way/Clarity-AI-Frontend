import { defineConfig } from 'cypress';
import { addMatchImageSnapshotPlugin } from '@simonsmith/cypress-image-snapshot/plugin';

export default defineConfig({
  e2e: {
    // Remove baseUrl to avoid trying to connect to a server
    // baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // Make sure to return the config object as it might have been modified by the plugin.
      addMatchImageSnapshotPlugin(on); // Try passing only 'on'
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
