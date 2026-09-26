import { defineConfig } from "vite";

// GitHub Pages proje sayfası alt yolda yayınlanır; Vercel/yerel kökte.
export default defineConfig({
  base: process.env.PAGES_BASE || "/",
  build: { chunkSizeWarningLimit: 700 },
});
