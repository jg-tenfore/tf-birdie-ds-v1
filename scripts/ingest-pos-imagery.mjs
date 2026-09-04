import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Ingests `references/090426/pos-item-imagery/` into the store.
 *
 * The store already has a pipeline — `store/images/**` holds the photography,
 * `store/manifest.csv` is the source of truth, and `npm run generate:catalog`
 * derives `src/data/store-catalog.ts` from it so the two cannot drift. This
 * script feeds that pipeline rather than going around it: convert, hash, file,
 * append a manifest row. Nothing here writes to `store-catalog.ts`.
 *
 * Two sources, one output:
 *
 *   1. **The ball imagery.** 27 folders under `PGA TOUR Superstore Ball
 *      Imagery/`, each with a numbered product gallery and a `source.txt`. Only
 *      the **first** image of each is taken — the rest are alternate angles and
 *      lifestyle shots, and a POS tile shows one packshot.
 *   2. **The loose packshots.** 56 screenshots at the top level, each a single
 *      accessory on a clean background.
 *
 * Neither source carries a title, a price or a description, so those come from
 * catalogue JSON produced alongside this script and passed in with `--catalog`.
 * That separation is deliberate: identifying what is in a photograph is a
 * judgement, and it should be reviewable as data rather than buried in a
 * transform.
 *
 * Images are converted to **500px webp** to match what is already in the store —
 * the existing files are 500×500 at 12–20KB, and a 1200px PNG on a POS tile is
 * 40× the bytes for no visible gain on a 44dp thumbnail.
 *
 * Filenames are `<slug>-<sha10>.webp`. The hash is of the **converted** bytes,
 * so re-running is idempotent: the same source produces the same name and the
 * same manifest row, and nothing duplicates.
 *
 * Usage:
 *   node scripts/ingest-pos-imagery.mjs --catalog <a.json> [--catalog <b.json>] [--dry-run]
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "references/090426/pos-item-imagery");
const BALL_DIR = join(SOURCE, "PGA TOUR Superstore Ball Imagery");
const IMAGES = join(root, "store/images");
const MANIFEST = join(root, "store/manifest.csv");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const catalogs = args.flatMap((a, i) => (a === "--catalog" ? [args[i + 1]] : []));
if (catalogs.length === 0) {
    console.error("usage: node scripts/ingest-pos-imagery.mjs --catalog <file.json> [--catalog <file.json>] [--dry-run]");
    process.exit(1);
}

/**
 * Where each subcategory files.
 *
 * `golf-balls` and `accessories-and-training` already exist in the store and
 * keep their names so the current exports do not change shape. The rest are new
 * and are granular on purpose — the Pro Shop's category grid is built from
 * these, and "Gloves" and "Tees" are separate buttons on the real screen.
 */
const CATEGORY_OF = {
    balls: "equipment",
    accessories: "equipment",
    training: "equipment",
    tees: "equipment",
    gloves: "equipment",
    bags: "equipment",
    headwear: "apparel",
    apparel: "apparel",
    "golf-shoes": "shoes",
    // Added after cataloguing: 21 of the 56 loose packshots turned out to be
    // snack-bar and beverage-cart stock, not pro-shop merchandise. That is the
    // more valuable half — the restaurant screens have been drawing tinted SVG
    // placeholders because "food photography is not in this repo", and now it
    // is.
    "snack-bar": "food",
    beverages: "food",
    bar: "food",
};

/** Catalogue subcategory → the folder it lands in. */
const SUBCATEGORY_OF = {
    balls: "golf-balls",
    accessories: "accessories-and-training",
    training: "accessories-and-training",
    tees: "tees",
    gloves: "gloves",
    bags: "bags",
    headwear: "headwear",
    apparel: "mens",
    "golf-shoes": "golf-shoes",
    "snack-bar": "snack-bar",
    beverages: "beverages",
    bar: "bar",
};

const slug = (s) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);

/** Minimal RFC 4180 field escaping — the manifest has commas inside titles. */
const csvField = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** 500px webp, quality 80 — matches the store's existing files. */
function toWebp(sourcePath, destPath) {
    execFileSync("cwebp", ["-quiet", "-q", "80", "-resize", "500", "0", sourcePath, "-o", destPath]);
}

