import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import BackupOutlinedIcon from "@mui/icons-material/BackupOutlined";
import CheckIcon from "@mui/icons-material/Check";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate, useParams } from "react-router-dom";

import { accessoriesCountLines } from "@/components/screens/operations/inventory-count-detail";
import { inventoryCategories, inventoryCountRows } from "@/components/screens/operations/inventory-count-list";
import { MobileFab, MobileRow, MobileSeatBand, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobileBottomSheet, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { useActions } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Inventory Counts, on a phone — the list, the new-count form, and a count.
 *
 * ## The list: a three-column grid becomes a two-line row
 *
 * `InventoryCountListRow` is a `1fr 1.15fr 1.4fr` grid, 76px tall, with 36px
 * side insets: title left, "92 products" left-of-centre, "7/20/2026 11:35 AM"
 * flush right. At 402px those columns are 108 / 124 / 151px *before* the insets,
 * and the timestamp alone measures ~130px at 15px Roboto. Two of three cells
 * truncate, and the worst hit is the count title — the only cell you are
 * scanning for.
 *
 * So the row stacks: title on line 1, the other two cells joined as
 * `92 products · 7/20/2026 11:35 AM`. The row drops 76dp → `MobileRow`'s 64dp,
 * so nine counts fit where the terminal showed nine in twice the height.
 *
 * **The scope bar is not an action, and it stays a bar.** The terminal's action
 * bar on this screen holds one full-width slate button reading `Merchandise` —
 * not an action, the category the list is scoped to. That already *is* a
 * full-width slate bar, so it survives untouched as `MobilePrimary
 * tone="default"`. Only what it opens changes: `InventoryCategoryMenu` is
 * already a hand-drawn sheet (`left: 8, right: 8, bottom: 80`, slate, three 64px
 * rows), so it becomes the real `MobileBottomSheet` — same three categories,
 * same order, the current scope carrying a check instead of a position.
 *
 * **`+` leaves the app bar for the floating pill.** At 402px the bar already
 * carries a leading, a title and an overflow; a 30px `+` beside a 24px hamburger
 * reads as chrome rather than as the one thing you came here to do.
 *
 * ## Inside a count: the pair run becomes name-leads, meta-follows
 *
 * `InventoryCountLineRow` prints a 22px name over a wrapped run of three
 * label/value pairs — `SKU: 14431035462  Expected: 0.0  Actual: 65.0` — which
 * measures ~330px at 15px and therefore wraps inside 402px minus its 32px
 * insets. Wrapping a pair run is the worst outcome available: it breaks between
 * a label and its value.
 *
 * So the line stacks. **`Actual` leads**, in `MobileRow`'s trailing slot — it is
 * the number just counted and the only figure on the row that changes. SKU and
 * Expected join the secondary line, which keeps the pairing explicit
 * (`SKU 4439016566 · Expected 0.0`) at a size where it cannot wrap.
 *
 * **No photographs here, deliberately.** Every other selling screen on the
 * phone pulls thumbnails from `@/data/pos-inventory`, and a physical count is
 * exactly where one would help. None of these nine lines resolve: `posImage` is
 * strict by design, and "Ball Marker", "Chapstick" and "credit book test" have
 * no exact catalogue entry — the nearest is *Team Effort Hulk Hat Clip and Ball
 * Marker Set*, a different product. Half a list with thumbnails is worse than
 * none, and a confidently wrong photograph on a stock count is worse than both.
 *
 * **BACK / SAVE loses its Back**, so SAVE takes the full width. The scanner and
 * REFRESH come out of the app bar's right side — where they would be competing
 * with a title, a leading and an overflow inside 402px — and become the
 * secondary row, which is also where a thumb can reach a scanner trigger it
 * pulls a hundred times a count.
 *
 * ## What is live
 *
 * The store has no inventory slice, so what is live here is what the store can
 * actually hold, and nothing is faked around it:
 *
 * - **Counting is real.** Tapping a line adds one to its Actual; SCAN opens the
 *   section as a sheet and picking a product does the same, which is what a
 *   barcode trigger does. REFRESH puts every line back to the saved figure.
 * - **The new-count form really opens the count it names** — SAVE routes to
 *   `/inventory/<title>` and the app bar shows the title you typed.
 * - **Scoping really filters.** The terminal's picker changes nothing, because
 *   its saved counts carry no category; the mapping below is this prototype's
 *   own, flagged rather than reproduced silently.
 * - Every commit toasts through the store's `toast` action, so the confirmation
 *   is the same one the counter shows.
 *
 * `SAVE` stays enabled with the title blank, exactly as it ships — and, as on
 * the terminal, saving a blank title lands you back on the list.
 */

/** Which category each saved count belongs to. The terminal stores none. */
const CATEGORY_OF: Record<string, string> = {
    "78987": "Merchandise",
    test: "Food and Beverage",
    "Austin Test": "Merchandise",
    "Mid week": "Alcohol",
    yeetus: "Merchandise",
    dong: "Food and Beverage",
    ding: "Merchandise",
};

/**
 * The category scope, as the bottom sheet it was already drawn as.
 *
 * The current scope carries a check; the others carry an empty 20px box, so the
 * three labels stay on one left edge rather than shifting under the checked one.
 */
const categorySheetItems = (selected: string, pick: (label: string) => void) =>
    inventoryCategories.map((label) => ({
        label,
        icon: label === selected ? <CheckIcon sx={{ fontSize: 20 }} /> : <Box sx={{ width: 20 }} />,
        onClick: () => pick(label),
    }));

/* -------------------------------------------------------------- the list */

export const MobileInventoryScreen = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState<string>(inventoryCategories[0]);
    const [sheet, setSheet] = useState(false);

    const rows = inventoryCountRows.filter((r) => (CATEGORY_OF[r.title] ?? "Merchandise") === category);

    return (
        <MobileShell
            title="Inventory Counts"
            active="inventory"
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobilePrimary tone="default" onClick={() => setSheet(true)}>
                        {category}
                    </MobilePrimary>
                </MobileActionArea>
            }
            fab={<MobileFab label="New count" onClick={() => navigate("/inventory/new")} />}
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
            {rows.length === 0 ? (
                <Typography sx={{ px: 1.5, py: 3, fontSize: 15, color: appColors.textSecondary }}>
                    No saved counts for {category}.
                </Typography>
            ) : (
                rows.map((row, i) => (
                    <MobileRow
                        key={`${row.title}-${i}`}
                        title={row.title}
                        // The grid's other two cells, joined. Interpunct rather
                        // than a second line: a count row has one fact worth
                        // scanning and two worth confirming.
                        subtitle={`${row.productCount} products · ${row.savedAt}`}
                        drills
                        onClick={() => navigate(`/inventory/${encodeURIComponent(row.title)}`)}
                    />
                ))
            )}
            {/* Clearance for the floating pill, which would otherwise land on
                the last saved count. */}
            <Box sx={{ height: 64 }} />
        </MobileShell>
    );
};

