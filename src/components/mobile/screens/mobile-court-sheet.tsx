import { useState } from "react";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ReplayIcon from "@mui/icons-material/Replay";
import TodayIcon from "@mui/icons-material/Today";

import { buildCourtColumns } from "@/components/screens/pro-shop/court-sheet-grid";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileFilterTabs, MobileRow, MobileSectionHeading } from "../mobile-parts";
import { MobileActionArea, MobileAppBar, MobileBottomSheet, MobileScreen, MobileSecondary, MobileSecondaryRow } from "../mobile-shell";

/**
 * **Mobile Screens — 3-coursheet.** Laid out against `App Screens →
 * 3-coursheet`. There is no phone reference for this screen; it is extrapolated
 * from the four narrowing rules in the category overview.
 *
 * ## A resource grid does not narrow, so it stops being a grid
 *
 * The tablet sheet is **six facility columns × eighteen 20-minute slots**, read
 * across as much as down: *is anything free at 7:20?* is answered by scanning
 * one row. At 402px those six columns are 67px each — narrower than
 * `Pickleball Court 1` and narrower than a fingertip. Shrinking it produces a
 * grid nobody can hit; scrolling it sideways hides the columns you were
 * comparing, which is the only reason the grid existed.
 *
 * So the phone shows **one facility at a time**, chosen from a switcher, and
 * that facility's day as a time-ordered list. Each row is the slot the tablet
 * cell was — same 20-minute increments from 6:00 AM, same repeated start time,
 * same open/booked state.
 *
 * ## What that costs, plainly
 *
 * **Cross-facility comparison is gone.** *Which court is free at 7:20?* was one
 * glance on the tablet and is now up to six taps here. Nothing in a
 * single-column layout gives it back, and a six-across grid at this width would
 * be worse than not having it. If that question turns out to be the phone's
 * main job, the answer is a different screen — an availability list keyed by
 * time — not a smaller version of this one.
 *
 * **The pager is gone with it.** The tablet's bottom bar ends with `‹ 1 ›`
 * because more facilities exist than fit across one page. One facility at a
 * time has no pages, so the switcher replaces the pager outright.
 *
 * **The facility strip scrolls sideways when there are six.** That is a strip,
 * not a grid: it moves in one dimension, the selected tab is always in view, and
 * nothing is hidden behind it except more names of the same kind. It is still a
 * loss against seeing all six column headings at once.
 *
 * ## Two smaller moves
 *
 * **The date bar becomes a subtitle plus a sheet.** `DateNavBar` is four
 * buttons on one row — step back, the orange date, GO TO TODAY, step forward.
 * Four at 402px leaves the date ~180px and the two chevrons a mis-tap apart, so
 * the date moves into the app bar where a phone puts it, and the three ways of
 * changing it move into the overflow sheet with `Refresh`.
 *
 * **The action tray has nothing green in it.** The Court Sheet is a read-and-book
 * surface with no tender, so there is no primary to promote and the tray carries
 * three equal secondaries instead. A green button here would invent an
 * importance the screen does not have.
 */

/** The same fixture the tablet story builds: six facilities, 18 open slots. */
const columns = buildCourtColumns(18);

export interface MobileCourtSheetProps {
    /** Which facility's day is showing. Defaults to the first column. */
    facility?: string;
    drawerOpen?: boolean;
    /** Opens the day-navigation sheet the tablet's date bar became. */
    sheetOpen?: boolean;
}

export const MobileCourtSheet = ({ facility, drawerOpen = false, sheetOpen = false }: MobileCourtSheetProps) => {
    const [drawer, setDrawer] = useState(drawerOpen);
    const [sheet, setSheet] = useState(sheetOpen);
    const [active, setActive] = useState(facility ?? columns[0].name);

    const column = columns.find((c) => c.name === active) ?? columns[0];
    const open = column.slots.filter((s) => !s.booking).length;

    return (
        <MobileScreen
            appBar={
                <MobileAppBar
                    title="Court Sheet"
                    subtitle="Tuesday, May 12 2026"
                    leading="menu"
                    onLeading={() => setDrawer(true)}
                    onOverflow={() => setSheet(true)}
                />
            }
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary>Pro Shop</MobileSecondary>
                        <MobileSecondary>Tee Sheet</MobileSecondary>
                        <MobileSecondary>Refresh</MobileSecondary>
                    </MobileSecondaryRow>
                </MobileActionArea>
            }
            overlay={
                drawer ? (
                    <MobileNavDrawer active="courtsheet" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
                ) : sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={[
                            { label: "Previous day", icon: <ChevronLeftIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                            { label: "Go to today", icon: <TodayIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                            { label: "Next day", icon: <ChevronRightIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                            { label: "Pick a date", icon: <CalendarMonthIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                            { label: "Refresh", icon: <ReplayIcon sx={{ fontSize: 22 }} />, onClick: () => setSheet(false) },
                        ]}
                    />
                ) : undefined
            }
        >
            <MobileFilterTabs tabs={columns.map((c) => c.name)} active={active} onChange={setActive} />
            {/* The count the tablet never had to print, because six columns of
                white cells said it without words. One column cannot. */}
            <MobileSectionHeading>
                {open} of {column.slots.length} slots open
            </MobileSectionHeading>
            {column.slots.map((slot) => (
                <MobileRow
                    key={slot.time}
                    title={slot.time}
                    trailing={slot.booking ?? "Open"}
                    accent={slot.color}
                    dense
                    onClick={() => {}}
                />
            ))}
        </MobileScreen>
    );
};
