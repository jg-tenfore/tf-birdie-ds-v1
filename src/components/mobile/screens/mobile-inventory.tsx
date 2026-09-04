import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import BackupOutlinedIcon from "@mui/icons-material/BackupOutlined";
import BarcodeReaderIcon from "@mui/icons-material/BarcodeReader";
import CheckIcon from "@mui/icons-material/Check";

import { accessoriesCountLines, type InventoryCountLine } from "@/components/screens/operations/inventory-count-detail";
import { inventoryCategories, inventoryCountRows } from "@/components/screens/operations/inventory-count-list";
import { appColors } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileFab, MobileRow, MobileSeatBand, MobileSectionHeading } from "../mobile-parts";
import {
    MobileActionArea,
    MobileAppBar,
    MobileBottomSheet,
    MobilePrimary,
    MobileScreen,
    MobileSecondary,
    MobileSecondaryRow,
} from "../mobile-shell";

/**
 * **Mobile Screens — 16-inventory.** Laid out against `App Screens →
 * 16-inventory`.
 *
 * Inventory Counts is the one Operations screen with no reference capture, so
 * it is extrapolated from the four rules in `Mobile Screens → Overview` rather
 * than transcribed. Every fixture is the tablet's own — `inventoryCountRows`,
 * `accessoriesCountLines`, `inventoryCategories` are imported from
 * `@/components/screens/operations/*`, not restated.
 *
 * ## The count list: a three-column grid becomes a two-line row
 *
 * `InventoryCountListRow` is a `1fr 1.15fr 1.4fr` grid, 76px tall, with 36px
 * side insets — title left, "92 products" left-of-centre, "7/20/2026 11:35 AM"
 * flush right. At 402px those three columns are 108 / 124 / 151px before the
 * insets, and the timestamp alone measures ~130px at 15px Roboto. Two of the
 * three cells truncate, and the one that truncates worst is the count title,
 * which is the only cell you are scanning for.
 *
 * So the row stacks: **the title leads on line 1**, and the two remaining cells
 * join into one secondary line — `92 products · 7/20/2026 11:35 AM`. The row
 * drops from 76dp to `MobileRow`'s 64dp, so nine counts fit where the tablet
 * showed nine in twice the height.
 *
 * ## The scope bar is not an action, and it stays a bar
 *
 * The tablet's action bar on this screen holds a single full-width slate button
 * reading `Merchandise`. It is not an action — it is the category the list is
 * scoped to. That already *is* a full-width slate bar, so it survives the
 * narrowing untouched as `MobilePrimary tone="default"`; only what it opens
 * changes (below).
 *
 * `+` moves out of the app bar and becomes the floating pill, because the app
 * bar at this width is already carrying a leading, a title and an overflow, and
 * a 32px `+` glyph beside a 24px hamburger reads as chrome rather than as the
 * one thing you came here to do.
 *
 * ## The dark category sheet becomes the system bottom sheet
 *
 * `InventoryCategoryMenu` is already a floating sheet rather than a popover —
 * `left: 8, right: 8, bottom: 80`, slate, three 64px rows over the list. That is
 * a bottom sheet drawn by hand, so it becomes the real one: same three
 * categories, same order, and the current scope carries a check rather than
 * being distinguished by position.
 *
 * ## Inside a count: the pair run becomes name-leads, meta-follows
 *
 * `InventoryCountLineRow` prints a 22px name over a wrapped run of three
 * label/value pairs — `SKU: 14431035462  Expected: 0.0  Actual: 65.0` — which
 * measures ~330px at 15px and therefore wraps to two lines inside a 402px
 * screen minus its 32px insets. Wrapping a pair run is the worst outcome
 * available: it breaks between a label and its value.
 *
 * So the line stacks like every other wide row here. **`Actual` leads** — it is
 * the number the operator just counted and the only figure on the row that
 * changes — riding in the trailing slot `MobileRow` documents for "a time, a
 * count". SKU and Expected join the secondary line, which keeps the pairing
 * explicit (`SKU 4439016566 · Expected 0.0`) at a size where it cannot wrap.
 *
 * ## No photographs here, deliberately
 *
 * Every other mobile screen in this category pulls thumbnails from
 * `@/data/pos-inventory`, and a physical count is exactly where a photograph
 * would help. It is not used, because **none of these nine lines resolve**:
 * `posImage` is strict by design, and "Ball Marker", "Chapstick" and
 * "credit book test" have no exact catalogue entry — the closest is
 * *Team Effort Hulk Hat Clip and Ball Marker Set*, which is a different
 * product. Half a list with thumbnails and half without is worse than none, and
 * a confidently wrong photograph on a stock count is worse than both.
 *
 * ## The two-button action bar loses its Back
 *
 * `CountActionBar` is `BACK` + `SAVE`. Back is the app bar's leading arrow on a
 * phone, so `SAVE` takes the full width. The scanner and `REFRESH` come out of
 * the app bar's right side — where they would sit beside a title, a leading and
 * an overflow in 402px — and become the secondary row above it, which is also
 * where a thumb can reach a scanner trigger it fires a hundred times a count.
 */