/* ------------------------------------------------------------------ inputs */

/** Every catalogue record, keyed by the source file or ball folder it describes. */
const records = [];
for (const file of catalogs) {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    if (!Array.isArray(parsed)) throw new Error(`${file} is not a JSON array`);
    records.push(...parsed);
}

/** Resolve a record to the absolute PNG it should ingest. */
function sourceFor(record) {
    // Ball records name a folder; take its first gallery image.
    if (record.folder) {
        const dir = join(BALL_DIR, record.folder);
        if (!existsSync(dir)) return { error: `folder not found: ${record.folder}` };
        const first = readdirSync(dir)
            .filter((f) => extname(f).toLowerCase() === ".png")
            .sort()[0];
        if (!first) return { error: `no png in ${record.folder}` };
        return { path: join(dir, first) };
    }
    // Loose packshots name a file at the top level.
    if (record.file) {
        const p = join(SOURCE, record.file);
        if (!existsSync(p)) return { error: `file not found: ${record.file}` };
        return { path: p };
    }
    return { error: "record has neither `folder` nor `file`" };
}

/* ----------------------------------------------------------------- ingest */

const existing = readFileSync(MANIFEST, "utf8");
const header = existing.split("\n")[0];
const rows = [];
const errors = [];
const seen = new Set();
let converted = 0;
let skipped = 0;

for (const record of records) {
    const sub = record.folder ? "balls" : record.subcategory;
    const category = CATEGORY_OF[sub];
    const subcategory = SUBCATEGORY_OF[sub];
    if (!category) {
        errors.push(`unknown subcategory "${record.subcategory}" for ${record.title}`);
        continue;
    }

    const src = sourceFor(record);
    if (src.error) {
        errors.push(src.error);
        continue;
    }

    const destDir = join(IMAGES, category, subcategory);
    const stem = slug(record.title || basename(src.path, extname(src.path)));
    const tmp = join(destDir, `${stem}.tmp.webp`);

    if (!dryRun) mkdirSync(destDir, { recursive: true });

    let imageName;
    if (dryRun) {
        imageName = `${stem}-DRYRUN.webp`;
    } else {
        toWebp(src.path, tmp);
        const bytes = readFileSync(tmp);
        const sha = createHash("sha256").update(bytes).digest("hex");
        imageName = `${stem}-${sha.slice(0, 10)}.webp`;
        const dest = join(destDir, imageName);
        // Idempotent: identical bytes land on the identical name.
        if (existsSync(dest)) skipped += 1;
        else converted += 1;
        writeFileSync(dest, bytes);
        execFileSync("rm", ["-f", tmp]);
    }

    const localPath = `images/${category}/${subcategory}/${imageName}`;
    if (seen.has(localPath)) continue;
    seen.add(localPath);
    if (existing.includes(localPath)) continue;

    rows.push(
        [
            category,
            subcategory,
            imageName,
            record.title,
            record.description ?? `Product image for ${record.title}.`,
            "Not provided on source page",
            record.price != null ? `$${Number(record.price).toFixed(2)}` : "Not provided on source page",
            localPath,
            "references/090426/pos-item-imagery",
            record.folder ? `${record.folder}/${basename(src.path)}` : record.file,
            "",
        ]
            .map(csvField)
            .join(","),
    );
}

if (errors.length) {
    console.error(`\n${errors.length} problem(s):`);
    for (const e of errors) console.error(`  ${e}`);
}

if (!dryRun && rows.length) {
    const next = existing.trimEnd() + "\n" + rows.join("\n") + "\n";
    writeFileSync(MANIFEST, next);
}

console.log(
    `${dryRun ? "[dry run] " : ""}${records.length} records · ${converted} converted · ${skipped} already present · ${rows.length} manifest rows ${dryRun ? "would be" : ""} appended`,
);
if (header.split(",").length !== 11) console.warn(`warning: manifest header has ${header.split(",").length} columns, expected 11`);
