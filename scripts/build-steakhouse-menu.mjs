import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Builds the 19th Hole menu from the steakhouse photo dump.
 *
 * The photos arrived as a saved Uber Eats page: opaque hashed filenames, some
 * with a `srcb64=` query string baked into the name, a mix of jpeg/webp/png,
 * duplicates of the same dish at several resolutions, plus store banners and
 * app-store badges. None of that is safe to reference directly from the app —
 * the names need URL-encoding and carry no meaning.
 *
 * So this script does the identification once: each dish below names the source
 * file it was matched to by eye, and the file is copied to
 * `store/images/food/19th-hole/` under a readable kebab-case name. The original
 * dump is left untouched.
 *
 * Run with `node scripts/build-steakhouse-menu.mjs` after adding photos.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "store/images/food/steakhouse");
const out = join(root, "store/images/food/19th-hole");

/** Files chosen from the dump, by their position in a sorted, deduped listing. */
const INDEX = JSON.parse(readFileSync(join(root, "scripts/steakhouse-sources.json"), "utf8"));

// slug, source index, name, category, price, description
const MENU = [
    ["crispy-calamari", 9, "Crispy Calamari", "Starters", 18, "Flash-fried calamari, sweet peppers, lemon aioli."],
    ["ahi-tuna-tartare", 11, "Ahi Tuna Tartare", "Starters", 24, "Hand-cut ahi, avocado, citrus soy, crisp wontons."],
    ["chili-glazed-shrimp", 6, "Chili-Glazed Shrimp", "Starters", 21, "Crispy shrimp, sweet chili glaze, sesame slaw."],
    ["shrimp-cocktail", 67, "Shrimp Cocktail", "Starters", 26, "Five chilled jumbo shrimp, horseradish cocktail sauce."],
    ["jumbo-lump-crab-cake", 4, "Jumbo Lump Crab Cake", "Starters", 27, "All lump crab, almost no filler, roasted pepper cream."],
    ["crispy-rice-tuna-bites", 13, "Crispy Rice Tuna Bites", "Starters", 22, "Seared tuna over crisped sushi rice, spicy aioli."],
    ["steakhouse-roll", 12, "Steakhouse Roll", "Starters", 23, "Seared filet, avocado and chive, chipotle drizzle."],
    ["honey-butter-rolls", 16, "Honey Butter Rolls", "Starters", 9, "Pull-apart brioche rolls, warm honey butter."],
    ["herb-crusted-lamb-chops", 69, "Herb-Crusted Lamb Chops", "Starters", 29, "Three chops, salsa verde, charred scallion."],

    ["caesar-salad", 14, "Caesar Salad", "Salads", 15, "Whole romaine hearts, parmesan, garlic croutons."],
    ["iceberg-wedge", 18, "Iceberg Wedge", "Salads", 16, "Blue cheese, heirloom tomato, smoked bacon."],
    ["burrata-and-tomato", 5, "Burrata & Heirloom Tomato", "Salads", 19, "Creamy burrata, aged balsamic, basil oil."],
    ["chopped-bacon-salad", 17, "Chopped Salad with Thick-Cut Bacon", "Salads", 18, "Slab bacon, watermelon radish, buttermilk dressing."],

    ["filet-mignon-8oz", 32, "Filet Mignon 8 oz", "Steaks", 62, "Center-cut prime tenderloin, seared and rested."],
    ["petite-filet-6oz", 49, "Petite Filet 6 oz", "Steaks", 52, "The smaller cut of the same prime tenderloin."],
    ["ny-strip-16oz", 51, "New York Strip 16 oz", "Steaks", 68, "Prime strip loin, heavy crust, deeply marbled."],
    ["ribeye-16oz", 48, "Ribeye 16 oz", "Steaks", 72, "Prime ribeye, the richest cut on the board."],
    ["tomahawk-ribeye", 23, "Tomahawk Ribeye 45 oz", "Steaks", 155, "Long-bone ribeye carved tableside. Serves two."],
    ["porterhouse-for-two", 25, "Porterhouse for Two 40 oz", "Steaks", 145, "Strip and filet on the bone, sliced for sharing."],
    ["prime-sliced-steak", 20, "Prime Sliced Steak", "Steaks", 58, "Sliced strip, sea salt, aged balsamic."],
    ["bone-in-strip", 29, "Bone-In Strip 20 oz", "Steaks", 78, "Strip left on the bone for a heavier char."],
    ["steakhouse-trio", 24, "Steakhouse Trio", "Steaks", 89, "Three filet medallions — oscar, scallop and shrimp."],
    ["filet-and-lobster", 55, "Filet & Lobster Tail", "Steaks", 98, "Six-ounce filet with a cold-water tail and drawn butter."],
    ["filet-oscar", 28, "Filet Oscar", "Steaks", 74, "Filet topped with lump crab, asparagus and béarnaise."],

    ["bone-in-ribeye-chop", 107, "Bone-In Ribeye 22 oz", "Chops & Seafood", 84, "Frenched bone, prime ribeye, coarse pepper crust."],
    ["veal-chop", 30, "Veal Chop", "Chops & Seafood", 66, "Thick-cut milk-fed chop, herb butter."],
    ["center-cut-pork-chop", 89, "Center-Cut Pork Chop", "Chops & Seafood", 42, "Brined double chop, cider pan sauce."],
    ["blackened-salmon", 15, "Blackened Salmon", "Chops & Seafood", 42, "Cajun-spiced fillet, chili-honey glaze."],
    ["chilean-sea-bass", 68, "Chilean Sea Bass", "Chops & Seafood", 52, "Miso-glazed bass over creamed spinach."],
    ["seared-ahi-tuna", 22, "Seared Ahi Tuna", "Chops & Seafood", 46, "Rare-seared ahi, wasabi crème, pickled carrot."],
    ["lobster-tail", 44, "Lobster Tail", "Chops & Seafood", 68, "Cold-water tail, drawn butter, charred lemon."],
    ["lobster-shrimp-diavolo", 8, "Lobster & Shrimp Diavolo", "Chops & Seafood", 54, "Lobster and shrimp in a spiced tomato cream."],
    ["grilled-jumbo-shrimp", 40, "Grilled Jumbo Shrimp", "Chops & Seafood", 26, "Four shrimp, garlic butter, lemon."],
    ["crab-cake-napoleon", 19, "Crab Cake Napoleon", "Chops & Seafood", 34, "Stacked crab cake, root vegetable slaw, demi."],

    ["creamed-spinach", 34, "Creamed Spinach", "Sides", 14, "The steakhouse standard, nutmeg and cream."],
    ["skillet-corn", 33, "Skillet Corn", "Sides", 13, "Sweet corn, jalapeño, cream, blistered shishitos."],
    ["lobster-mac-and-cheese", 50, "Lobster Mac & Cheese", "Sides", 26, "Knuckle and claw meat, three cheeses, crumb top."],
    ["potatoes-au-gratin", 64, "Potatoes Au Gratin", "Sides", 14, "Layered and baked in cream until the top sets."],
    ["whipped-potatoes", 43, "Whipped Potatoes", "Sides", 12, "Butter-heavy, chive-finished."],
    ["loaded-smashed-potatoes", 1, "Loaded Smashed Potatoes", "Sides", 14, "Skin-on, bacon, sharp cheddar, scallion."],
    ["loaded-baked-potato", 52, "Loaded Baked Potato", "Sides", 13, "Sour cream, bacon, cheddar, chive."],
    ["grilled-asparagus", 2, "Grilled Asparagus", "Sides", 15, "Charred spears, lemon and cracked pepper."],
    ["broccolini", 10, "Broccolini", "Sides", 13, "Garlic, chili flake, olive oil."],
    ["steak-fries", 3, "Steak Fries", "Sides", 11, "Thick-cut, twice-fried, sea salt."],
    ["wild-mushrooms", 0, "Sautéed Wild Mushrooms", "Sides", 14, "Mixed mushrooms, thyme, sherry butter."],
    ["asparagus-oscar", 37, "Asparagus Oscar", "Sides", 24, "Asparagus, jumbo lump crab, béarnaise."],

    ["bearnaise", 38, "Béarnaise", "Sauces", 4, "Tarragon, shallot, clarified butter."],
    ["chimichurri", 36, "Chimichurri", "Sauces", 4, "Parsley, oregano, garlic, red wine vinegar."],
    ["demi-glace", 42, "Steakhouse Demi-Glace", "Sauces", 4, "Reduced veal stock, red wine."],
    ["horseradish-cream", 39, "Horseradish Cream", "Sauces", 4, "Fresh-grated horseradish, crème fraîche."],
    ["peppercorn-cream", 41, "Peppercorn Cream", "Sauces", 4, "Cracked green peppercorn, cognac."],
    ["whiskey-peppercorn", 35, "Whiskey Peppercorn", "Sauces", 4, "Bourbon-laced pan sauce."],
    ["herb-butter", 47, "Herb Butter", "Sauces", 4, "Compound butter, parsley and chive."],
    ["sauce-trio", 45, "Sauce Trio", "Sauces", 10, "Béarnaise, chimichurri and peppercorn cream."],

    ["lemon-cake", 21, "Lemon Doberge Cake", "Desserts", 14, "Six thin layers, lemon curd, cream cheese icing."],
    ["chocolate-layer-cake", 31, "Chocolate Layer Cake", "Desserts", 14, "Dark chocolate ganache, whipped cream."],
    ["butter-cake", 70, "Butter Cake", "Desserts", 15, "Warm from the oven with vanilla ice cream."],
    ["strawberries-and-cream", 66, "Strawberries & Cream", "Desserts", 13, "Macerated berries, chantilly, shortbread."],
];

