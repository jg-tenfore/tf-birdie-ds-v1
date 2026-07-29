import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotesIcon from "@mui/icons-material/Notes";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { TeeSheetActionBar, TeeSheetSubBar, sheetCanvas, type SheetView } from "./tee-sheet-chrome";
import type { TeeTimeDetail } from "./tee-sheet-data";
import { TeeTimeDetailBody, TeeTimeDetailTopRight } from "./tee-time-detail";

/**
 * # Tee Sheet — shared frames
 *
 * The busiest screen in the shipping app, reproduced as-is from
 * `references/072926/2-teesheet/`. It is where a pro shop attendant spends the
 * morning: one day of tee times for one course, with every booking, payment,
 * cart signout and no-show flowing through it.
 *
 * **What is on the screen, top to bottom**
 *
 * 1. The app bar — `Tee Sheet`, the account, LOG OUT, HIDE BACK, cart, overflow.
 * 2. A date-navigation band: prev / facility / **date in orange** / GO TO TODAY /
 *    next. Orange appears nowhere else in the app; it is the tee sheet's date and
 *    only that.
 * 3. A counts strip — Total, Booked, Paid, No Shows, Available — plus a live clock.
 * 4. The sheet itself, in one of four layouts.
 * 5. A bottom bar holding the course picker, the four layout toggles, refresh and PAY.
 *
 * **Four layouts of the same day**
 *
 * List, Grid, Multi and Back 9 are not filters. They re-render identical data,
 * and the colour language shifts between them — the single most surprising thing
 * about this screen. A booked reservation is purple in List and Back 9 but dark
 * navy in Grid and Multi; a paid one is green in List but slate-blue in Grid.
 * Blocked times are grey everywhere.
 *
 * The sheet's background is a mid grey rather than the app's usual light canvas,
 * which is what makes an empty white slot read as available from arm's length.
 *
 * All captures are the same day — **The Dunes of Delgado PROD, North Course,
 * Tuesday May 12 2026** — so the counts (Total 236 / Booked 50 / Paid 5 / No
 * Shows 0 / Available 186) are constant across every story.
 */

/**
 * The sheet body plus its own bottom bar.
 *
 * The bar is rendered here rather than through `AppShell`'s `actionBar` slot
 * because the tee sheet paints it on the same mid grey as the sheet, while every
 * other screen in the app uses the light canvas.
 */
export const SheetFrame = ({ view, children, courseMenu }: { view: SheetView; children: ReactNode; courseMenu?: ReactNode }) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: sheetCanvas }}>
        <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>{children}</Box>
        <TeeSheetActionBar view={view} courseMenu={courseMenu} />
    </Box>
);

export const TeeSheetScreen = ({ view, children, courseMenu }: { view: SheetView; children: ReactNode; courseMenu?: ReactNode }) => (
    <AppShell title="Tee Sheet" active="teesheet" topActions={["HIDE BACK"]} showCart subBar={<TeeSheetSubBar />}>
        <SheetFrame view={view} courseMenu={courseMenu}>
            {children}
        </SheetFrame>
    </AppShell>
);

/** The detail screen's bottom bar — the same five actions on every tee time. */
export const DetailActionBar = () => (
    <>
        <ActionButton icon={<CalendarMonthOutlinedIcon />}>Tee Sheet</ActionButton>
        <ActionButton icon={<StorefrontIcon />}>Pro Shop</ActionButton>
        <ActionButton icon={<AddIcon />}>Add all to cart</ActionButton>
        <ActionButton icon={<NotesIcon />}>Tee time notes</ActionButton>
        <ActionButton tone="disabled" icon={<ShoppingCartIcon />}>
            Pay
        </ActionButton>
    </>
);

export const TeeTimeDetailScreen = ({ detail }: { detail: TeeTimeDetail }) => (
    <AppShell title={detail.title} active="teesheet" topBarRight={<TeeTimeDetailTopRight />} actionBar={<DetailActionBar />}>
        <TeeTimeDetailBody detail={detail} />
    </AppShell>
);
