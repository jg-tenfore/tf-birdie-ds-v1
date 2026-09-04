import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckIcon from "@mui/icons-material/Check";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";

import { MobileEmpty, MobileRow, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobileBottomSheet, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { money, useActions, useStore, type Ticket } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Order Lookup, on a phone.
 *
 * The luckiest screen in the set, and worth saying why: **the three search
 * fields are already 402px wide.** `SearchField` sits in a 50% column of the
 * counter's 1290px canvas, and the Storybook mobile version measures the
 * shipping control at exactly 402 — the width of this phone. The fields need no
 * narrowing at all. They only need to stop sitting beside something.
 *
 * ## What changes from the terminal
 *
 * **The two columns become one scroll.** The terminal is symmetric: scope on
 * the left (which course, which day), the three ways in on the right. Here they
 * stack in reading order — scope first, because scoping to the wrong day and
 * *then* typing an order ID is the failure the arrangement exists to prevent.
 *
 * **The course picker becomes a row.** On the counter the course is set at 31px
 * with a dropdown arrow beside it, centred in a 645px column. `The Dunes of
 * Delgado PROD` at 31px is ~340px of type before the arrow — fine there, and
 * impossible here beside an icon with 16px of gutter each side. So it is a row:
 * the course as the 16px title, the facility as its secondary line, and a `>`
 * where the arrow was, opening a bottom sheet.
 *
 * **The date button is kept almost verbatim.** The terminal draws a 486px slate
 * block with a calendar glyph pinned left and `WEDNESDAY, JULY 29 2026` in 15px
 * caps — which is `MobileSecondary` with an icon at the same fill, casing and
 * tracking. One of the few landscape elements that transfers without an
 * argument.
 *
 * **The 48px gaps between the three fields go.** They were buying air in a tall
 * column; here they would push the third field below the fold. The caption
 * moves from centred-above to inside the field, which is the filled-field
 * pattern the rest of the phone build uses.
 *
 * **BACK / PRINT SNAPSHOT / SEARCH loses its Back** to the app bar, which then
 * takes over returning from a result set. PRINT SNAPSHOT is not a search — it
 * prints the day's summary for the scope above, without searching — so it stays
 * visible as a secondary rather than hiding in the overflow. SEARCH commits, so
 * it takes the full width.
 *
 * **The white canvas is kept.** This screen sits on `appColors.surface` rather
 * than the grey every other screen uses. Unusual enough in the shipping app to
 * be worth carrying over rather than normalising — a re-layout does not get to
 * tidy up a background.
 *
 * ## What is live
 *
 * The course is `state.course` through `setCourse()` — the *same* field the tee
 * sheet reads, so scoping a lookup here re-scopes the sheet on the counter.
 * The facility name the terminal offers in the same list is deliberately not in
 * the sheet: it is `state.facility`, one level up, and putting it into the
 * course field would print a facility where the tee sheet prints a course.
 *
 * Results are real closed sales — `paidTickets` — matched against whichever of
 * the three fields was filled, and they stay **alternatives rather than
 * combining filters**, as the terminal has them. Three identical stacked boxes
 * read as AND and are OR; that is the shipping screen's problem and it is
 * preserved.
 *
 * The date is fixed. Every ticket in the prototype belongs to the store's one
 * `TODAY`, so a picker would be three taps to arrive at the same day; tapping
 * the button says so instead of pretending to filter.
 */

const COURSES = ["North Course", "South Course", "West Course"];

const DATE = "Wednesday, July 29 2026";

/** The MD2 filled field, caption inside. */
const LookupField = ({
    caption,
    placeholder,
    value,
    hint,
    onChange,
}: {
    caption: string;
    placeholder: string;
    value: string;
    hint?: string;
    onChange: (v: string) => void;
}) => (
    <Box sx={{ bgcolor: appColors.canvasAlt, borderBottom: `1px solid ${appColors.grey}`, px: 1.75, py: 0.75 }}>
        <Typography sx={{ fontSize: 12, color: appColors.textSecondary, lineHeight: 1.4 }}>{caption}</Typography>
        <Box
            component="input"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={caption}
            sx={{
                width: "100%",
                border: 0,
                outline: "none",
                bgcolor: "transparent",
                fontFamily: "inherit",
                // 16px is the size below which a mobile browser zooms on focus.
                fontSize: 16,
                lineHeight: 1.4,
                color: appColors.textPrimary,
                "&::placeholder": { color: appColors.textSecondary, opacity: 1 },
            }}
        />
        {hint && <Typography sx={{ fontSize: 11, color: appColors.textSecondary, pb: 0.25 }}>{hint}</Typography>}
    </Box>
);

/** What a closed sale came to, at the flat rate the lookup report uses. */
const ticketTotal = (t: Ticket) => t.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * 1.06;

export const MobileOrderLookupScreen = () => {
    const { state, paidTickets } = useStore();
    const { setCourse, toast } = useActions();

    const [sheet, setSheet] = useState(false);
    const [searched, setSearched] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [paymentId, setPaymentId] = useState("");
    const [product, setProduct] = useState("");

    /**
     * The receipt number a ticket was closed under.
     *
     * The reducer only keeps one — `lastSale.orderNumber` — so only the most
     * recent sale has one to match against. Said out loud under the field
     * rather than silently matching nothing.
     */
    const paymentNumberOf = (t: Ticket) => (state.lastSale?.ticket.id === t.id ? state.lastSale.orderNumber : null);

    const results = paidTickets.filter((t) => {
        const order = orderId.trim().replace(/^#/, "").toLowerCase();
        const payment = paymentId.trim().toLowerCase();
        const item = product.trim().toLowerCase();
        // Alternatives, not filters: any filled field that matches is a hit.
        if (!order && !payment && !item) return true;
        if (order && t.number.toLowerCase().includes(order)) return true;
        if (payment && (paymentNumberOf(t) ?? "").toLowerCase().includes(payment)) return true;
        if (item && t.lines.some((l) => l.name.toLowerCase().includes(item))) return true;
        return false;
    });

    const takings = paidTickets.reduce((s, t) => s + ticketTotal(t), 0);

    return (
        <MobileShell
            title="Order Lookup"
            subtitle={searched ? `${state.course} · ${DATE}` : undefined}
            active="orderlookup"
            leading={searched ? "back" : "menu"}
            onLeading={searched ? () => setSearched(false) : undefined}
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary
                            onClick={() =>
                                toast(
                                    `Snapshot · ${state.course} · ${paidTickets.length} ${
                                        paidTickets.length === 1 ? "order" : "orders"
                                    } · ${money(takings)}`,
                                )
                            }
                        >
                            <PrintIcon sx={{ fontSize: 18, mr: 1 }} />
                            Print Snapshot
                        </MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary icon={<SearchIcon sx={{ fontSize: 20 }} />} onClick={() => setSearched(true)}>
                        Search
                    </MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={COURSES.map((c) => ({
                            label: c,
                            icon: c === state.course ? <CheckIcon sx={{ fontSize: 20 }} /> : <Box sx={{ width: 20 }} />,
                            onClick: () => {
                                setCourse(c);
                                setSheet(false);
                            },
                        }))}
                    />
                ) : undefined
            }
        >
            {/* The white canvas this screen uses instead of the usual grey. */}
            <Box sx={{ minHeight: "100%", bgcolor: appColors.surface }}>
                {searched ? (
                    results.length === 0 ? (
                        <MobileEmpty
                            message={
                                paidTickets.length === 0
                                    ? "No closed sales on this date. Complete one from the register."
                                    : "Nothing on this date matches those criteria."
                            }
                        />
                    ) : (
                        <>
                            <MobileSectionHeading>
                                {results.length} {results.length === 1 ? "order" : "orders"} ·{" "}
                                {money(results.reduce((s, t) => s + ticketTotal(t), 0))}
                            </MobileSectionHeading>
                            {results.map((t) => (
                                <MobileRow
                                    key={t.id}
                                    title={`${t.number} · ${t.customer ?? t.name}`}
                                    subtitle={[
                                        t.tender,
                                        `${t.lines.length} items`,
                                        t.source,
                                        paymentNumberOf(t) && `Payment ${paymentNumberOf(t)}`,
                                    ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    price={ticketTotal(t)}
                                />
                            ))}
                        </>
                    )
                ) : (
                    <>
                        <MobileSectionHeading>Scope</MobileSectionHeading>
                        <MobileRow title={state.course} subtitle={state.facility} drills onClick={() => setSheet(true)} />

                        <Box sx={{ px: 1.5, pt: 1.5 }}>
                            <Stack direction="row">
                                <MobileSecondary onClick={() => toast("Every sale in this prototype is on July 29 2026.")}>
                                    <CalendarMonthIcon sx={{ fontSize: 18, mr: 1 }} />
                                    {DATE}
                                </MobileSecondary>
                            </Stack>
                        </Box>

                        <MobileSectionHeading>Search by</MobileSectionHeading>
                        <Stack sx={{ px: 1.5, pb: 2, gap: 1.25 }}>
                            <LookupField caption="Search by Order ID" placeholder="Enter Order ID" value={orderId} onChange={setOrderId} />
                            <LookupField
                                caption="Search by Payment ID"
                                placeholder="Enter Order Payment ID"
                                value={paymentId}
                                hint="Only the most recent sale carries one in this prototype."
                                onChange={setPaymentId}
                            />
                            <LookupField
                                caption="Search by Product"
                                placeholder="Start typing product name or SKU…"
                                value={product}
                                onChange={setProduct}
                            />
                            <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>
                                These are alternatives, not combining filters — leave all three blank for the whole day.
                            </Typography>
                        </Stack>
                    </>
                )}
            </Box>
        </MobileShell>
    );
};
