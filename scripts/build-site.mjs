import { cp, mkdir, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Assembles the GitHub Pages site.
 *
 * Layout of the deployed site:
 *
 *   /                     landing page — links to Storybook and prototypes
 *   /logos/*              Tenfore marks, shared by the landing page and stories
 *   /storybook/           the built Storybook
 *   /prototypes/<name>/   any static prototype dropped into ./prototypes
 *
 * Storybook is built first (`build-storybook` writes straight into dist/storybook),
 * so this script only adds the shell around it.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

await mkdir(dist, { recursive: true });

// Landing page + anything else that belongs at the site root.
await cp(join(root, "site"), dist, { recursive: true });

// Logos are referenced by the landing page at ./logos/*, and by Storybook
// stories at /tf-birdie-ds-v1/storybook/logos/* via staticDirs.
await cp(join(root, "logos"), join(dist, "logos"), { recursive: true });

// The prototype app resolves assets against its own base
// (/tf-birdie-ds-v1/prototype/), so it needs its own copies rather than
// reaching up into the site root — `assetUrl()` and `storeImage()` are
// deliberately base-relative so the same code works in Storybook and the app.
const appDir = join(dist, "prototype");

try {
    await cp(join(root, "logos"), join(appDir, "logos"), { recursive: true });
    await cp(join(root, "store/images"), join(appDir, "store-images"), { recursive: true });
} catch (error) {
    // The app build may not have run (e.g. `npm run build-site` on its own).
    if (error.code !== "ENOENT") throw error;
    console.warn("prototype/ not found — skipped its asset copy. Run `npm run build-app` first.");
}

// Optional: each directory under ./prototypes is published as-is. This is the
// drop-zone for one-off clickable prototypes that shouldn't live in Storybook.
const prototypesDir = join(root, "prototypes");
let prototypes = [];

try {
    prototypes = (await readdir(prototypesDir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
} catch {
    // No prototypes directory yet — that's the normal case.
}

for (const name of prototypes) {
    await cp(join(prototypesDir, name), join(dist, "prototypes", name), { recursive: true });
}

console.log(`Site assembled in dist/ — landing page, logos, storybook${prototypes.length ? `, prototypes: ${prototypes.join(", ")}` : ""}`);
