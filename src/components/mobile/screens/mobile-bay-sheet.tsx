import { useState } from "react";

import Box from "@mui/material/Box";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ReplayIcon from "@mui/icons-material/Replay";
import TodayIcon from "@mui/icons-material/Today";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

import { type BayBooking, bayNames, bayTimes } from "@/components/screens/pro-shop/bay-sheet-grid";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileFab, MobileFilterTabs, MobileRow, MobileSearch, MobileSectionHeading } from "../mobile-parts";
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
 * **Mobile Screens — 4-baysheet.** Laid out against `App Screens →
 * 4-baysheet`. No phone reference exists for this screen either; it is
 * extrapolated from the category's four rules.
 *
 * ## A calendar is a grid with a second axis you cannot drop
 *
 * The tablet Bay Sheet is a **true timeline**: a 72px half-hour gutter down the
 * left, six bay columns across, a rule at every half hour, and bookings drawn as
 * blocks whose *height is their duration*. Two things about it do not survive
 * 402px:
 *
 * 1. **Six columns beside a 72px gutter** leaves 55px a bay. A booking block
 *    55px wide cannot print `Red Bay` let alone a name and a fee.
 * 2. **Height-as-duration** stops reading when the column is 55px wide. A block
 *    three rows tall in a narrow strip looks like a mistake, not ninety minutes.
 *
 * ## The move: one bay at a time, and one tab that keeps the cross-bay question
 *
 * The switcher's first tab is **All bays**, and it is the important one. The
 * question this sheet is opened to answer is almost never *what is Red Bay
 * doing* — it is **what is free at 11:30**, which on the tablet is a glance down
 * one row. Dropping to one bay at a time would destroy that, so `All bays` keeps
 * it as a single column: one row per half hour, and how many of the six are free
 * on the right of it. Same axis, same increments, no grid.
 *
 * Picking a named bay then shows that bay's day, with the booking on the slot it
 * starts on.
 *
 * ## What the phone gives up
 *
 * - **Duration as a shape.** A 90-minute booking is a block three rows tall on
 *   the tablet and the word `90 min` here. The list can tell you a booking is
 *   long; it cannot show you the hole either side of it the way the grid does.
 * - **Which bay, at a glance.** `All bays` says *four of six are free at 11:30*.
 *   It does not say *which four* without a second tap. That is the honest limit
 *   of one column, and it is the right trade: the count answers the booking
 *   question, the tap answers the assignment question.
 * - **ZOOM OUT.** The tablet widens the visible time range because the grid is
 *   height-bound. A list is not — it scrolls — so the control has nothing left
 *   to do and moves into the overflow sheet rather than being drawn as a button
 *   that changes nothing visible.
 */

/** The tablet story's window: twelve half-hours from 10:00 AM. */
const times = bayTimes(12, 10);

/** No bookings, exactly as the tablet story ships it. Nothing is invented here. */
const bookings: BayBooking[] = [];

const ALL = "All bays";

export interface MobileBaySheetProps {
    /** `All bays` or one of `bayNames`. */
    bay?: string;
    drawerOpen?: boolean;
    sheetOpen?: boolean;
}

