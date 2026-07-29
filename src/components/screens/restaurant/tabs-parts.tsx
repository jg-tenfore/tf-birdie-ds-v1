import { Fragment } from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";

/**
 * The pieces of the shipping Tabs screen.
 *
 * Tabs is the list of everything currently open in the restaurant — detached
 * tables, named customer tabs, and pre-authorised card tabs — all in one flat,
 * unsorted list. Tapping a row opens the same order editor the Tables screen
 * uses, with seat bands down the left.
 */

/* ------------------------------------------------------------------ *
 * The list
 * ------------------------------------------------------------------ */

/**
 * The filter field, rendered as a tinted band directly under the app bar.
 *
 * It is a band, not a field in a card: the lavender fill runs the full width of
 * the screen and there is no input chrome at all.
 */
export const TabsFilterBar = ({ placeholder = "Start typing a customer or employee name to filter…" }: { placeholder?: string }) => (
    <Box
        sx={{
            bgcolor: appColors.filterBar,
            height: 52,
            display: "flex",
            alignItems: "center",
            px: 3,
            borderBottom: `1px solid ${appColors.textPrimary}`,
        }}
    >
        <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{placeholder}</Typography>
    </Box>
);

/** The antler mark, used as the avatar on every tab row and combo tile. */
export const AntlerAvatar = ({ size = 56 }: { size?: number }) => (
    <Box component="img" src={assetUrl("logos/tf-square-black.svg")} alt="" sx={{ width: size, height: size * 0.93, flexShrink: 0 }} />
);

export interface TabListRow {
    id: string;
    /** Left-hand title — a customer name, a tab name, or a detached-table summary. */
    title: string;
    /** Right-hand meta block: employee, then order id / timestamp, then card. */
    meta: string[];
    amount: string;
}

/**
 * One row of the tab list.
 *
 * Rows are full-bleed and undifferentiated — a detached table, a named tab, and
 * a card-on-file tab all use the same shape, and the only thing distinguishing
 * them is what the meta block happens to contain.
 */
export const TabRow = ({ row }: { row: TabListRow }) => (
    <Stack direction="row" spacing={3} sx={{ alignItems: "center", minHeight: 89, px: 3, bgcolor: appColors.surface }}>
        <AntlerAvatar />

        <Typography sx={{ flex: 1, minWidth: 0, fontSize: 20, color: appColors.textPrimary }} noWrap>
            {row.title}
        </Typography>

        <Box sx={{ width: 300, flexShrink: 0 }}>
            {row.meta.map((line) => (
                <Typography key={line} sx={{ fontSize: 12, lineHeight: 1.8, color: appColors.textSecondary }}>
                    {line}
                </Typography>
            ))}
        </Box>

        <Typography sx={{ width: 110, flexShrink: 0, textAlign: "right", fontSize: 17, color: appColors.textPrimary }}>
            {row.amount}
        </Typography>
    </Stack>
);

export const TabList = ({ rows }: { rows: TabListRow[] }) => (
    <Box>
        {rows.map((row) => (
            <Fragment key={row.id}>
                <TabRow row={row} />
                <Divider />
            </Fragment>
        ))}
    </Box>
);

/* ------------------------------------------------------------------ *
 * The order editor a tab opens into
 * ------------------------------------------------------------------ */

/**
 * Seat band colours, read off the reference screenshots.
 *
 * These do not match `appColors.seat` exactly — the shipping app's fourth seat
 * is a saturated blue where the token array has a green — so the observed
 * values are used here rather than silently correcting the screen.
 */
export const seatBandColors = ["#3D7FA6", "#E8455F", "#C97B8B", "#2A5CA6"] as const;

export interface ComboTile {
    name: string;
    price: string;
}

/**
 * The combos grid.
 *
 * Combos have no photography in the app either — every one of them falls back
 * to the antler mark — so this is faithful rather than a placeholder.
 */
export const ComboTileGrid = ({ combos }: { combos: ComboTile[] }) => (
    <Box
        sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(212px, 1fr))",
            gap: 1,
            px: 1.25,
            pt: 1.25,
        }}
    >
        {combos.map((combo) => (
            <Stack
                key={combo.name}
                direction="row"
                spacing={1.5}
                sx={{
                    alignItems: "center",
                    minHeight: 84,
                    px: 1,
                    bgcolor: appColors.surface,
                    borderBottom: `1px solid ${appColors.divider}`,
                    borderRadius: `${appRadius.tile}px`,
                }}
            >
                <AntlerAvatar size={60} />
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{combo.name}</Typography>
                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{combo.price}</Typography>
                </Box>
            </Stack>
        ))}
    </Box>
);

/** One underlined, centred, placeholder-only field on the open-food form. */
const OpenFoodField = ({ label }: { label: string }) => (
    <Box sx={{ borderBottom: `1px solid ${appColors.textPrimary}`, pb: 1.25 }}>
        <Typography sx={{ fontSize: 20, textAlign: "center", color: appColors.textSecondary }}>{label}</Typography>
    </Box>
);

/**
 * The open-food form.
 *
 * Rings up something that is not on the menu. Everything is centred and
 * placeholder-only — there are no field labels, so once a value is typed the
 * operator has no reminder of what each line was for.
 */
export const OpenFoodForm = ({ selected = "Food and Beverage" }: { selected?: "Food and Beverage" | "Alcohol" }) => (
    <Box sx={{ width: 492, mx: "auto", pt: "54px" }}>
        <OpenFoodField label="Enter Name of open food item" />

        <Stack spacing={2.5} sx={{ pl: "63px", pt: "70px", pb: "80px" }}>
            {(["Food and Beverage", "Alcohol"] as const).map((option) => (
                <Stack key={option} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    {option === selected ? (
                        <RadioButtonCheckedIcon sx={{ fontSize: 30, color: appColors.textPrimary }} />
                    ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 30, color: appColors.textPrimary }} />
                    )}
                    <Typography sx={{ fontSize: 26, color: appColors.textPrimary }}>{option}</Typography>
                </Stack>
            ))}
        </Stack>

        <OpenFoodField label="Enter Additional Notes" />
        <Box sx={{ height: 50 }} />
        <OpenFoodField label="Enter Price" />
    </Box>
);
