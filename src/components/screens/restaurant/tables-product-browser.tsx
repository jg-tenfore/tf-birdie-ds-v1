import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { foodTile } from "./tables-food-image";

/**
 * The right-hand product browser on the Tables order screen.
 *
 * Three stacked pieces, in this order: an underlined search field, a row of
 * menu chips, then a grid of category tiles. Drilling into a tile swaps the
 * grid for that category's items; the chips stay put.
 */

/** Underlined free-text search over the menu — matches name or SKU. */
export const ProductSearchField = ({ placeholder = "Start typing product name or SKU…" }: { placeholder?: string }) => (
    <Box
        sx={{
            maxWidth: 706,
            borderBottom: "1px solid",
            borderColor: appColors.textPrimary,
            pb: 1,
            mb: 3,
        }}
    >
        <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{placeholder}</Typography>
    </Box>
);

export interface MenuChip {
    label: string;
    /** The current menu — slate fill with a green underline. */
    active?: boolean;
}

/**
 * Menu selector chips. Exactly one is active; the rest are flat grey.
 * The active chip's green underline sits outside the chip, not inside it.
 */
export const MenuChipRow = ({ chips }: { chips: MenuChip[] }) => (
    <Stack direction="row" spacing={1.5} sx={{ mb: 4, flexWrap: "wrap", rowGap: 1.5 }}>
        {chips.map((chip) => (
            <Box key={chip.label}>
                <ButtonBase
                    sx={{
                        minWidth: 133,
                        minHeight: 40,
                        px: 2,
                        bgcolor: chip.active ? appColors.slate : appColors.grey,
                        color: "#fff",
                        borderRadius: `${appRadius.button}px`,
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                    }}
                >
                    <Typography sx={{ fontSize: 14 }}>{chip.label}</Typography>
                </ButtonBase>
                <Box sx={{ height: 4, bgcolor: chip.active ? appColors.green : "transparent" }} />
            </Box>
        ))}
    </Stack>
);

/**
 * The tile grid. Tiles are small — roughly 96px square plus a caption — and
 * pack from the left, so a four-category menu leaves most of the canvas empty.
 */
export const ProductTileGrid = ({ tiles }: { tiles: string[] }) => (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 96px)", gap: "21px" }}>
        {tiles.map((label) => (
            <ButtonBase
                key={label}
                sx={{
                    display: "block",
                    bgcolor: appColors.surface,
                    borderRadius: `${appRadius.tile}px`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                    textAlign: "center",
                }}
            >
                <Box
                    component="img"
                    src={foodTile(label)}
                    alt=""
                    sx={{ width: "100%", height: 101, objectFit: "cover", display: "block" }}
                />
                <Typography sx={{ fontSize: 13, color: appColors.textPrimary, py: 1, px: 0.5 }} noWrap>
                    {label}
                </Typography>
            </ButtonBase>
        ))}
    </Box>
);

export const TablesProductBrowser = ({ chips, tiles }: { chips: MenuChip[]; tiles: string[] }) => (
    <Box sx={{ p: 3 }}>
        <ProductSearchField />
        <MenuChipRow chips={chips} />
        <ProductTileGrid tiles={tiles} />
    </Box>
);
