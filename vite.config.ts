import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    proxy: {
      "/api/ships": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
      "/api/components": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
