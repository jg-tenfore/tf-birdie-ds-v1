import { foodItems } from "./food-catalog";
import { allProducts, type StoreProduct } from "./store-catalog";
import { storeImage } from "@/utils/asset-url";

/**
 * The POS's sellable inventory — what actually goes on a button.
 *
 * `store-catalog.ts` is a **photography** catalogue: 178 products grouped by
 * where their images live (`apparel/mens`, `equipment/golf-balls`). That is the
 * right shape for an image pipeline and the wrong shape for a register, which
 * thinks in the categories printed on its own buttons — Golf Balls, Hats,
 * Gloves, Range Balls, Beverages.
 *
 * This maps one onto the other, and it is the single place a screen should ask
 * "what can I sell and what does it cost". Before it existed, every screen
 * hand-picked `golfBalls[0]` and hardcoded a price beside it, which is how the
 * Pro Shop grid ended up with 24 category labels and 6 photographs.
 *
 * ## Where the data comes from
 *
 * | Source | What it carries |
 * | -- | -- |
 * | `store-catalog.ts` | 178 products. **73 carry a real price and a written description** — those are the ones ingested from `references/090426/`, via `scripts/ingest-pos-imagery.mjs` |
 * | `food-catalog.ts` | 40 kitchen items, already priced and described |
 *
 * ## Prices on the other 105
 *
 * The original scrape captured photographs and titles but no prices. Rather
 * than leave two thirds of the inventory priceless — a POS tile without a price
 * is not a POS tile — unpriced products get a **synthetic** price: a stable
 * value inside a per-category band, derived from a hash of the title.
 *
 * It is deterministic, so a product costs the same in every story and every
 * screenshot, and `isSynthetic` marks it so nothing downstream mistakes it for
 * real catalogue data. The same technique the tee sheet and the CRM already use
 * for generated fixtures.
 */

export interface PosItem {
    id: string;
    name: string;
    price: number;
    /** Authored copy where the catalogue has it. */
    description?: string;
    /** Resolved `/store-images/...` URL, ready for `src` or `background-image`. */
    image?: string;
    /** The POS category button this sits behind. */
    category: string;
    /** True when the price was derived rather than read from the catalogue. */
    isSynthetic: boolean;
}

export interface PosCategory {
    /** The button label, as the shipping grid prints it. */
    label: string;
    /** A representative photo for the category tile. */
    image?: string;
    items: PosItem[];
}

/* ------------------------------------------------------------- synthetic */

/** Stable per-title hash. Same generator style as the tee sheet and the CRM. */
const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
};

/** Plausible price bands, by store subcategory. */
const BANDS: Record<string, [number, number]> = {
    "golf-balls": [24, 55],
    "accessories-and-training": [9, 49],
    gloves: [18, 26],
    tees: [4, 9],
    headwear: [24, 38],
    bags: [149, 320],
    mens: [65, 125],
    womens: [65, 125],
    "golf-shoes": [89, 220],
    "snack-bar": [2, 12],
    beverages: [2, 8],
    bar: [6, 14],
};

/** Lands on a `.99` price, which is what a shop actually charges. */
const synthesise = (title: string, sub: string) => {
    const [lo, hi] = BANDS[sub] ?? [10, 60];
    const span = Math.max(1, hi - lo);
    return Math.round(lo + (hash(title) % span)) - 0.01;
};

/* --------------------------------------------------------------- mapping */

/**
 * Store subcategory → the POS button it sells under.
 *
 * Left side is where the photograph lives; right side is what the register
 * calls it. They are not the same vocabulary and pretending otherwise is what
 * made the old grid mostly unphotographed.
 */
const BUTTON_OF: Record<string, string> = {
    "golf-balls": "Golf Balls",
    "accessories-and-training": "Accessories",
    gloves: "Gloves",
    tees: "Tees",
    headwear: "Hats",
    bags: "Bags",
    mens: "Shirts",
    womens: "Shirts",
    "golf-shoes": "Shoes",
    "snack-bar": "Snacks",
    beverages: "Beverages",
    bar: "Beer & Wine",
};

const toItem = (p: StoreProduct): PosItem => {
    const priced = p.price != null;
    return {
        id: p.path,
        name: p.title,
        price: priced ? p.price! : synthesise(p.title, p.subcategory),
        description: p.description,
        image: storeImage(p.path),
        category: BUTTON_OF[p.subcategory] ?? "Miscellaneous",
        isSynthetic: !priced,
    };
};

/** Everything sellable, merchandise and kitchen alike. */
export const posItems: PosItem[] = [
    ...allProducts.map(toItem),
    ...foodItems.map((f) => ({
        id: f.id,
        name: f.name,
        price: f.price,
        description: f.description,
        image: storeImage(f.path),
        category: f.category,
        isSynthetic: false,
    })),
];

/**
 * The categories, in the order the shipping Pro Shop grid prints them.
 *
 * Range Balls, Gift Card, Punch Cards, Memberships and Clinics have no
 * photography and never will — they are not physical stock — so they are
 * carried with an item list and no tile image rather than dropped. The grid
 * shows them today and removing them would be a change to the screen, not to
 * the imagery.
 */
const ORDER = [
    "Golf Balls",
    "Shirts",
    "Shoes",
    "Hats",
    "Gloves",
    "Accessories",
    "Bags",
    "Tees",
    "Snacks",
    "Beverages",
    "Beer & Wine",
    "Grill",
    "Sandwiches",
    "Hamburgers",
    "Combos",
];

export const posCategories: PosCategory[] = ORDER.map((label) => {
    const items = posItems.filter((i) => i.category === label);
    return {
        label,
        // The first item with real photography stands for the category — a
        // synthetic-priced product still has a real picture.
        image: items.find((i) => i.image)?.image,
        items,
    };
}).filter((c) => c.items.length > 0);

/* --------------------------------------------------------------- lookups */

const norm = (s: string) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

const byNorm = new Map(posItems.map((i) => [norm(i.name), i]));
const byCategory = new Map(posCategories.map((c) => [norm(c.label), c]));

/** An item by name, exact after normalising. */
export const posItem = (name: string): PosItem | undefined => byNorm.get(norm(name));

/**
 * A photograph for any POS label — an item name or a category button.
 *
 * Deliberately strict: item first, then category, then `undefined`. It does not
 * fuzzy-match, because the last resolver that did put a chocolate bar behind
 * "Chips & Salsa", and a confidently wrong photograph is worse than none.
 */
export const posImage = (label: string): string | undefined => byNorm.get(norm(label))?.image ?? byCategory.get(norm(label))?.image;

/** A category's items, for a drill-down list. */
export const posCategory = (label: string): PosCategory | undefined => byCategory.get(norm(label));

/** How much of the inventory carries real catalogue data rather than derived. */
export const posInventoryFacts = {
    total: posItems.length,
    withRealPrice: posItems.filter((i) => !i.isSynthetic).length,
    withDescription: posItems.filter((i) => i.description).length,
    withImage: posItems.filter((i) => i.image).length,
    categories: posCategories.length,
} as const;
