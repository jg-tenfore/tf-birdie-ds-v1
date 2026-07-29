import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * A single Pro Shop catalog tile: a square photo with the category name on a
 * white strip underneath.
 *
 * Measured from `references/072926/1-proshop/` — the tile is 96px wide with a
 * 100px image well, and the grid distributes the leftover width between six of
 * them rather than stretching the tiles themselves. Six tiles plus their
 * gutters is exactly the canvas left over once the 380px order panel is taken
 * out, which is why the tiles are this small.
 */

const TILE_WIDTH = 96;
const IMAGE_HEIGHT = 100;

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Tint pool for generated tiles.
 *
 * Several shipping categories (food, drink, gift cards, memberships, the
 * simulator) have no product photography in the catalog. Rather than ship a
 * broken image, those tiles get a flat brand-tinted plate with the category
 * name on it, picked deterministically so a category keeps the same color.
 */
const tintPool = [appColors.slate, appColors.greenTee, appColors.navy, appColors.orange, appColors.greenDark, appColors.textSecondary];

const tintFor = (label: string) => {
    let hash = 0;
    for (let i = 0; i < label.length; i += 1) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
    return tintPool[hash % tintPool.length];
};

/**
 * Builds an inline SVG data URI standing in for missing product photography.
 *
 * Words wrap one per line and the type scales down for long single words
 * ("Miscellaneous") so nothing overflows the 148px plate.
 */
export const placeholderTile = (label: string) => {
    const words = label.split(" ");
    const longest = words.reduce((max, word) => Math.max(max, word.length), 0);
    const fontSize = Math.max(8, Math.min(15, Math.round((TILE_WIDTH * 0.86) / (longest * 0.58))));
    const lineHeight = Math.round(fontSize * 1.25);
    const firstBaseline = IMAGE_HEIGHT / 2 - ((words.length - 1) * lineHeight) / 2 + fontSize / 3;

    const lines = words
        .map((word, index) => `<tspan x="${TILE_WIDTH / 2}" y="${firstBaseline + index * lineHeight}">${escapeXml(word)}</tspan>`)
        .join("");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_WIDTH}" height="${IMAGE_HEIGHT}" viewBox="0 0 ${TILE_WIDTH} ${IMAGE_HEIGHT}">
<rect width="${TILE_WIDTH}" height="${IMAGE_HEIGHT}" fill="${tintFor(label)}"/>
<circle cx="${TILE_WIDTH - 12}" cy="${IMAGE_HEIGHT - 10}" r="30" fill="#FFFFFF" fill-opacity="0.07"/>
<circle cx="14" cy="16" r="20" fill="#FFFFFF" fill-opacity="0.05"/>
<text fill="#FFFFFF" font-family="Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="500" text-anchor="middle">${lines}</text>
</svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export interface CategoryTileProps {
    label: string;
    /** Resolved image URL. Falls back to a generated plate when omitted. */
    image?: string;
    onClick?: () => void;
}

export const CategoryTile = ({ label, image, onClick }: CategoryTileProps) => (
    <Box
        component="button"
        type="button"
        onClick={onClick}
        sx={{
            width: TILE_WIDTH,
            p: 0,
            border: 0,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: appColors.surface,
            borderRadius: `${appRadius.tile}px`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
            display: "block",
            font: "inherit",
        }}
    >
        <Box
            sx={{
                height: IMAGE_HEIGHT,
                bgcolor: appColors.surface,
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
            }}
        >
            <Box
                component="img"
                src={image ?? placeholderTile(label)}
                alt=""
                sx={{ width: "100%", height: "100%", objectFit: image ? "contain" : "cover", display: "block" }}
            />
        </Box>
        <Typography sx={{ fontSize: 13, color: appColors.textPrimary, py: 1, px: 0.5 }} noWrap>
            {label}
        </Typography>
    </Box>
);

export const tileGridSx = {
    display: "grid",
    gridTemplateColumns: `repeat(6, ${TILE_WIDTH}px)`,
    justifyContent: "space-between",
    rowGap: "22px",
    px: "28px",
    pb: "20px",
} as const;

export default CategoryTile;
