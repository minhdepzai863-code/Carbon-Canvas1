import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/@google/genai")) return "gemini";
          if (
            id.includes("node_modules/d3") ||
            id.includes("node_modules/recharts")
          )
            return "visualization";
          if (id.includes("node_modules/react")) return "react";
          if (id.includes("node_modules/lucide-react")) return "icons";
        },
      },
    },
  },
});
