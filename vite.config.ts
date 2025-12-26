import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import vitePrerender from "vite-plugin-prerender";

// Routes to pre-render for SEO and AI crawlers
const routesToPrerender = [
  "/",
  "/infrastructure",
  "/medals",
  "/capacity",
  "/schema",
  "/auth",
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Pre-render static HTML for specified routes during production build
    mode === "production" &&
      vitePrerender({
        staticDir: path.resolve(__dirname, "dist"),
        routes: routesToPrerender,
        renderer: {
          // Wait for the app to fully render
          renderAfterTime: 3000,
          // Inject a flag so the app knows it's being pre-rendered
          injectProperty: "__PRERENDER_INJECTED",
          // Wait for specific element to appear
          renderAfterElementExists: "#root",
        },
        // Minify the pre-rendered HTML
        minify: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          keepClosingSlash: true,
          sortAttributes: true,
        },
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
