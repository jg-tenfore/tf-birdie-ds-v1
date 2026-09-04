import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";

import { shiftHistoryRows, type ShiftHistoryRow } from "@/components/screens/operations/shift-summary";
import { appColors } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileRow, MobileSectionHeading } from "../mobile-parts";
import { MobileActionArea, MobileAppBar, MobileBottomNav, MobilePrimary, MobileScreen } from "../mobile-shell";

/**
 * **Mobile Screens — 17-shift.** Laid out against `App Screens → 17-shift`.
 *
 * Shift is two unrelated things sharing a canvas: a **582px close-out form** on
 * the left and a **six-column history table** on the right. They do not share a
 * scroll, a grid or a heading — they are side by side because the tablet has
 * 1290px and no reason not to.
 *
 * 582 of 402 is more than the whole screen, so the side-by-side goes. The two
 * halves become the two **bottom-nav destinations** this category uses whenever
 * a landscape screen shows two independent things at once: *Close Out* and
 * *History*.
 *
 * ## The form
 *
 * The two readouts (User Name, Shift Date) were centred label-over-value pairs
 * with 40px of vertical gap between them — a layout that spends 320px of height
 * showing four short strings. As rows they take 128px and read the way every
 * other list on the phone reads.
 *
 * The two inputs keep their Material *filled* behaviour intact, because that
 * behaviour is the screen's most visible state: **Ending Cash Total** is
 * untouched so its label still sits large on the baseline, **Ending Check
 * Total** is prefilled with `0` so its label has shrunk to a caption above the
 * value. Both states are on this one screen and both are preserved. The fill is
 * `appColors.canvasAlt`, matching what `MobileOpenFood` already uses for the
 * same control — the tablet's raw `#E2E2E2` is not a token and is not repeated.
 *
 * ## The history table stacks
 *
 * Six fixed-width columns summing 755px — ID 110, Start 170, End 145, Start
 * Cash 120, End Cash 105, End Check 105 — against roughly 708px of space beside
 * the form. **That overflow is why "End Check" is clipped at the screen edge on
 * the device.** Stacking the columns is the one narrowing in this whole
 * category that fixes a shipping defect as a side effect: with no column
 * geometry there is nothing left to clip, and End Check renders in full.
 *
 * Three lines per shift, in the order an operator asks the questions:
 *
 * | Line | Columns |
 * | -- | -- |
 * | 1 | `Shift 43766` · a status word |
 * | 2 | Start → End |
 * | 3 | Start Cash · End Cash · End Check |
 *
 * The open shift is the first row and its End and End Cash cells read `----` in
 * the fixture. On tablet a row of dashes among dated rows is enough to say
 * "still running"; in a stacked row the dashes are surrounded by their own
 * labels and read as missing data, so the open shift is labelled **Open** on
 * line 1. Same fact, said in the form the layout can carry.
 *
 * ## The action bar
 *
 * BACK / END SHIFT. Back is the app bar's job, so END SHIFT takes the full
 * width as a destructive primary — and it stays **live with the cash total
 * blank**, exactly as it ships. That is a real defect and it is preserved
 * rather than quietly fixed in a re-layout.
 */

type ShiftTab = "closeout" | "history";

const navItems = [
    { key: "closeout", label: "Close Out", icon: <PointOfSaleIcon sx={{ fontSize: 20 }} /> },
    { key: "history", label: "History", icon: <HistoryIcon sx={{ fontSize: 20 }} /> },
];

/**
 * The MD2 filled field, at phone width.
 *
 * Empty, the label sits large on the baseline; with a value it shrinks to a
 * caption above it. Both states ship on this screen, which is why `value`
 * switches the whole internal layout rather than just the text.
 */
const MobileFilledField = ({ label, value }: { label: string; value?: string }) => (
    <Stack
        sx={{
            minHeight: 56,
            px: 1.75,
            justifyContent: "center",
            bgcolor: appColors.canvasAlt,
            borderBottom: `1px solid ${appColors.grey}`,
        }}
    >
        {value ? (
            <>
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary, lineHeight: 1.3 }}>{label}</Typography>
                <Typography sx={{ fontSize: 16, color: appColors.textPrimary, lineHeight: 1.3 }}>{value}</Typography>
            </>
        ) : (
            <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>{label}</Typography>
        )}
    </Stack>
);

/** One shift, three lines. `MobileRow` carries one secondary line; this needs two. */
const ShiftStackedRow = ({ row }: { row: ShiftHistoryRow }) => {
    const isOpen = row.end === "----";
    const money = [`Start ${row.startCash}`, `End ${row.endCash}`, `Check ${row.endCheck || "—"}`].join(" · ");

    return (
        <Stack sx={{ px: 1.5, py: 1, gap: 0.25, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16 }} noWrap>
                    Shift {row.id}
                </Typography>
                <Typography sx={{ fontSize: 13, flexShrink: 0, color: isOpen ? appColors.greenTee : appColors.textSecondary }}>
                    {isOpen ? "Open" : "Closed"}
                </Typography>
            </Stack>
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }} noWrap>
                {row.start} → {row.end}
            </Typography>
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }} noWrap>
                {money}
            </Typography>
        </Stack>
    );
};

export interface MobileShiftProps {
    /** Which bottom-nav destination is showing. */
    tab?: ShiftTab;
    userName?: string;
    shiftDate?: string;
    endingCashTotal?: string;
    endingCheckTotal?: string;
    rows?: ShiftHistoryRow[];
    drawerOpen?: boolean;
}

export const MobileShift = ({
    tab: tab0 = "closeout",
    userName = "Test Test Account",
    shiftDate = "7/29/2026 8:51 AM",
    endingCashTotal,
    endingCheckTotal = "0",
    rows = shiftHistoryRows,
    drawerOpen = false,
}: MobileShiftProps) => {
    const [tab, setTab] = useState<ShiftTab>(tab0);
    const [drawer, setDrawer] = useState(drawerOpen);

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Shift" leading="menu" onLeading={() => setDrawer(true)} showOverflow={false} />}
            actions={
                <MobileActionArea>
                    <MobilePrimary tone="destructive" icon={<CloseIcon sx={{ fontSize: 20 }} />}>
                        End Shift
                    </MobilePrimary>
                </MobileActionArea>
            }
            bottomNav={<MobileBottomNav items={navItems} active={tab} onChange={(k) => setTab(k as ShiftTab)} />}
            overlay={
                drawer ? <MobileNavDrawer active="shift" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} /> : undefined
            }
        >
            {tab === "closeout" ? (
                <>
                    <MobileSectionHeading>This shift</MobileSectionHeading>
                    <MobileRow title={userName} subtitle="User Name" />
                    <MobileRow title={shiftDate} subtitle="Shift Date" />

                    <MobileSectionHeading>Close out</MobileSectionHeading>
                    <Box sx={{ mx: 1.5, mb: 2, display: "grid", gap: 1.25 }}>
                        <MobileFilledField label="Ending Cash Total" value={endingCashTotal} />
                        <MobileFilledField label="Ending Check Total" value={endingCheckTotal} />
                    </Box>
                </>
            ) : (
                <>
                    <MobileSectionHeading>Shift history</MobileSectionHeading>
                    {rows.map((row) => (
                        <ShiftStackedRow key={row.id} row={row} />
                    ))}
                </>
            )}
        </MobileScreen>
    );
};
