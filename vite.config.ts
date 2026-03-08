import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const r = (p: string) => path.resolve(__dirname, p);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": r("./src"),
      react: r("./node_modules/react/index.js"),
      "react/jsx-runtime": r("./node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": r("./node_modules/react/jsx-dev-runtime.js"),
      "react-dom": r("./node_modules/react-dom/index.js"),
      "react-dom/client": r("./node_modules/react-dom/client.js"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "scheduler",
    ],
  },
  build: {
    // Optimize chunk splitting for faster initial load
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["framer-motion", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-charts": ["recharts"],
        },
      },
    },
    // Increase chunk warning limit
    chunkSizeWarningLimit: 600,
    // Enable minification
    minify: "esbuild",
    // Target modern browsers for smaller output
    target: "es2020",
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    force: mode === "development",
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "next-themes",
      "@supabase/supabase-js",
    ],
  },
}));
