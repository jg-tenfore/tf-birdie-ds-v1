import { readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Generates `src/data/food-catalog.ts`.
 *
 * Unlike the merchandise catalogue, the food images arrived with no manifest and
 * opaque UUID filenames, so there is nothing to derive names from. The mapping
 * below was authored by looking at each photo; the index is the file's position
 * in a sorted listing, which is why this script asserts the count before
 * writing — if images are added or removed, the indices shift and the mapping
 * must be revisited rather than silently mislabelling everything.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = resolve(root, "store/images/food");

// index → [name, category, price, description]
const MAP = [
    ["3 Musketeers", "Snacks", 3.0, "Whipped chocolate nougat bar."],
    ["Chili Dog", "Grill", 7.5, "All-beef frank, house chili, steamed bun."],
    ["Snickers", "Snacks", 3.0, "Peanuts, caramel and nougat in milk chocolate."],
    ["Nashville Hot Chicken Sandwich", "Sandwiches", 14.5, "Spiced fried chicken, pickles, brioche bun."],
    ["Turn Combo", "Combos", 16.0, "Sub, chips and a fountain drink — the turn-shack standard."],
    ["Hershey's Almond", "Snacks", 3.0, "Milk chocolate with whole almonds."],
    ["Bottled Water", "Beverages", 3.0, "Chilled still water, 20 oz."],
    ["Peanut M&M's", "Snacks", 3.25, "Single-serve peanut chocolate candies."],
    ["Snickers — Sharing", "Snacks", 4.5, "Two-bar sharing size."],
    ["Milk Chocolate M&M's", "Snacks", 3.25, "Single-serve milk chocolate candies."],
    ["Clubhouse Cheeseburger", "Hamburgers", 13.0, "Quarter-pound patty, American cheese, lettuce and tomato."],
    ["Tuna Sub", "Sandwiches", 12.0, "Albacore tuna salad, lettuce, tomato, red onion."],
    ["Miller Lite", "Beer", 7.0, "Domestic light lager, 12 oz can."],
    ["Milk Chocolate M&M's — Sharing", "Snacks", 5.5, "10 oz sharing bag."],
    ["Sapporo Premium", "Beer", 9.0, "Japanese rice lager, tall can."],
    ["Steak Sub Combo", "Combos", 18.0, "Steak and cheese sub, SunChips and iced tea."],
    ["Yes Way Rosé", "Wine", 12.0, "Provençal-style rosé, by the glass."],
    ["Peanut M&M's — Sharing", "Snacks", 5.5, "10 oz sharing bag."],
    ["Chicken Tenders", "Grill", 12.5, "Four hand-breaded tenders with a dipping sauce."],
    ["19 Crimes Red", "Wine", 13.0, "Australian red blend, by the glass."],
    ["Crispy Chicken Sandwich", "Sandwiches", 13.5, "Breaded breast, lettuce, mayo, toasted bun."],
    ["Meatball Marinara", "Sandwiches", 12.5, "Meatballs, marinara and provolone on a toasted roll."],
    ["Roast Beef & Cheddar", "Sandwiches", 13.0, "Shaved roast beef, cheddar, onion bun."],
    ["Grilled Chicken Sandwich", "Sandwiches", 13.5, "Marinated breast, slaw, brioche bun."],
    ["Lobster Roll & Fries", "Grill", 26.0, "Buttered split-top roll, lobster salad, fries."],
    ["Josh Cabernet Sauvignon", "Wine", 14.0, "California cabernet, by the glass."],
    ["Redd's Wicked", "Beer", 8.0, "Hard fruit ale, 8% ABV."],
    ["Corona Extra", "Beer", 8.0, "Mexican lager, served with lime."],
    ["Decoy Cabernet Sauvignon", "Wine", 16.0, "Duckhorn's Decoy cabernet, by the glass."],
    ["Ham & Swiss Sub", "Sandwiches", 12.0, "Black forest ham, swiss, lettuce, tomato."],
    ["Bottled Coke", "Beverages", 3.5, "Coca-Cola, 20 oz bottle."],
    ["Southwest Chicken Wrap", "Sandwiches", 12.0, "Grilled chicken, peppers, black beans, chipotle."],
    ["Stella Rosa Moscato", "Wine", 12.0, "Semi-sweet Italian moscato, by the glass."],
    ["Dasani Water", "Beverages", 3.0, "Purified water, 20 oz bottle."],
    ["Kit Kat", "Snacks", 3.0, "Crisp wafers in milk chocolate."],
    ["Nestlé Crunch", "Snacks", 3.0, "Milk chocolate with crisped rice."],
    ["Clubhouse BLT", "Sandwiches", 11.5, "Thick-cut bacon, lettuce, tomato, mayo."],
    ["Lobster Roll Basket", "Grill", 26.0, "Lobster roll with a side of fries."],
    ["Basket of Fries", "Grill", 6.0, "Shoestring fries, sea salt."],
    ["Coca-Cola", "Beverages", 3.0, "Classic Coke, 12 oz can."],
    ["Kit Kat — King Size", "Snacks", 4.0, "Four-finger king size bar."],
];

const files = readdirSync(dir)
    .filter((f) => /\.(jpe?g)$/i.test(f))
    .sort();

if (files.length !== MAP.length) {
    console.error(`Expected ${MAP.length} food images, found ${files.length}.`);
    console.error("The mapping is positional — re-check it against the images before regenerating.");
    process.exit(1);
}

const items = files.map((file, i) => {
    const [name, category, price, description] = MAP[i];
    return {
        id: name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        name,
        description,
        price,
        category,
        path: `food/${file}`,
    };
});

const categories = [...new Set(items.map((i) => i.category))];

const out = `// GENERATED FILE — do not edit by hand.
// Run \`npm run generate:food\` to regenerate from store/images/food.
//
// Food and beverage photography for the restaurant screens. The source images
// carry no metadata, so names, descriptions and prices are authored in
// scripts/generate-food-catalog.mjs and mapped positionally by sorted filename.
// Resolve images with \`storeImage(item.path)\`.

export interface FoodItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: FoodCategory;
    /** Path under /store-images, e.g. "food/abc-retina-large.jpg". */
    path: string;
}

export type FoodCategory = ${categories.map((c) => `"${c}"`).join(" | ")};

export const foodCategories: FoodCategory[] = ${JSON.stringify(categories)};

export const foodItems: FoodItem[] = ${JSON.stringify(items, null, 4)};

/** Items in one category, in catalogue order. */
export const foodByCategory = (category: FoodCategory) => foodItems.filter((i) => i.category === category);

/** Look up a single item by id — used where a screen names a specific product. */
export const food = (id: string) => foodItems.find((i) => i.id === id);
`;

writeFileSync(resolve(root, "src/data/food-catalog.ts"), out);
console.log(`Generated src/data/food-catalog.ts — ${items.length} items across ${categories.length} categories:`);
for (const c of categories) console.log(`  ${c}: ${items.filter((i) => i.category === c).length}`);
