import { Fragment, type ReactNode } from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { SxProps, Theme } from "@mui/material/styles";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * The pieces of the shipping Quick Order screen.
 *
 * Quick Order is the counter-service path: no table, no seat, no tab. The
 * operator searches or drills into a menu category, items land in the left-hand
 * order panel, and the bar at the bottom takes payment.
 *
 * The same search field, category chips, and tile grid appear on the Tabs
 * order editor, so those parts are shared rather than duplicated.
 */

/** Column pitch the chips and tiles both sit on. Tiles are centred in it. */
const MENU_COLUMN = 148;
const MENU_TILE_WIDTH = 95;

/* ------------------------------------------------------------------ *
 * Menu browsing
 * ------------------------------------------------------------------ */

/**
 * The product search field.
 *
 * Not a MUI TextField: the app draws a bare underline with an oversized grey
 * placeholder, and no label, no float, no focus ring.
 */
export const ProductSearchField = ({ placeholder = "Start typing product name or SKU…" }: { placeholder?: string }) => (
    <Box sx={{ borderBottom: `1px solid ${appColors.textPrimary}`, pb: 1 }}>
        <Typography sx={{ fontSize: 22, color: appColors.textSecondary, lineHeight: 1.5 }}>{placeholder}</Typography>
    </Box>
);

/**
 * Menu-set chips: All, Dinner, 19th Hole Menu.
 *
 * Inactive is a flat grey block with white text; the active one is navy and
 * carries a pale green underline. Both are square-cornered — nothing in this
 * app is a pill.
 */
export const CategoryChipRow = ({ categories, active }: { categories: string[]; active?: string }) => (
    <Stack direction="row" spacing="17px" sx={{ alignItems: "flex-start" }}>
        {categories.map((category) => {
            const isActive = category === active;

            return (
                <Box key={category} sx={{ width: 131, mt: isActive ? "-4px" : 0 }}>
                    <Box
                        sx={{
                            height: isActive ? 44 : 40,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: isActive ? appColors.navy : appColors.grey,
                            borderRadius: `${appRadius.tile}px`,
                        }}
                    >
                        <Typography sx={{ fontSize: 14, color: "#fff" }}>{category}</Typography>
                    </Box>
                    {isActive && <Box sx={{ height: 4, bgcolor: "#A6CDB2" }} />}
                </Box>
            );
        })}
    </Stack>
);

export interface MenuTile {
    label: string;
    image: string;
}