export const MobileBaySheet = ({ bay = ALL, drawerOpen = false, sheetOpen = false }: MobileBaySheetProps) => {
    const [drawer, setDrawer] = useState(drawerOpen);
    const [sheet, setSheet] = useState(sheetOpen);
    const [active, setActive] = useState(bay);

    const isAll = active === ALL;
    const bookedAt = (rowIndex: number, name?: string) =>
        bookings.filter((b) => b.startRow <= rowIndex && rowIndex < b.startRow + b.rows && (name === undefined || b.bay === name));

    return (
        <MobileScreen
            appBar={
                <MobileAppBar
                    title="Bay Sheet"
                    subtitle="Tuesday, May 12 2026"
                    leading="menu"
                    onLeading={() => setDrawer(true)}
                    onOverflow={() => setSheet(true)}
                />
            }
            fab={<MobileFab label="New Booking" />}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary>Pro Shop</MobileSecondary>
                        <MobileSecondary>Tables</MobileSecondary>
                        <MobileSecondary>Refresh</MobileSecondary>
                    </MobileSecondaryRow>
                </MobileActionArea>
            }
            overlay={
                drawer ? (
                    <MobileNavDrawer active="baysheet" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
                ) : sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={[
                            { label: "Previous day", icon: <ChevronLeftIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                            { label: "Go to today", icon: <TodayIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                            { label: "Next day", icon: <ChevronRightIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                            { label: "Pick a date", icon: <CalendarMonthIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                            { label: "Zoom out", icon: <ZoomOutIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                            { label: "Refresh", icon: <ReplayIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                        ]}
                    />
                ) : undefined
            }
        >
            <MobileFilterTabs tabs={[ALL, ...bayNames]} active={active} onChange={setActive} />
            <MobileSectionHeading>{isAll ? `${bayNames.length} bays · half-hour slots` : active}</MobileSectionHeading>
            {times.map((time, rowIndex) => {
                if (isAll) {
                    const taken = bookedAt(rowIndex).length;
                    return (
                        <MobileRow
                            key={time}
                            title={time}
                            trailing={`${bayNames.length - taken} of ${bayNames.length} open`}
                            dense
                            onClick={() => {}}
                        />
                    );
                }
                const booking = bookedAt(rowIndex, active).find((b) => b.startRow === rowIndex);
                return (
                    <MobileRow
                        key={time}
                        title={time}
                        subtitle={booking?.detail}
                        trailing={booking ? `${booking.name} · ${booking.rows * 30} min` : "Open"}
                        accent={booking?.color}
                        dense
                        onClick={() => {}}
                    />
                );
            })}
            {/* The floating pill sits over the body; the spacer stops it
                covering the last slot when the day runs long. */}
            <Box sx={{ height: 64 }} />
        </MobileScreen>
    );
};

/**
 * **MAKE A NEW RESERVATION**, as a screen rather than a panel.
 *
 * The tablet opens a near-full-bleed white panel over a dimmed sheet, with the
 * six values laid out three-across on two rows. Three-across is 134px a value at
 * this width, so the rows unfold into a single column — which is the category's
 * fourth rule and the only thing that ever works here.
 *
 * Two details worth naming:
 *
 * **The bare `-` / `+` steppers become tap-to-pick rows.** `- 90 +` needs three
 * targets beside a label; at 402px each would land under the 44dp floor and sit
 * a mis-tap apart. Party size, start time and duration therefore print their
 * value and open a picker, which is what a phone does with a bounded value
 * anyway. The 15-minute duration step lives inside that picker.
 *
 * **CANCEL becomes the ✕.** A full-width CANCEL above CREATE would be the
 * loudest control on a screen whose job is to create something, and the shell
 * already distinguishes `close` (abandon) from `back` (return). So the panel's
 * two-button footer becomes one green primary, and the app bar carries the
 * escape.
 */
export const MobileNewReservation = ({
    bay = "Red Bay",
    partySize = 1,
    fee = "Sim Hour",
    startAt = "11:30 AM",
    duration = 90,
    date = "Tuesday, May 12",
}: {
    bay?: string;
    partySize?: number;
    fee?: string;
    startAt?: string;
    duration?: number;
    date?: string;
}) => (
    <MobileScreen
        appBar={<MobileAppBar title="New Reservation" leading="close" showOverflow={false} />}
        actions={
            <MobileActionArea>
                <MobilePrimary>Create</MobilePrimary>
            </MobileActionArea>
        }
    >
        <MobileSectionHeading>Booking</MobileSectionHeading>
        {[
            { label: "Bay", value: bay },
            { label: "Party size", value: String(partySize) },
            { label: "Fee", value: fee },
            { label: "Start at", value: startAt },
            { label: "Duration", value: `${duration} min` },
            { label: "Date", value: date },
        ].map((row) => (
            <MobileRow key={row.label} title={row.label} trailing={row.value} drills dense onClick={() => {}} />
        ))}

        <MobileSectionHeading>Who it is for</MobileSectionHeading>
        {/* The panel's three fields carry a search glyph on the device — they
            look up an existing customer rather than only accepting text — so
            they stay search fields here. */}
        <MobileSearch placeholder="First Name" />
        <MobileSearch placeholder="Last Name" />
        <MobileSearch placeholder="Email" />
    </MobileScreen>
);
