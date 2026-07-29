/**
 * Placeholder imagery for the food and drink tiles on the Restaurant screens.
 *
 * The shipping app puts a real photograph on every menu category tile, every
 * product row, and every order line. That photography is not in this repo, so
 * these screens draw a tinted, labelled SVG at the same aspect ratio instead.
 * The layout, spacing, and tile proportions stay truthful; only the picture is
 * stand-in. Golf merchandise is the one exception — real product shots for that
 * live in `@/data/store-catalog` — but nothing on Quick Order or Tabs is golf
 * merchandise, so nothing here reaches for them.
 */

/** [background, ink] pairs. Muted enough that the tile chrome still reads. */
const tints: ReadonlyArray<readonly [string, string]> = [
    ["#DCE6DA", "#3F5A46"],
    ["#E7DED2", "#5E4A33"],
    ["#DDE3EC", "#37414A"],
    ["#EDDEDA", "#6B3F38"],
    ["#E4E1EC", "#453B5E"],
    ["#E1E9E9", "#2F4E4E"],
];

/** Stable per-label tint, so the same item looks the same in every story. */
const tintFor = (label: string) => {
    let hash = 0;
    for (let index = 0; index < label.length; index += 1) {
        hash = (hash * 31 + label.charCodeAt(index)) >>> 0;
    }
    return tints[hash % tints.length];
};

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const wrap = (label: string, maxChars: number) => {
    const lines: string[] = [];
    let current = "";

    for (const word of label.split(" ")) {
        if (!current) {
            current = word;
        } else if (`${current} ${word}`.length <= maxChars) {
            current = `${current} ${word}`;
        } else {
            lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);

    return lines.slice(0, 3);
};

export interface FoodImageOptions {
    width?: number;
    height?: number;
    fontSize?: number;
}

/**
 * Returns a `data:` URI for a labelled placeholder tile.
 *
 * Inline SVG rather than a file so the stories stay self-contained and there is
 * no chance of a broken image on the deployed Storybook.
 */
export const foodImage = (label: string, { width = 240, height = 240, fontSize = 24 }: FoodImageOptions = {}) => {
    const [background, ink] = tintFor(label);
    const lines = wrap(label, 14);
    const lineHeight = fontSize * 1.2;
    const firstBaseline = height * 0.74 - ((lines.length - 1) * lineHeight) / 2;

    const tspans = lines
        .map((line, index) => `<tspan x="${width / 2}" y="${firstBaseline + index * lineHeight}">${escapeXml(line)}</tspan>`)
        .join("");

    const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
        `<rect width="${width}" height="${height}" fill="${background}"/>`,
        `<circle cx="${width / 2}" cy="${height * 0.36}" r="${Math.min(width, height) * 0.17}" fill="${ink}" opacity="0.14"/>`,
        `<circle cx="${width / 2}" cy="${height * 0.36}" r="${Math.min(width, height) * 0.26}" fill="none" stroke="${ink}" stroke-width="2" opacity="0.14"/>`,
        `<text font-family="Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" fill="${ink}" text-anchor="middle" opacity="0.9">${tspans}</text>`,
        `</svg>`,
    ].join("");

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export default foodImage;