/* ---------------------------------------------------------- the new count */

/**
 * A form field on the bare canvas.
 *
 * Local rather than promoted: two fields do not make a component, and the two
 * behave differently — the category opens a sheet, the title takes text.
 */
const CountField = ({
    label,
    value,
    placeholder,
    caret,
    onChange,
    onClick,
}: {
    label: string;
    value?: string;
    placeholder?: string;
    caret?: boolean;
    onChange?: (v: string) => void;
    onClick?: () => void;
}) => {
    const body = (
        <Stack sx={{ width: "100%", px: 2, py: 1, textAlign: "left" }}>
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{label}</Typography>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, minHeight: 36 }}>
                {onChange ? (
                    <Box
                        component="input"
                        value={value ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                        placeholder={placeholder}
                        aria-label={label}
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            border: 0,
                            outline: "none",
                            bgcolor: "transparent",
                            fontFamily: "inherit",
                            fontSize: 18,
                            color: appColors.textPrimary,
                            "&::placeholder": { color: appColors.textSecondary, opacity: 1 },
                        }}
                    />
                ) : (
                    <Typography sx={{ flex: 1, fontSize: 18, color: value ? appColors.textPrimary : appColors.textSecondary }}>
                        {value ?? placeholder}
                    </Typography>
                )}
                {caret && <ArrowDropDownIcon sx={{ color: appColors.textSecondary }} />}
            </Stack>
        </Stack>
    );
    const sx = { display: "block", width: "100%", bgcolor: appColors.fieldFill, borderBottom: `1px solid ${appColors.textSecondary}` };
    return onClick ? (
        <ButtonBase onClick={onClick} sx={sx}>
            {body}
        </ButtonBase>
    ) : (
        <Box sx={sx}>{body}</Box>
    );
};