const navKey = "inventory" as const;

/**
 * The category scope, as the bottom sheet it was already drawn as.
 *
 * The current scope carries a check; the others carry an empty 20px box so the
 * three labels stay on one left edge rather than shifting under the checked one.
 */
const categorySheetItems = (selected: string, pick: (label: string) => void) =>
    inventoryCategories.map((label) => ({
        label,
        icon: label === selected ? <CheckIcon sx={{ fontSize: 20 }} /> : <Box sx={{ width: 20 }} />,
        onClick: () => pick(label),
    }));

export interface MobileInventoryCountListProps {
    /** Seeds the category sheet open, so a story can show it without a click. */
    picker?: boolean;
    drawerOpen?: boolean;
}

/**
 * Saved counts, newest first, scoped to a product category.
 *
 * The rows drill into an open count; the slate bar underneath names the scope
 * and opens the category sheet; the pill starts a new one.
 */
export const MobileInventoryCountList = ({ picker = false, drawerOpen = false }: MobileInventoryCountListProps) => {
    const [sheet, setSheet] = useState(picker);
    const [drawer, setDrawer] = useState(drawerOpen);
    const [category, setCategory] = useState<string>(inventoryCategories[0]);

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Inventory Counts" leading="menu" onLeading={() => setDrawer(true)} />}
            actions={
                <MobileActionArea>
                    <MobilePrimary tone="default" onClick={() => setSheet(true)}>
                        {category}
                    </MobilePrimary>
                </MobileActionArea>
            }
            fab={<MobileFab label="New count" />}
            overlay={
                drawer ? (
                    <MobileNavDrawer active={navKey} onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
                ) : sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={categorySheetItems(category, (label) => {
                            setCategory(label);
                            setSheet(false);
                        })}
                    />
                ) : undefined
            }
        >
            {inventoryCountRows.map((row, index) => (
                <MobileRow
                    key={`${row.title}-${index}`}
                    title={row.title}
                    // The grid's other two cells, joined. Interpunct rather than
                    // a second line, because a count row has one fact worth
                    // scanning and two worth confirming.
                    subtitle={`${row.productCount} products · ${row.savedAt}`}
                    drills
                    onClick={() => {}}
                />
            ))}
            {/* Clearance for the floating pill, which would otherwise land on
                the last saved count. */}
            <Box sx={{ height: 64 }} />
        </MobileScreen>
    );
};

/**
 * An open count.
 *
 * The navy section band is kept at full width — `MobileSeatBand` is the
 * system's full-bleed coloured label band, and this is that band in
 * `appColors.navyDeep` rather than a seat colour. The tablet insets it 18px on
 * each side; at 402px an inset band reads as a card, and it is a heading.
 */
