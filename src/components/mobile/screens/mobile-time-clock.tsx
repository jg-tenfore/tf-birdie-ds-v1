import { useState } from "react";

import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

import type { TimeClockPunch, TimeClockState } from "@/components/screens/operations/time-clock-panel";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileEmpty, MobileRow, MobileSectionHeading } from "../mobile-parts";
import { MobileActionArea, MobileAppBar, MobilePrimary, MobileScreen, MobileSecondary, MobileSecondaryRow } from "../mobile-shell";

/**
 * **Mobile Screens — 13-timeclock.** Laid out against `App Screens → 13-timeclock`.
 *
 * Time Clock is the simplest screen in the app and the one whose landscape
 * layout is the most purely spatial: two 300×65 buttons parked at `pl: 173px,
 * pt: 239px` with a 79px gap between them, and a punch log occupying the right
 * 50% of the canvas. Neither coordinate survives a 402px screen — 173px of
 * left inset is 43% of the width, and a 300px button beside a 50% log needs
 * 600px minimum.
 *
 * ## What changed, and why
 *
 * **The two clock buttons move into the action tray.** On tablet they float on
 * the canvas because there is canvas to spare; the action bar is busy carrying
 * QUICK ORDER / PRO SHOP / TEE SHEET. Here the canvas belongs to the log, so
 * the buttons go where every other mobile screen puts its commit: pinned above
 * the nav bar, the live one as a full-width `MobilePrimary`, the dead one as a
 * disabled secondary directly above it.
 *
 * **The dead button is still drawn, still grey.** The tablet's defining
 * behaviour is that only one action is ever live and the other goes flat grey
 * rather than hiding — so the operator can see what the *other* punch would be.
 * That is preserved exactly: `disabled` + `tone="muted"`, which resolves to
 * `appColors.canvasAlt`, the mobile category's own grey.
 *
 * **CLOCK OUT keeps its red.** The tablet uses `#EE3124` (`appColors.clockOutRed`),
 * a brighter red than the app's `appColors.red`. `MobilePrimary` only offers
 * `tone="destructive"`, which is the standard red — the *only* difference
 * between the two screens, and taken deliberately rather than adding a tone to
 * a shared shell primitive for one screen.
 *
 * **The three nav buttons are gone.** QUICK ORDER, PRO SHOP and TEE SHEET are
 * pure navigation with no state of their own, and all three are already in the
 * drawer this screen opens with its hamburger. On tablet they earn their place
 * because the action bar would otherwise be empty; here that bar is spoken for
 * by the punch actions, and duplicating three drawer destinations into it would
 * push the actual commit off the bottom of the screen.
 *
 * **The log becomes a full-width list.** On tablet each punch is a 50%-width
 * band with the timestamp right-aligned against the midline and the type set
 * just after it — a two-column grid at `53% / 47%`. At 402px the type
 * (`Clock In` / `Clock Out`) is the value being scanned and the timestamp is
 * its qualifier, so they stack: type on line 1, timestamp on line 2.
 *
 * ## One thing that had to be added
 *
 * The tablet shows **no empty state** before the first punch — the log is
 * simply absent — and that is unremarkable there because the two clock buttons
 * still fill the middle of the canvas. Move those buttons into the action tray
 * and the same absence leaves the entire body blank between the app bar and the
 * buttons, which reads as a failed load rather than a fresh day. So the empty
 * state is drawn here and only here.
 */

export interface MobileTimeClockProps {
    state: TimeClockState;
    punches?: TimeClockPunch[];
    drawerOpen?: boolean;
}

export const MobileTimeClock = ({ state, punches = [], drawerOpen = false }: MobileTimeClockProps) => {
    const [drawer, setDrawer] = useState(drawerOpen);
    const clockedOut = state === "clocked-out";

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Time Clock" leading="menu" onLeading={() => setDrawer(true)} showOverflow={false} />}
            actions={
                <MobileActionArea>
                    {/* The dead punch, kept visible and grey exactly as the
                        tablet keeps it — it tells the operator which direction
                        the clock is currently pointing. */}
                    <MobileSecondaryRow>
                        <MobileSecondary tone="muted" disabled>
                            {clockedOut ? "Clock Out" : "Clock In"}
                        </MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary
                        tone={clockedOut ? "primary" : "destructive"}
                        icon={clockedOut ? <LoginIcon sx={{ fontSize: 20 }} /> : <LogoutIcon sx={{ fontSize: 20 }} />}
                    >
                        {clockedOut ? "Clock In" : "Clock Out"}
                    </MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                drawer ? (
                    <MobileNavDrawer active="timeclock" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
                ) : undefined
            }
        >
            {punches.length === 0 ? (
                <MobileEmpty message="No punches yet today." />
            ) : (
                <>
                    <MobileSectionHeading>Today&rsquo;s punches</MobileSectionHeading>
                    {punches.map((punch, i) => (
                        <MobileRow key={`${punch.timestamp}-${punch.type}-${i}`} title={punch.type} subtitle={punch.timestamp} />
                    ))}
                </>
            )}
        </MobileScreen>
    );
};
