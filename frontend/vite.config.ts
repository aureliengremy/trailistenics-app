import path from "node:path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Miroir local de la rewrite Vercel : l'auth passe par notre origine (cookie
      // first-party), le proxy relaie vers le endpoint Neon Auth.
      "/neonauth": {
        target: "https://ep-damp-pond-aq32vtdp.neonauth.c-8.us-east-1.aws.neon.tech",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/neonauth/, "/neondb/auth"),
      },
    },
  },
})