const seen = new Set();
for (const [slug, index] of MENU) {
    if (seen.has(slug)) throw new Error(`Duplicate slug: ${slug}`);
    seen.add(slug);
    if (!INDEX[index]) throw new Error(`No source image at index ${index} (for ${slug})`);
}

mkdirSync(out, { recursive: true });
for (const [slug, index] of MENU) {
    copyFileSync(join(src, INDEX[index]), join(out, `${slug}.jpg`));
}

const categories = [...new Set(MENU.map((m) => m[3]))];

const ts = `// Generated by scripts/build-steakhouse-menu.mjs — do not edit by hand.
//
// The 19th Hole menu. Photography is Del Frisco's Double Eagle Steakhouse
// (Boston) via Uber Eats, used here as realistic placeholder plating; prices and
// copy are written for this prototype and are not the restaurant's own.

export type MenuCategory = ${categories.map((c) => JSON.stringify(c)).join(" | ")};

export interface MenuItem {
    id: string;
    name: string;
    category: MenuCategory;
    price: number;
    description: string;
    /** Path under the store-images static dir. */
    path: string;
}

export const menuCategories: MenuCategory[] = ${JSON.stringify(categories)};

export const menuItems: MenuItem[] = [
${MENU.map(
    ([slug, , name, category, price, description]) =>
        `    { id: ${JSON.stringify(slug)}, name: ${JSON.stringify(name)}, category: ${JSON.stringify(category)}, price: ${price}, description: ${JSON.stringify(description)}, path: ${JSON.stringify(`food/19th-hole/${slug}.jpg`)} },`,
).join("\n")}
];

export const menuByCategory = (category: MenuCategory) => menuItems.filter((i) => i.category === category);
`;

writeFileSync(join(root, "src/data/steakhouse-menu.ts"), ts);
console.log(`Wrote src/data/steakhouse-menu.ts — ${MENU.length} items across ${categories.length} categories:`);
for (const c of categories) console.log(`  ${c}: ${MENU.filter((m) => m[3] === c).length}`);
