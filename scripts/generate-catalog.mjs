import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Generates `src/data/store-catalog.ts` from `store/manifest.csv`.
 *
 * The store folder holds real product photography (apparel, golf balls,
 * accessories, shoes) scraped with metadata. Rather than hand-maintain a
 * parallel list of filenames, this derives a typed catalog from the manifest so
 * the two can never drift.
 *
 * Run with `npm run generate:catalog` after adding images to the store folder.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Minimal RFC 4180 parser — the manifest has quoted fields containing commas. */
function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
            continue;
        }

        if (char === '"') inQuotes = true;
        else if (char === ",") {
            row.push(field);
            field = "";
        } else if (char === "\n") {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else if (char !== "\r") field += char;
    }

    if (field || row.length) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}

const csv = await readFile(resolve(root, "store/manifest.csv"), "utf8");
const rows = parseCsv(csv);
const header = rows[0];
const col = Object.fromEntries(header.map((name, i) => [name, i]));

const records = rows
    .slice(1)
    .filter((row) => row.length > 3 && row[col.local_path])
    .map((row) => ({
        category: row[col.category],
        subcategory: row[col.subcategory],
        title: row[col.title].replace(/^"+|"+$/g, "").trim(),
        // local_path is "images/<cat>/<sub>/<file>"; served at /store-images/<cat>/<sub>/<file>
        path: row[col.local_path].replace(/^images\//, ""),
    }));

const bySub = {};
for (const record of records) (bySub[record.subcategory] ??= []).push(record);

const lines = [
    "// GENERATED FILE — do not edit by hand.",
    "// Run `npm run generate:catalog` to regenerate from store/manifest.csv.",
    "//",
    "// Real product photography for the Pro Shop and Quick Order tiles. Images are",
    "// served at /store-images/* via Storybook staticDirs; resolve them with",
    "// `storeImage(product.path)`.",
    "",
    "export interface StoreProduct {",
    "    /** Display name from the source catalog. */",
    "    title: string;",
    '    /** Path under /store-images, e.g. "equipment/golf-balls/foo.webp". */',
    "    path: string;",
    "    category: string;",
    "    subcategory: string;",
    "}",
    "",
];

for (const [sub, items] of Object.entries(bySub)) {
    const name = sub.replace(/[^a-z0-9]+(.)/gi, (_, c) => c.toUpperCase());
    lines.push(`export const ${name}: StoreProduct[] = ${JSON.stringify(items, null, 4)};`, "");
}

lines.push(
    `export const allProducts: StoreProduct[] = [${Object.keys(bySub)
        .map((sub) => sub.replace(/[^a-z0-9]+(.)/gi, (_, c) => c.toUpperCase()))
        .join(", ")}].flat();`,
    "",
);

await writeFile(resolve(root, "src/data/store-catalog.ts"), lines.join("\n"));

console.log(`Generated src/data/store-catalog.ts — ${records.length} products across ${Object.keys(bySub).length} subcategories:`);
for (const [sub, items] of Object.entries(bySub)) console.log(`  ${sub}: ${items.length}`);
