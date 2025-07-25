// vite.config.js (Save this in personapost-frontend/vite.config.js)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Import 'path' module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // Ensure React plugin is applied
  ],
  resolve: {
    alias: {
      // Define the alias for '@/' to point to the 'src' directory
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  optimizeDeps: {
    // This explicitly tells esbuild (used by Vite) to treat .js files as JSX
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  // If you also face issues with 'process' not defined,
  // it might be an ESLint warning. For runtime, Node.js globals are typically fine in config files.
  // To suppress ESLint warnings for Node.js globals in vite.config.js,
  // you might need to configure your .eslintrc.js file, adding 'node:true' to 'env'.
});