export const MobileInventoryCountDetail = ({
    section = "Accessories",
    lines = accessoriesCountLines,
}: {
    section?: string;
    lines?: InventoryCountLine[];
}) => (
    <MobileScreen
        appBar={<MobileAppBar title="3484 - 78987" leading="back" showOverflow={false} />}
        actions={
            <MobileActionArea>
                <MobileSecondaryRow>
                    <MobileSecondary>
                        <BarcodeReaderIcon sx={{ fontSize: 20, mr: 0.75 }} />
                        Scan
                    </MobileSecondary>
                    <MobileSecondary>Refresh</MobileSecondary>
                </MobileSecondaryRow>
                <MobilePrimary icon={<BackupOutlinedIcon sx={{ fontSize: 20 }} />}>Save</MobilePrimary>
            </MobileActionArea>
        }
    >
        <MobileSeatBand label={section} color={appColors.navyDeep} />
        {lines.map((line) => (
            <MobileRow
                key={line.sku}
                title={line.name}
                subtitle={`SKU ${line.sku} · Expected ${line.expected}`}
                // The counted figure, in the slot `MobileRow` reserves for a
                // value a currency format would be wrong for.
                trailing={line.actual}
                onClick={() => {}}
            />
        ))}
    </MobileScreen>
);

/**
 * A form field on the bare canvas.
 *
 * Local to this screen rather than promoted: two fields do not make a
 * component, and the two behave differently — the category opens a sheet, the
 * title takes text.
 */
const CountField = ({
    label,
    value,
    placeholder,
    caret,
    onClick,
}: {
    label: string;
    value?: string;
    placeholder?: string;
    caret?: boolean;
    onClick?: () => void;
}) => {
    const body = (
        <Stack sx={{ width: "100%", px: 2, py: 1, textAlign: "left" }}>
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{label}</Typography>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, minHeight: 36 }}>
                <Typography sx={{ flex: 1, fontSize: 18, color: value ? appColors.textPrimary : appColors.textSecondary }}>
                    {value ?? placeholder}
                </Typography>
                {caret && <ArrowDropDownIcon sx={{ color: appColors.textSecondary }} />}
            </Stack>
        </Stack>
    );
    const sx = {
        display: "block",
        width: "100%",
        bgcolor: appColors.fieldFill,
        borderBottom: `1px solid ${appColors.textSecondary}`,
    };
    return onClick ? (
        <ButtonBase onClick={onClick} sx={sx}>
            {body}
        </ButtonBase>
    ) : (
        <Box sx={sx}>{body}</Box>
    );
};

/**
 * The new-count form behind `+`.
 *
 * Two fields, and the tablet's asymmetry does not survive: there, the
 * "Product Category" label is left-aligned while its value is centred with the
 * caret pinned to the far right inset — 36px from a 1280px edge, so the caret
 * sits ~400px from the value it belongs to. At 402px that gap closes to nothing
 * anyway, so both fields become the same left-aligned filled row with the label
 * above the value, which is what the rest of this category already uses.
 *
 * `SAVE` is still enabled before a title has been entered. That is the shipping
 * app's behaviour and it is kept — see `App Screens → 16-inventory/New count`.
 */
export const MobileInventoryNewCount = ({ category: category0 = "Merchandise" }: { category?: string }) => {
    const [sheet, setSheet] = useState(false);
    const [category, setCategory] = useState(category0);

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Inventory Count" leading="back" showOverflow={false} />}
            actions={
                <MobileActionArea>
                    <MobilePrimary icon={<BackupOutlinedIcon sx={{ fontSize: 20 }} />}>Save</MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={categorySheetItems(category, (label) => {
                            setCategory(label);
                            setSheet(false);
                        })}
                    />
                ) : undefined
            }
        >
            <MobileSectionHeading>New count</MobileSectionHeading>
            <CountField label="Product Category" value={category} caret onClick={() => setSheet(true)} />
            <Box sx={{ height: 12 }} />
            <CountField label="Count Title" placeholder="Enter Title for Count…" />
        </MobileScreen>
    );
};
