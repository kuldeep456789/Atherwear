import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      modulePreload: false,
    },

    server: {
      host: true,
      port: 5173,
      strictPort: true,
      allowedHosts: [".ngrok-free.app"],

      proxy: {
        "/api": {
          target: env.DOCKER
            ? "http://backend:3000"
            : "http://127.0.0.1:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});