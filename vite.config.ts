import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import path from 'path'; // Remove this line, no longer needed
import tsconfigPaths from 'vite-tsconfig-paths'; // Add this import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
}); 