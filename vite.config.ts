import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // UI library chunks
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
          ],
          
          // Data fetching
          'vendor-query': ['@tanstack/react-query'],
          
          // Animation library
          'vendor-animation': ['framer-motion'],
          
          // Chart library (heavy, lazy loaded)
          'vendor-charts': ['recharts'],
          
          // Map library (heavy, lazy loaded)
          'vendor-maps': ['maplibre-gl'],
          
          // PDF/Document generation (heavy, on-demand)
          'vendor-docs': ['jspdf', 'jspdf-autotable', 'docx'],
          
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Increase chunk size warning limit for vendor chunks
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: mode === 'development',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
    ],
    // maplibre-gl ships its own web worker; pre-bundling it breaks the worker URL in dev
    exclude: ['maplibre-gl'],
  },

}));
