import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";

import { shiftHistoryRows, type ShiftHistoryRow } from "@/components/screens/operations/shift-summary";
import { MobileRow, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobileBottomNav, MobilePrimary } from "@/components/mobile/mobile-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { money, useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Shift, on a phone.
 *
 * ## What changes from the terminal
 *
 * **The side-by-side goes.** `ShiftScreen` is two unrelated things sharing a
 * canvas: a 44%-wide close-out form (≈567px) on the left and a six-column
 * history table on the right. 567 of 402 is more than the whole screen, so they
 * become the two bottom-nav destinations this prototype uses whenever a
 * landscape screen shows two independent things at once — *Close Out* and
 * *History*.
 *
 * **The centred readouts become rows.** User Name and Shift Date were centred
 * label-over-value pairs with 40px of air between them: ~320px of height for
 * four short strings. As `MobileRow`s they take 128px and read the way every
 * other list on the phone reads.
 *
 * **The history table stacks, which fixes a shipping defect as a side effect.**
 * Six fixed columns summing 755px are drawn into ~708px of pane, so `End Check`
 * is clipped mid-word on the device — you cannot read the check total you are
 * being asked to reconcile against. There is no column geometry left here, so
 * nothing can clip: three lines per shift, `Shift 43766 · Open` / `start → end`
 * / `Start · End · Check`.
 *
 * The open shift's End and End Cash read `----` in the terminal's data. Among
 * dated rows a run of dashes says "still running"; in a stacked row it sits
 * beside its own labels and reads as missing data, so the open shift is
 * labelled **Open** on line 1 instead.
 *
 * **BACK / END SHIFT loses its Back.** Back is the app bar's job here, so END
 * SHIFT takes the full width as a destructive primary.
 *
 * ## What is live
 *
 * `endShift()` is the store's own action — the same one the terminal calls — so
 * ending the shift here closes it on the counter too, and the open row in the
 * table below immediately fills in its end time and its end cash. That figure
 * is `paidTickets` at 6% tax, computed exactly as `ShiftScreen` computes it, so
 * a sale rung up on either device moves the number.
 *
 * **END SHIFT stays live with the cash total blank.** That is what ships, and a
 * re-layout does not get to quietly fix it.
 */

type ShiftTab = "closeout" | "history";

const navItems = [
    { key: "closeout", label: "Close Out", icon: <PointOfSaleIcon sx={{ fontSize: 20 }} /> },
    { key: "history", label: "History", icon: <HistoryIcon sx={{ fontSize: 20 }} /> },
];

/** The terminal's own open-shift identity. Both screens print these strings. */
const OPEN_SHIFT_ID = "43766";
const SHIFT_STARTED = "7/29/2026 8:51 AM";
/** Every closed shift on the reference device — the fixture minus its open row. */
const CLOSED = shiftHistoryRows.filter((r) => r.id !== OPEN_SHIFT_ID);

/**
 * The MD2 filled field, at phone width.
 *
 * Empty, the label sits large on the baseline; with a value it shrinks to a
 * caption above it. Both states ship on this one screen — Ending Cash Total is
 * untouched, Ending Check Total is prefilled with `0` — which is why `value`
 * switches the whole internal layout rather than only the text.
 *
 * Local rather than promoted: two fields do not make a component, and the
 * cash field takes typing while the check field is a readout.
 */
const ShiftField = ({ label, value, onChange }: { label: string; value: string; onChange?: (v: string) => void }) => (
    <Stack
        sx={{
            minHeight: 56,
            px: 1.75,
            py: 0.75,
            justifyContent: "center",
            bgcolor: appColors.canvasAlt,
            borderBottom: `1px solid ${appColors.grey}`,
        }}
    >
        {value && <Typography sx={{ fontSize: 12, color: appColors.textSecondary, lineHeight: 1.3 }}>{label}</Typography>}
        <Box
            component="input"
            value={value}
            readOnly={!onChange}
            // Numeric, because the only thing that goes in either field is a
            // count of money and a phone should raise the right keyboard.
            inputMode="decimal"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder={value ? undefined : label}
            aria-label={label}
            sx={{
                border: 0,
                outline: "none",
                bgcolor: "transparent",
                fontFamily: "inherit",
                fontSize: 16,
                lineHeight: 1.3,
                color: appColors.textPrimary,
                "&::placeholder": { color: appColors.textSecondary, opacity: 1 },
            }}
        />
    </Stack>
);

/** One shift, three lines. `MobileRow` carries one secondary line; this needs two. */
const ShiftStackedRow = ({ row }: { row: ShiftHistoryRow }) => {
    const isOpen = row.end === "----";
    const cash = [`Start ${row.startCash}`, `End ${row.endCash}`, `Check ${row.endCheck || "—"}`].join(" · ");

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
                {cash}
            </Typography>
        </Stack>
    );
};

export const MobileShiftScreen = () => {
    const { state, paidTickets } = useStore();
    const { endShift } = useActions();

    const [tab, setTab] = useState<ShiftTab>("closeout");
    const [cash, setCash] = useState("");

    // The same arithmetic `ShiftScreen` uses: everything tendered this session,
    // at the flat 6% the shift report applies.
    const takings = paidTickets.reduce((s, t) => s + t.lines.reduce((n, l) => n + l.qty * l.unitPrice, 0) * 1.06, 0);

    const openRow: ShiftHistoryRow = {
        id: OPEN_SHIFT_ID,
        start: SHIFT_STARTED,
        end: state.shiftOpen ? "----" : "7/29/2026 5:00 PM",
        startCash: money(100),
        endCash: state.shiftOpen ? "----" : money(100 + takings),
        endCheck: state.shiftOpen ? "" : money(0),
    };

    return (
        <MobileShell
            title="Shift"
            subtitle={state.shiftOpen ? `${paidTickets.length} sale${paidTickets.length === 1 ? "" : "s"} · ${money(takings)}` : "Ended"}
            active="shift"
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobilePrimary
                        tone={state.shiftOpen ? "destructive" : "default"}
                        disabled={!state.shiftOpen}
                        icon={<CloseIcon sx={{ fontSize: 20 }} />}
                        onClick={endShift}
                    >
                        {state.shiftOpen ? "End Shift" : "Shift Ended"}
                    </MobilePrimary>
                </MobileActionArea>
            }
            bottomNav={<MobileBottomNav items={navItems} active={tab} onChange={(k) => setTab(k as ShiftTab)} />}
        >
            {tab === "closeout" ? (
                <>
                    <MobileSectionHeading>This shift</MobileSectionHeading>
                    <MobileRow title={state.operator?.name ?? "Test Test Account"} subtitle="User Name" />
                    <MobileRow title={SHIFT_STARTED} subtitle="Shift Date" />
                    <MobileRow title={money(takings)} subtitle="Taken this session" />

                    <MobileSectionHeading>Close out</MobileSectionHeading>
                    <Box sx={{ mx: 1.5, mb: 2, display: "grid", gap: 1.25 }}>
                        <ShiftField label="Ending Cash Total" value={cash} onChange={setCash} />
                        {/* Prefilled with 0 on the device, and read-only there
                            too — the check total comes off the deposit slip. */}
                        <ShiftField label="Ending Check Total" value="0" />
                    </Box>
                </>
            ) : (
                <>
                    <MobileSectionHeading>Shift history</MobileSectionHeading>
                    <ShiftStackedRow row={openRow} />
                    {CLOSED.map((row) => (
                        <ShiftStackedRow key={row.id} row={row} />
                    ))}
                </>
            )}
        </MobileShell>
    );
};
