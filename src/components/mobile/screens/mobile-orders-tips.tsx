import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintIcon from "@mui/icons-material/Print";

import { type DayTotal, dayTotalLabels, paymentColumns } from "@/components/screens/restaurant/orders-tips-totals";
import { appColors } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileEmpty, MobileSeatBand } from "../mobile-parts";
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
 * **Mobile Screens — 9-ordersTips.** Laid out against `App Screens →
 * 9-ordersTips`.
 *
 * End-of-shift reconciliation. This is the widest screen in the set — a
 * seven-across totals strip over a seven-column ledger under a **six-button**
 * action bar — and it is the one where every rule in
 * `Mobile Screens → Overview` fires at once.
 *
 * ## The totals strip rewraps, it does not shrink
 *
 * `DayTotalsStrip` is `repeat(7, 1fr)` on navy: `Total Sales`, `Total
 * Payments`, `Cash Turn In`, `Total Credit`, `Total Comps`, `Total Discounts`,
 * `Total Tips`, each a 13px label with its figure underneath. Across 1280px
 * that is 183px a cell. Across 402px it is **57px** — and `Total Discounts` is
 * ~98px at 13px, `Total Payments` ~93px. Five of the seven labels would wrap or
 * clip.
 *
 * The cell itself is fine; there are simply too many of them per row. So the
 * grid goes from seven columns to **two**, and the same seven cells wrap to
 * four rows — label over figure, centred, navy, exactly as the tablet composes
 * them. 201px a cell, which fits the longest label with room over.
 *
 * The last row holds one cell rather than two. That is left as it falls instead
 * of being stretched or centred, because `Total Tips` is the figure this screen
 * is named for and a full-width cell would make it look like a summary of the
 * six above it, which it is not.
 *
 * **The strip prints no zeros.** An untraded day is a grid of labels over empty
 * space, and that is kept: the app renders no placeholder, so neither does
 * this. It is the reason the strip declares a minimum height rather than
 * sizing to its content.
 *
 * ## Which number leads a ledger row
 *
 * `paymentColumns` is `Payment ID / Order ID / Time / Customer / Payment /
 * Amount / Tip` — seven columns packed into the tablet's left 78%. At 402px
 * that is 45px a column, so the ledger stacks like every other wide table here,
 * and the question is which of the seven leads.
 *
 * It is **Amount**. Not Tip, even though tips are the reason you opened the
 * screen: Tip is the field being *entered*, and a value you are about to type
 * cannot also be the value that identifies the row you are typing into. Not
 * Payment ID either — an eleven-digit number identifies a row to the system,
 * not to the server reading it. So a row reads *Customer* on line 1 with
 * *Amount* trailing it, `Payment · Time · Order ID · Payment ID` joined on line
 * 2, and the Tip entry as the row's own control.
 *
 * The header band that labelled those seven columns is dropped, for the same
 * reason it is dropped on `8-reservations`: once a row stacks there are no
 * columns left to head. `paymentColumns` is still imported, because it is the
 * definition of what a row contains and this file should break if it changes.
 *
 * ## Six buttons become four affordances
 *
 * `BACK / POP / TIP OUT / Wednesday, July 29 2026 / DAY REPORT / SHIFT REPORT`
 * across 1280px is 205px a button. Across 402px it is **67px**, in which
 * `Wednesday, July 29 2026` — 22 characters — is not a button, it is a joke.
 *
 * | Tablet button | Mobile | Why |
 * | :-- | :-- | :-- |
 * | BACK | App bar leading | Same as every screen in this category |
 * | Wednesday, July 29 2026 | The slate date band under the app bar | It is not an action, it is which day you are looking at — and `8-reservations` already renders a day that way |
 * | POP | Secondary, still red | Popping the drawer is destructive-adjacent and the app colours it so |
 * | TIP OUT | Secondary, slate | Pairs with POP; both act on money already taken |
 * | DAY REPORT | The full-width green primary | The one thing here that closes something |
 * | SHIFT REPORT | The overflow sheet | A day report closes the day and is printed once; a shift report closes one server and is printed on demand. The rarer of two prints is the one that moves |
 */

/**
 * The navy day-totals strip, rewrapped two-up.
 *
 * Kept local because the reflow is the whole point — the tablet's
 * `DayTotalsStrip` takes its column count from `totals.length`, which is
 * exactly the behaviour that has to stop at this width.
 */
const MobileDayTotals = ({ totals }: { totals: DayTotal[] }) => (
    <Box
        sx={{
            flexShrink: 0,
            bgcolor: appColors.navy,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            alignContent: "start",
            rowGap: 1.5,
            py: 2,
        }}
    >
        {totals.map((total) => (
            <Stack key={total.label} sx={{ alignItems: "center", gap: 1, minHeight: 42 }}>
                <Typography sx={{ fontSize: 13, color: "#fff" }}>{total.label}</Typography>
                {/* No placeholder on an untraded day — the app prints nothing
                    and so does this. */}
                {total.value && <Typography sx={{ fontSize: 17, color: "#fff", fontWeight: 500 }}>{total.value}</Typography>}
            </Stack>
        ))}
    </Box>
);

export interface MobileOrdersTipsProps {
    /** The seven day figures. Blank values on a day with no activity. */
    totals?: DayTotal[];
    /** Seeds the overflow sheet open. */
    sheet?: boolean;
    drawerOpen?: boolean;
}

/**
 * Orders & Tips, on a phone.
 *
 * A day with no tippable payments — the strip's labels over empty space, the
 * antler mark, and the four affordances the six-button bar became.
 */
export const MobileOrdersTips = ({
    totals = dayTotalLabels.map((label) => ({ label })),
    sheet: sheet0 = false,
    drawerOpen = false,
}: MobileOrdersTipsProps) => {
    const [sheet, setSheet] = useState(sheet0);
    const [drawer, setDrawer] = useState(drawerOpen);

    return (
        <MobileScreen
            appBar={
                <MobileAppBar title="Orders & Tips" leading="menu" onLeading={() => setDrawer(true)} onOverflow={() => setSheet(true)} />
            }
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary tone="destructive">
                            <FileDownloadOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                            Pop
                        </MobileSecondary>
                        <MobileSecondary>Tip Out</MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary icon={<PrintIcon sx={{ fontSize: 20 }} />}>Day Report</MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                drawer ? (
                    <MobileNavDrawer active="orderstips" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
                ) : sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={[
                            {
                                label: "Shift Report",
                                icon: <PrintIcon sx={{ fontSize: 20 }} />,
                                onClick: () => setSheet(false),
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            {/* The date button out of the middle of the action bar, rendered as
                the day band `8-reservations` already uses. */}
            <MobileSeatBand label="WEDNESDAY, JULY 29 2026" color={appColors.slate} />
            <MobileDayTotals totals={totals} />
            <MobileEmpty message="No tippable payments exist for this day." />
        </MobileScreen>
    );
};

/**
 * What a ledger row would carry, in the order the stacked row reads it.
 *
 * Exported so the mobile ordering is written down next to the tablet's column
 * list rather than living only in prose. `paymentColumns` is carried on
 * `source` rather than restated, so the two can be diffed the day an eighth
 * column appears.
 */
export const mobilePaymentRowOrder = {
    /** Line 1, leading. */
    title: "Customer",
    /** Line 1, trailing — the figure that identifies the payment. */
    value: "Amount",
    /** Line 2, joined. */
    meta: ["Payment", "Time", "Order ID", "Payment ID"],
    /** The row's own control. */
    entry: "Tip",
    source: paymentColumns,
} as const;
