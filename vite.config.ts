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
      // More specific aliases MUST come first
      "react/jsx-runtime": r("./node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": r("./node_modules/react/jsx-dev-runtime"),
      "react-dom/client": r("./node_modules/react-dom/client"),
      react: r("./node_modules/react"),
      "react-dom": r("./node_modules/react-dom"),
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
    chunkSizeWarningLimit: 600,
    minify: "esbuild",
    target: "es2020",
  },
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