/** The photo tile grid: a fixed column pitch with a narrower card centred in it. */
export const MenuTileGrid = ({ tiles }: { tiles: MenuTile[] }) => (
    <Box sx={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${MENU_COLUMN}px)`, rowGap: 2.5 }}>
        {tiles.map((tile) => (
            <Box
                key={tile.label}
                sx={{
                    justifySelf: "center",
                    width: MENU_TILE_WIDTH,
                    bgcolor: appColors.surface,
                    borderRadius: `${appRadius.tile}px`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.20)",
                    overflow: "hidden",
                }}
            >
                <Box component="img" src={tile.image} alt="" sx={{ display: "block", width: "100%", height: 103, objectFit: "cover" }} />
                <Typography sx={{ fontSize: 12, textAlign: "center", py: 1, color: appColors.textPrimary }}>{tile.label}</Typography>
            </Box>
        ))}
    </Box>
);

/* ------------------------------------------------------------------ *
 * Drilled-in category: header card + product rows
 * ------------------------------------------------------------------ */

/** Width of the drilled-in product column. Narrow — it does not fill the canvas. */
const PRODUCT_COLUMN = 279;

/**
 * The header card shown after tapping a category tile.
 *
 * It is the same tile shape as the grid, blown up: image area on top, name
 * along the bottom. With no photograph the area reads as empty white, which is
 * exactly what the reference screenshot shows.
 */
export const CategoryHeaderCard = ({ label, image }: { label: string; image?: string }) => (
    <Box sx={{ width: PRODUCT_COLUMN, bgcolor: appColors.surface, position: "relative", overflow: "hidden" }}>
        {image ? (
            <Box component="img" src={image} alt="" sx={{ display: "block", width: "100%", height: 129, objectFit: "cover" }} />
        ) : (
            <Box sx={{ height: 129 }} />
        )}
        <Typography
            sx={{
                position: "absolute",
                insetInline: 0,
                bottom: 8,
                textAlign: "center",
                fontSize: 24,
                color: appColors.textPrimary,
            }}
        >
            {label}
        </Typography>
    </Box>
);

export interface MenuProduct {
    name: string;
    price: string;
    image: string;
}

/** Product rows under a category header — thumbnail, name, price. */
export const MenuProductList = ({ products }: { products: MenuProduct[] }) => (
    <Box sx={{ width: PRODUCT_COLUMN, bgcolor: appColors.surface, mt: "1px" }}>
        {products.map((product, index) => (
            <Fragment key={product.name}>
                {index > 0 && <Divider />}
                <Stack direction="row" spacing={0} sx={{ alignItems: "center" }}>
                    <Box component="img" src={product.image} alt="" sx={{ width: 71, height: 68, objectFit: "cover", flexShrink: 0 }} />
                    <Typography sx={{ flex: 1, minWidth: 0, px: 1.5, fontSize: 15, fontWeight: 500 }}>{product.name}</Typography>
                    <Typography sx={{ pr: 1.5, fontSize: 15 }}>{product.price}</Typography>
                </Stack>
            </Fragment>
        ))}
    </Box>
);

/* ------------------------------------------------------------------ *
 * Order panel lines
 * ------------------------------------------------------------------ */

export interface QuickOrderLine {
    name: string;
    price: string;
    image: string;
    qty: number;
    /** The line the detail pane is currently editing — green bar, tinted row. */
    selected?: boolean;
}

/**
 * A Quick Order panel line.
 *
 * Deliberately not the shared `OrderLineRow`: Quick Order puts the quantity in
 * a small green square on the **corner** of the thumbnail and shows no
 * per-line overflow button, where the Tabs/Tables panel does both differently.
 */
export const QuickOrderLineRow = ({ line }: { line: QuickOrderLine }) => (
    <Box
        sx={{
            borderLeft: line.selected ? `4px solid ${appColors.greenTee}` : "4px solid transparent",
            bgcolor: line.selected ? "#F7F9FA" : appColors.surface,
            borderBottom: `1px solid ${appColors.divider}`,
        }}
    >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 1.5, py: 1 }}>
            <Box sx={{ position: "relative", width: 39, height: 32, flexShrink: 0 }}>
                <Box component="img" src={line.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        minWidth: 15,
                        height: 15,
                        px: "2px",
                        bgcolor: appColors.greenTee,
                        color: "#fff",
                        fontSize: 10,
                        display: "grid",
                        placeItems: "center",
                    }}
                >
                    {line.qty}
                </Box>
            </Box>

            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700 }}>{line.name}</Typography>
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{line.price}</Typography>
        </Stack>
    </Box>
);

/* ------------------------------------------------------------------ *
 * Item detail pane
 * ------------------------------------------------------------------ */

export interface ItemDetailHeaderProps {
    name: string;
    description?: string;
    image: string;
    total: string;
    qty: number;
}

/** Photo, name, description on the left; running total and a stepper on the right. */
export const ItemDetailHeader = ({ name, description, image, total, qty }: ItemDetailHeaderProps) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
        <Box component="img" src={image} alt="" sx={{ width: 82, height: 82, objectFit: "cover", flexShrink: 0 }} />

        <Stack sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
            <Typography sx={{ fontSize: 28, lineHeight: 1.2, color: appColors.textPrimary }}>{name}</Typography>
            {description && <Typography sx={{ fontSize: 13, color: appColors.textSecondary, mt: 0.5 }}>{description}</Typography>}
        </Stack>

        <Stack spacing={1.25} sx={{ alignItems: "flex-end", flexShrink: 0 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "baseline" }}>
                <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>Total</Typography>
                <Typography sx={{ fontSize: 23, color: appColors.green }}>{total}</Typography>
            </Stack>

            <Stack
                direction="row"
                spacing={0}
                sx={{
                    width: 220,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    border: `1px solid ${appColors.textPrimary}`,
                    borderRadius: `${appRadius.button}px`,
                }}
            >
                <Typography sx={{ fontSize: 22, color: appColors.textPrimary, lineHeight: 1 }}>−</Typography>
                <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{qty}</Typography>
                <Typography sx={{ fontSize: 22, color: appColors.green, lineHeight: 1 }}>+</Typography>
            </Stack>
        </Stack>
    </Stack>
);

/** The grey filled note field on the item detail pane. Opens the Order Notes dialog. */
export const AdditionalNotesField = ({ placeholder = "Enter Additional Notes…" }: { placeholder?: string }) => (
    <Box
        sx={{
            bgcolor: "#E1E1E1",
            borderBottom: `1px solid ${appColors.textSecondary}`,
            px: 2,
            height: 55,
            display: "flex",
            alignItems: "center",
        }}
    >
        <Typography sx={{ fontSize: 18, color: appColors.textSecondary }}>{placeholder}</Typography>
    </Box>
);

/**
 * Modifier groups.
 *
 * Underlined text tabs, mixed case — the one place in the app that is not
 * ALL-CAPS — with the selected group in near-black over a dark indicator.
 */
export const ModifierTabs = ({ groups, active }: { groups: string[]; active: string }) => (
    <Stack direction="row" spacing={2.5}>
        {groups.map((group) => {
            const isActive = group === active;

            return (
                <Box
                    key={group}
                    sx={{ pb: "6px", borderBottom: isActive ? `3px solid ${appColors.textPrimary}` : "3px solid transparent" }}
                >
                    <Typography sx={{ fontSize: 18, px: 1, color: isActive ? appColors.textPrimary : "#5B7183" }}>{group}</Typography>
                </Box>
            );
        })}
    </Stack>
);

/** Modifier options: a radio circle plus an ALL-CAPS label in a white card. */
export const ModifierOptions = ({ options }: { options: string[] }) => (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
        {options.map((option) => (
            <Stack
                key={option}
                direction="row"
                spacing={1.5}
                sx={{
                    alignItems: "center",
                    minHeight: 38,
                    px: 1.5,
                    bgcolor: appColors.surface,
                    border: `1px solid ${appColors.divider}`,
                    borderRadius: `${appRadius.tile}px`,
                }}
            >
                <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "#8FBF9C" }} />
                <Typography sx={{ fontSize: 13, letterSpacing: "0.04em", color: appColors.textPrimary }}>{option}</Typography>
            </Stack>
        ))}
    </Stack>
);

/* ------------------------------------------------------------------ *
 * Overlays
 * ------------------------------------------------------------------ */

/**
 * The app's popup menu — long-press on an order line, or the app-bar overflow.
 *
 * Positioned by the caller with `sx`, because the app anchors these to whatever
 * was tapped and the reference screenshots pin them to specific coordinates.
 */
export const PopoverMenu = ({ items, sx }: { items: string[]; sx?: SxProps<Theme> }) => (
    <Paper elevation={8} square sx={{ position: "fixed", zIndex: 1400, bgcolor: appColors.surface, ...sx }}>
        {items.map((item, index) => (
            <Fragment key={item}>
                {index > 0 && <Divider />}
                <Box sx={{ minHeight: 54, display: "flex", alignItems: "center", px: 2.25 }}>
                    <Typography sx={{ fontSize: 18, color: appColors.textPrimary, whiteSpace: "nowrap" }}>{item}</Typography>
                </Box>
            </Fragment>
        ))}
    </Paper>
);

/** Full-width green confirmation band that pushes the content down. */
export const StatusBanner = ({ message }: { message: string }) => (
    <Box sx={{ bgcolor: appColors.green, height: 58, display: "grid", placeItems: "center" }}>
        <Typography sx={{ fontSize: 17, color: "#fff" }}>{message}</Typography>
    </Box>
);

/** Content wrapper for the right-hand canvas — matches the app's 28px gutter. */
export const MenuCanvas = ({ children }: { children: ReactNode }) => <Box sx={{ px: "28px", pt: "22px", pb: 3 }}>{children}</Box>;

/**
 * Search field + menu-set chips + tile grid, in the app's own rhythm.
 *
 * This whole block is identical on Quick Order and on the Tabs order editor,
 * down to the gaps, so both screens render it from here.
 */
export const MenuBrowser = ({ categories, active, tiles }: { categories: string[]; active?: string; tiles: MenuTile[] }) => (
    <MenuCanvas>
        <ProductSearchField />
        <Box sx={{ mt: "40px" }}>
            <CategoryChipRow categories={categories} active={active} />
        </Box>
        <Box sx={{ mt: "31px" }}>
            <MenuTileGrid tiles={tiles} />
        </Box>
    </MenuCanvas>
);
