/**
 * Serves `dist/` at the path the deployed site actually uses, so the smoke test
 * exercises the real base path rather than a root-mounted approximation.
 *
 * GitHub Pages publishes this repo under `/tf-birdie-ds-v1/`, and the built app
 * has that prefix baked into its asset URLs. Serving `dist/` at `/` looks like
 * it works — the HTML loads — and then every asset 404s, which is a confusing
 * way to discover a path bug.
 *
 * Without this, `npm run smoke` fails cold with ERR_CONNECTION_REFUSED: the
 * test has always hardcoded port 8098 and nothing ever started a server there.
 *
 *   node scripts/serve-dist.mjs           # serve until interrupted
 *   node scripts/serve-dist.mjs --smoke   # serve, run the smoke test, exit
 */
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const PORT = Number(process.env.SMOKE_PORT ?? 8098);
const PREFIX = "/tf-birdie-ds-v1";
const ROOT = resolve("dist");

if (!existsSync(ROOT)) {
    console.error("dist/ is missing — run `npm run build` first.");
    process.exit(1);
}

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".map": "application/json; charset=utf-8",
};

const server = createServer((req, res) => {
    let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (path === PREFIX) path = `${PREFIX}/`;
    if (!path.startsWith(`${PREFIX}/`)) {
        res.writeHead(404).end("outside the site prefix");
        return;
    }

    // normalize() before joining, so "..%2f" cannot climb out of dist/
    let file = join(ROOT, normalize(path.slice(PREFIX.length)));
    if (!file.startsWith(ROOT)) {
        res.writeHead(403).end("forbidden");
        return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) {
        res.writeHead(404).end("not found");
        return;
    }

    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
    const base = `http://localhost:${PORT}${PREFIX}/`;
    console.log(`serving dist/ at ${base}`);

    if (!process.argv.includes("--smoke")) return;

    const smoke = spawn("node", ["scripts/smoke-test.mjs"], {
        stdio: "inherit",
        env: { ...process.env, SMOKE_URL: `${base}prototype/` },
    });
    smoke.on("exit", (code) => {
        server.close();
        process.exit(code ?? 1);
    });
});
