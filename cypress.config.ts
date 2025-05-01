import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Remove baseUrl to avoid trying to connect to a server
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});