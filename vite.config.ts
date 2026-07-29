import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Build config for the standalone POS prototype app.
 *
 * This is a real application, not a Storybook story — it has routing, a shared
 * cart, and completes sales. It reuses the replica components and theme from
 * `src/`, so the app and the design-system documentation cannot drift apart.
 *
 * Output goes to `dist/prototype`, replacing the read-only screen viewer that
 * used to live there.
 */
export default defineConfig({
    root: "app",
    base: process.env.NODE_ENV === "production" ? "/tf-birdie-ds-v1/prototype/" : "/",
    plugins: [react()],
    resolve: {
        alias: { "@": resolve(import.meta.dirname, "src") },
    },
    build: {
        outDir: "../dist/prototype",
        emptyOutDir: true,
    },
    // Logos and product photography are copied in by scripts/build-site.mjs
    // after this build, so there is no public dir to serve here.
    publicDir: false,
});
