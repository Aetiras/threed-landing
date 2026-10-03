import { defineConfig } from "vite";
import { prepareContent, siteMetadataPlugin } from "./scripts/site-content.mjs";

const base = process.env.PAGES_BASE || "/";
const contentInputs = prepareContent(base);
const siteUrl = process.env.SITE_URL || "https://aetiras.github.io/threed-landing/";

// GitHub Pages proje sayfası alt yolda yayınlanır; Vercel/yerel kökte.
export default defineConfig({
  base,
  plugins: [siteMetadataPlugin(siteUrl)],
  build: {
    chunkSizeWarningLimit: 700,
    // Tanıtım/hesap ile içerik kaynağından üretilen, doğrudan taranabilir sayfalar.
    rollupOptions: { input: { main: "index.html", hesap: "hesap.html", ...contentInputs } },
  },
});
