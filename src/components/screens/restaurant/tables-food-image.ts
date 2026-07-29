/**
 * Placeholder tiles for the food menu.
 *
 * The shipping app shows real photography on the Tables product grid (a beer
 * bottle, potato skins, a club sandwich, a cheeseburger). That photography is
 * not licensed into this repo, so the grid renders a deterministic tinted SVG
 * carrying the item's own name instead — the layout is what is being
 * documented, and a blank tile would misrepresent it.
 */

/** Warm food-service tints, picked to stay legible under white label text. */
const tints = [
    ["#8C5A3C", "#6E4530"],
    ["#A8763A", "#84592A"],
    ["#5E7A46", "#476034"],
    ["#9A5344", "#7A3F34"],
    ["#4E6E82", "#3B5665"],
    ["#7B5C86", "#5F4668"],
] as const;

const hash = (value: string) => {
    let total = 0;
    for (let index = 0; index < value.length; index += 1) total = (total * 31 + value.charCodeAt(index)) >>> 0;
    return total;
};

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Returns a self-contained `data:image/svg+xml` tile for `label`.
 *
 * Same label in, same tint out, so a story re-render never reshuffles colors.
 */
export const foodTile = (label: string) => {
    const [base, deep] = tints[hash(label) % tints.length];
    const words = label.split(" ");
    // Two lines at most — longer names are the exception on a food menu.
    const lines = words.length > 2 ? [words.slice(0, 2).join(" "), words.slice(2).join(" ")] : [label];
    const fontSize = label.length > 14 ? 22 : 28;

    const text = lines
        .map(
            (line, index) =>
                `<text x="120" y="${132 + (index - (lines.length - 1) / 2) * 34}" fill="#FFFFFF" font-family="Roboto, Arial, sans-serif" font-size="${fontSize}" font-weight="500" text-anchor="middle" dominant-baseline="middle">${escapeXml(line)}</text>`,
        )
        .join("");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" fill="${base}"/><circle cx="120" cy="120" r="86" fill="${deep}"/>${text}</svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
