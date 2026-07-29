import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { assetUrl, storeImage } from "@/utils/asset-url";
import { golfBalls } from "@/data/store-catalog";

/**
 * The event order screen — what opens when a row on the Events list is tapped.
 *
 * It is the Pro Shop selling surface bound to an event tab: the same left order
 * panel and the same product-category grid, but the app bar carries the event's
 * name instead of an account cluster and the confirming action is ADD PAYMENT
 * rather than PAY. From `references/072926/15-events/`.
 */

export interface EventOrderLine {
    id: string;
    name: string;
    qty: number;
    price: string;
    /** Product photo path under /store-images. Falls back to the antler mark. */
    image?: string;
    /** The first line renders slightly heavier in the reference shot. */
    emphasis?: boolean;
}

/**
 * An order line on the event tab.
 *
 * The quantity badge here is a dark chip pinned to the *corner* of the
 * thumbnail — not the green left-edge strip the Pro Shop order panel uses.
 */
export const EventOrderLineRow = ({ line }: { line: EventOrderLine }) => (
    <Stack
        direction="row"
        spacing={2}
        sx={{
            alignItems: "center",
            px: 2,
            height: 72,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        <Box sx={{ position: "relative", width: 52, height: 44, flexShrink: 0 }}>
            <Box
                component="img"
                src={line.image ? storeImage(line.image) : assetUrl("logos/tf-square-black.svg")}
                alt=""
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
            <Box
                sx={{
                    position: "absolute",
                    top: -2,
                    left: -2,
                    minWidth: 22,
                    height: 20,
                    px: 0.5,
                    borderRadius: `${appRadius.tile}px`,
                    bgcolor: "#3C3C3C",
                    color: "#fff",
                    fontSize: 13,
                    display: "grid",
                    placeItems: "center",
                }}
            >
                {line.qty}
            </Box>
        </Box>

        <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: line.emphasis ? 600 : 400 }} noWrap>
            {line.name}
        </Typography>
        <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>{line.price}</Typography>
    </Stack>
);

/** The event tab exactly as captured — 8 lines, mixed rentals, F&B and green fees. */
export const eventOrderLines: EventOrderLine[] = [
    { id: "nike-club-set", name: "Nike Club Set Rental - 18 Holes", qty: 11, price: "$535.92", emphasis: true },
    { id: "mountain-dew", name: "Mountain Dew", qty: 20, price: "$39.20" },
    { id: "pepsi", name: "Pepsi", qty: 9, price: "$17.64" },
    { id: "walking", name: "Walking", qty: 5, price: "$0.00" },
    { id: "pearl-beer", name: "Pearl Beer", qty: 20, price: "$257.40" },
    { id: "medium-bucket", name: "Medium Bucket", qty: 5, price: "$42.90" },
    { id: "house-red", name: "House Red", qty: 6, price: "$225.24" },
    { id: "bacardi-limon", name: "Bacardi Limon - Bot", qty: 1, price: "$4.51" },
];

export interface CategoryTile {
    label: string;
    /** Path under /store-images when a real photo exists for the category. */
    image?: string;
    /** The grid keeps one tile visibly pressed. */
    selected?: boolean;
}

/** The 12 category tiles the event screen shows, in reference order. */
export const eventCategoryTiles: CategoryTile[] = [
    { label: "Golf Balls", image: golfBalls[0]?.path },
    { label: "Rental Clubs" },
    { label: "Japanese Cuisine" },
    { label: "Range Balls", image: golfBalls[1]?.path },
    { label: "Miscellaneous", image: golfBalls[2]?.path },
    { label: "Beer" },
    { label: "Punch Cards" },
    { label: "Beverages", selected: true },
    { label: "Memberships" },
    { label: "Appetizers" },
    { label: "Liquor" },
    { label: "Events" },
];

export const EventCategoryTileCard = ({ tile }: { tile: CategoryTile }) => (
    <Stack
        sx={{
            width: 96,
            bgcolor: tile.selected ? "#E4E4E4" : appColors.surface,
            borderRadius: `${appRadius.tile}px`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.22)",
            overflow: "hidden",
        }}
    >
        <Box sx={{ height: 96, display: "grid", placeItems: "center", bgcolor: tile.selected ? "#E4E4E4" : appColors.surface }}>
            <Box
                component="img"
                src={tile.image ? storeImage(tile.image) : assetUrl("logos/tf-square-black.svg")}
                alt=""
                sx={{ width: "100%", height: "100%", objectFit: "contain", opacity: tile.image ? 1 : 0.22, p: tile.image ? 0 : 1.5 }}
            />
        </Box>
        <Typography sx={{ px: 0.5, py: 1, fontSize: 13, textAlign: "center", color: appColors.textPrimary }} noWrap>
            {tile.label}
        </Typography>
    </Stack>
);

/** Category grid plus the Scan Mode switch that sits above its top-right corner. */
export const EventCategoryGrid = ({ tiles = eventCategoryTiles }: { tiles?: CategoryTile[] }) => (
    <Stack sx={{ height: "100%", bgcolor: appColors.canvasAlt, px: 4, pt: 1.5, pb: 4 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "flex-end", pb: 2 }}>
            <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>Scan Mode</Typography>
            <Switch />
        </Stack>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3.5 }}>
            {tiles.map((tile) => (
                <EventCategoryTileCard key={tile.label} tile={tile} />
            ))}
        </Box>
    </Stack>
);

export default EventCategoryGrid;