export const MobileInventoryNewCountScreen = () => {
    const navigate = useNavigate();
    const { toast } = useActions();

    const [category, setCategory] = useState<string>(inventoryCategories[0]);
    const [title, setTitle] = useState("");
    const [sheet, setSheet] = useState(false);

    const save = () => {
        const name = title.trim();
        toast(name ? `Count “${name}” started · ${category}` : "Count saved");
        // Blank titles are still savable, as they are on the device — and, as
        // there, a blank one just returns you to the list.
        navigate(name ? `/inventory/${encodeURIComponent(name)}` : "/inventory");
    };

    return (
        <MobileShell
            title="Inventory Count"
            active="inventory"
            leading="back"
            onLeading={() => navigate("/inventory")}
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobilePrimary icon={<BackupOutlinedIcon sx={{ fontSize: 20 }} />} onClick={save}>
                        Save
                    </MobilePrimary>
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
            {/* The terminal's asymmetry does not survive: there the "Product
                Category" label is left-aligned while its value is centred with
                the caret pinned 36px from a 1280px edge — a ~400px gap between
                a value and its own control. At 402px that gap closes to nothing
                anyway, so both fields become the same left-aligned filled row. */}
            <CountField label="Product Category" value={category} caret onClick={() => setSheet(true)} />
            <Box sx={{ height: 12 }} />
            <CountField label="Count Title" value={title} placeholder="Enter Title for Count…" onChange={setTitle} />
        </MobileShell>
    );
};

/* ------------------------------------------------------------- the count */

/** `"15.0"` → `15`, and back, so a tally can add one to a printed figure. */
const asNumber = (s: string) => Number(s) || 0;
const asActual = (n: number) => n.toFixed(1);

export const MobileInventoryCountScreen = () => {
    const { title } = useParams();
    const navigate = useNavigate();
    const { toast } = useActions();

    const decoded = decodeURIComponent(title ?? "");

    /** The counted figures. Seeded from the saved count, then tallied against. */
    const [counted, setCounted] = useState<Record<string, number>>(() =>
        Object.fromEntries(accessoriesCountLines.map((l) => [l.sku, asNumber(l.actual)])),
    );
    const [scanner, setScanner] = useState(false);

    const tally = (sku: string) => setCounted((prev) => ({ ...prev, [sku]: (prev[sku] ?? 0) + 1 }));

    const counting = accessoriesCountLines.reduce((s, l) => s + (counted[l.sku] ?? 0), 0);

    return (
        <MobileShell
            // The app bar shows the count's internal id alongside its title, as
            // the terminal does.
            title={`3484 - ${decoded}`}
            subtitle={`Accessories · ${asActual(counting)} counted`}
            active="inventory"
            leading="back"
            onLeading={() => navigate("/inventory")}
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary onClick={() => setScanner(true)}>
                            <QrCodeScannerIcon sx={{ fontSize: 20, mr: 0.75 }} />
                            Scan
                        </MobileSecondary>
                        <MobileSecondary
                            onClick={() => {
                                setCounted(Object.fromEntries(accessoriesCountLines.map((l) => [l.sku, asNumber(l.actual)])));
                                toast("Count refreshed from the last save");
                            }}
                        >
                            <RefreshIcon sx={{ fontSize: 20, mr: 0.75 }} />
                            Refresh
                        </MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary
                        icon={<BackupOutlinedIcon sx={{ fontSize: 20 }} />}
                        onClick={() => {
                            toast(`Saved · ${accessoriesCountLines.length} lines, ${asActual(counting)} counted`);
                            navigate("/inventory");
                        }}
                    >
                        Save
                    </MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                scanner ? (
                    // The scanner, as the only thing a phone can honestly offer
                    // for one: pick the product the trigger would have read.
                    <MobileBottomSheet
                        onDismiss={() => setScanner(false)}
                        items={accessoriesCountLines.map((l) => ({
                            label: l.name,
                            icon: <QrCodeScannerIcon sx={{ fontSize: 20 }} />,
                            onClick: () => {
                                tally(l.sku);
                                setScanner(false);
                                toast(`${l.name} · ${asActual((counted[l.sku] ?? 0) + 1)}`);
                            },
                        }))}
                    />
                ) : undefined
            }
        >
            {/* The navy band stays full width. The terminal insets it 18px each
                side; at 402px an inset band reads as a card, and it is a heading. */}
            <MobileSeatBand label="Accessories" color={appColors.navyDeep} />
            {accessoriesCountLines.map((line) => (
                <MobileRow
                    key={line.sku}
                    title={line.name}
                    subtitle={`SKU ${line.sku} · Expected ${line.expected}`}
                    // The counted figure, in the slot `MobileRow` reserves for a
                    // value a currency format would be wrong for.
                    trailing={asActual(counted[line.sku] ?? 0)}
                    onClick={() => tally(line.sku)}
                />
            ))}
            <Box sx={{ height: 8 }} />
        </MobileShell>
    );
};
