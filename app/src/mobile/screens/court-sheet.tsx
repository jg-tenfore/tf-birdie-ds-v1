import { useState } from "react";

import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import { useNavigate } from "react-router-dom";

import { MobileFilterTabs, MobileRow, MobileSeatBand, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobileBottomSheet, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { COURTS, SLOTS, longDate } from "../../screens/court-sheet";
import { TODAY, useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Court Sheet, on a phone.
 *
 * ## What changed from the landscape screen, and why
 *
 * **Six columns became one, behind a switcher.** `CourtSheetScreen` draws
 * `COURTS.length` (6) columns of `SLOTS.length` (12) cards, each card 125px
 * tall, across a 1290px pane — 215px a column. At 402px the same six columns
 * are **67px each**, which is narrower than the string `Pickleball Court 1` and
 * narrower than a fingertip. So the phone shows **one facility at a time** from
 * `MobileFilterTabs`, and that facility's twelve 20-minute slots as a list.
 * Same `COURTS`, same `SLOTS`, same `state.resourceBookings` keys — this file
 * imports all three from the landscape screen rather than restating them, so
 * the two sheets cannot drift.
 *
 * **What that costs, said on the screen.** *Which court is free at 7:20?* was
 * one glance across a row on the tablet and is now up to six taps. Nothing in a
 * single column gives that back, so the heading prints the other facilities'
 * booked counts — a partial answer that at least says *where to look* — and the
 * caption under it says outright what the grid did that this does not.
 *
 * **The 4-button date bar became a subtitle plus a sheet.** `DateBar` is
 * `‹ | WEDNESDAY, JULY 29 2026 | GO TO TODAY | ›` across the full width; at
 * 402px the date alone needs ~180px and the two 190px chevrons collapse to a
 * mis-tap apart. The date moves to the app bar's subtitle and its three
 * controls move into the overflow sheet, wired to the same `shiftCourtDate` /
 * `setCourtDate` actions.
 *
 * **The orange band is drawn only when it means something.** The landscape date
 * bar is slate on today and orange otherwise. A permanent band would eat 30 of
 * the phone's 725dp canvas to say "this is today" — which the subtitle already
 * says — so the band appears *only* on a non-today sheet, where it is a warning
 * rather than a label.
 *
 * **The pager is gone.** `‹ 1 ›` exists because more facilities exist than fit
 * across one page. One facility at a time has no pages, so the switcher
 * replaces the pager outright rather than both being drawn.
 *
 * **The inert Refresh is gone too.** The landscape bar's third button does
 * nothing; at 402px three secondaries are 124px each and spending one of them
 * on a no-op is worse than having two live ones.
 */

/** Where a court booking lives in the store — the landscape screen's own key. */
export const courtKey = (date: string, court: string, slot: string) => `${date}|${court}|${slot}`;

export const MobileCourtSheetScreen = () => {
    const navigate = useNavigate();
    const { state } = useStore();
    const { setCourtDate, shiftCourtDate } = useActions();

    const [court, setCourt] = useState(COURTS[0]);
    const [sheet, setSheet] = useState(false);

    const isToday = state.courtDate === TODAY;
    const bookingFor = (name: string, slot: string) => state.resourceBookings[courtKey(state.courtDate, name, slot)];

    const open = SLOTS.filter((slot) => !bookingFor(court, slot)).length;

    // The one thing a single column cannot say. Printing the other facilities'
    // counts does not restore the row-scan, but it does say where to look.
    const elsewhere = COURTS.filter((c) => c !== court)
        .map((c) => ({ name: c, taken: SLOTS.filter((slot) => bookingFor(c, slot)).length }))
        .filter((c) => c.taken > 0);

    return (
        <MobileShell
            title="Court Sheet"
            subtitle={longDate(state.courtDate)}
            active="courtsheet"
            onOverflow={() => setSheet(true)}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary onClick={() => navigate("/proshop")}>Pro Shop</MobileSecondary>
                        <MobileSecondary onClick={() => navigate("/teesheet")}>Tee Sheet</MobileSecondary>
                    </MobileSecondaryRow>
                </MobileActionArea>
            }
            overlay={
                sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={[
                            {
                                label: "Previous day",
                                icon: <ChevronLeftIcon sx={{ fontSize: 22 }} />,
                                onClick: () => {
                                    shiftCourtDate(-1);
                                    setSheet(false);
                                },
                            },
                            {
                                label: "Go to today",
                                icon: <TodayIcon sx={{ fontSize: 22 }} />,
                                onClick: () => {
                                    setCourtDate(TODAY);
                                    setSheet(false);
                                },
                            },
                            {
                                label: "Next day",
                                icon: <ChevronRightIcon sx={{ fontSize: 22 }} />,
                                onClick: () => {
                                    shiftCourtDate(1);
                                    setSheet(false);
                                },
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            {/* Only when it is a warning. See the note at the top of the file. */}
            {!isToday && <MobileSeatBand label={`NOT TODAY — ${longDate(state.courtDate)}`} color={appColors.orange} />}

            <MobileFilterTabs tabs={COURTS} active={court} onChange={setCourt} />

            <MobileSectionHeading>
                {open} of {SLOTS.length} slots open
            </MobileSectionHeading>
            <Typography sx={{ px: 1.5, pb: 1, fontSize: 12, color: appColors.textSecondary }}>
                {elsewhere.length > 0
                    ? `Elsewhere: ${elsewhere.map((c) => `${c.name} ${c.taken}`).join(" · ")}. `
                    : "Nothing booked on the other five facilities. "}
                The tablet answers &ldquo;what is free at 7:20&rdquo; by reading across six columns; one column cannot, so that question is
                a tab per facility here.
            </Typography>

            {SLOTS.map((slot) => {
                const booked = bookingFor(court, slot);
                return (
                    <MobileRow
                        key={slot}
                        title={slot}
                        trailing={booked ?? "Open"}
                        accent={booked ? appColors.purple : undefined}
                        // Every slot is 64dp, booked or not. Sizing only the
                        // open ones made the list ragged — a column of times at
                        // two different heights reads as a rendering fault
                        // rather than as emphasis, and the booked rows are
                        // tappable too (that is how a booking gets cancelled).
                        tall
                        onClick={() => navigate(`/coursheet/${encodeURIComponent(court)}/${encodeURIComponent(slot)}`)}
                    />
                );
            })}
        </MobileShell>
    );
};
