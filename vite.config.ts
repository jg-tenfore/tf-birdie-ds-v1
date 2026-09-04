import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

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

const repoRoot = import.meta.dirname;

const MIME: Record<string, string> = {
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
};

/**
 * Serves the repo's shared assets during `vite dev`.
 *
 * In a production build these are copied into `dist/prototype` by
 * `scripts/build-site.mjs`, but the dev server has no public dir — the assets
 * live outside `app/` and duplicating ~24 MB of product photography into one
 * would be worse than a few lines of middleware.
 */
function serveRepoAssets(): Plugin {
    const mounts: [string, string][] = [
        ["/logos/", resolve(repoRoot, "logos")],
        ["/store-images/", resolve(repoRoot, "store/images")],
    ];

    return {
        name: "serve-repo-assets",
        apply: "serve",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = (req.url ?? "").split("?")[0];
                const mount = mounts.find(([prefix]) => url.startsWith(prefix));
                if (!mount) return next();

                const [prefix, dir] = mount;
                // Normalise before joining so a traversal can't escape the mount.
                const relative = normalize(decodeURIComponent(url.slice(prefix.length))).replace(/^(\.\.[/\\])+/, "");
                const file = join(dir, relative);

                if (!file.startsWith(dir) || !existsSync(file) || !statSync(file).isFile()) return next();

                res.setHeader("Content-Type", MIME[extname(file).toLowerCase()] ?? "application/octet-stream");
                createReadStream(file).pipe(res);
            });
        },
    };
}

export default defineConfig({
    root: "app",
    base: process.env.NODE_ENV === "production" ? "/tf-birdie-ds-v1/prototype/" : "/",
    plugins: [react(), serveRepoAssets()],
    resolve: {
        alias: { "@": resolve(repoRoot, "src") },
    },
    server: {
        port: 5180,
        // The app imports from src/ and reads assets from logos/ and store/,
        // all of which sit above the Vite root.
        fs: { allow: [repoRoot] },
    },
    build: {
        outDir: "../dist/prototype",
        emptyOutDir: true,
        rollupOptions: {
            /**
             * Two entries, one build.
             *
             * `index.html` is the counter terminal — landscape, 1280 and up.
             * `mobile.html` is the phone, 402x797, and it is a **separate
             * application shell over the same store**: same reducer, same
             * cart, same tee sheet, same sales. Only the screens differ.
             *
             * One build rather than two because they share ~90% of their
             * imports; splitting them would duplicate the store and the
             * replica components into two bundles and let them drift.
             */
            input: {
                index: resolve(repoRoot, "app/index.html"),
                mobile: resolve(repoRoot, "app/mobile.html"),
            },
        },
    },
    // Logos and product photography are copied in by scripts/build-site.mjs
    // after this build, so there is no public dir to serve here.
    publicDir: false,
});
