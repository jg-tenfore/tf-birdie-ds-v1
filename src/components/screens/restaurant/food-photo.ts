import { foodItems, type FoodCategory } from "@/data/food-catalog";
import { storeImage } from "@/utils/asset-url";

/**
 * Resolves a story's food label to a real photograph.
 *
 * The replica stories name items as the shipping app does ("Open Burger",
 * "Pearl Beer", "Potato Skins"), which mostly does not match the catalogue's own
 * product names. Fuzzy matching alone is not safe here: a plausible-looking
 * category fallback produced a chili dog for "Potato Skins" and a chocolate bar
 * for "Chips & Salsa", which is worse than an obvious placeholder because it
 * reads as real data.
 *
 * So this is deliberately conservative — an explicit alias table for the labels
 * the stories actually use, then strict matching, then `null` so the caller
 * falls back to its tinted placeholder.
 */

/** Labels the replica stories use, mapped to the closest real product. */
const ALIASES: Record<string, string> = {
    // Category tiles — a representative item stands for the category.
    beer: "Miller Lite",
    wine: "Josh Cabernet Sauvignon",
    appetizers: "Chicken Tenders",
    sandwiches: "Ham & Swiss Sub",
    hamburgers: "Clubhouse Cheeseburger",
    drafts: "Miller Lite",
    // Named products with no exact catalogue equivalent.
    "pearl beer": "Corona Extra",
    "open burger": "Clubhouse Cheeseburger",
    "turkey club": "Clubhouse BLT",
    "turkey club sandwich": "Clubhouse BLT",
    "potato skins": "Chicken Tenders",
    "draft domestic": "Miller Lite",
    "draft ipa": "Sapporo Premium",
    "bottled light": "Corona Extra",
    "wings 10 pc": "Chicken Tenders",
    "chips salsa": "Basket of Fries",
    "double stack": "Clubhouse Cheeseburger",
};

const norm = (s: string) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
const STOP = new Set(["the", "a", "of", "and", "with", "size", "sharing", "king"]);
const words = (s: string) =>
    norm(s)
        .split(" ")
        .filter((w) => w.length > 2 && !STOP.has(w));

const byName = (name: string) => foodItems.find((i) => i.name === name);

export function resolveFoodPhoto(label: string): string | null {
    const target = norm(label);

    const alias = ALIASES[target];
    if (alias) {
        const item = byName(alias);
        if (item) return storeImage(item.path);
    }

    const exact = foodItems.find((i) => norm(i.name) === target);
    if (exact) return storeImage(exact.path);

    // Only accept a fuzzy hit on two or more shared meaningful words. One shared
    // word is how "Bottled Light" became bottled water.
    const targetWords = words(label);
    let best: { path: string; score: number } | null = null;

    for (const item of foodItems) {
        const itemWords = words(item.name);
        const score = targetWords.filter((w) => itemWords.includes(w)).length;
        if (score >= 2 && (!best || score > best.score)) best = { path: item.path, score };
    }

    return best ? storeImage(best.path) : null;
}

/** A representative photo for a whole category — used for category tiles. */
export function categoryPhoto(category: FoodCategory): string | null {
    const item = foodItems.find((i) => i.category === category);
    return item ? storeImage(item.path) : null;
}
