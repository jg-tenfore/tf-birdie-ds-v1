import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

import { MobileEmpty, MobileRow, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Time Clock, on a phone.
 *
 * ## What changes from the terminal
 *
 * **The two punch buttons leave the canvas.** `TimeClockScreen` parks two
 * 357×80 buttons at `pl: 205px` with a 101px gap between them, beside a punch
 * log that owns the right 40% of the pane. At 402px, 205px of left inset is
 * half the screen and a 357px button plus a log needs ~760px. So both buttons
 * move into the action tray — the live one full width, the dead one as a
 * disabled secondary directly above it — which is where every other phone
 * screen in this prototype puts its commit.
 *
 * **The dead button is still drawn, still grey.** That is the terminal's
 * defining behaviour on this screen: only one punch is ever live and the other
 * goes flat grey rather than disappearing, so the pair never shifts under the
 * thumb. `tone="muted"` + `disabled` reproduces it with no new token.
 *
 * **CLOCK OUT loses its brighter red.** The terminal uses
 * `appColors.clockOutRed` (`#EE3124`); `MobilePrimary` offers only
 * `tone="destructive"`, which is the app's standard `#E53950`. Taken
 * deliberately rather than adding a tone to a shared shell primitive for one
 * screen — the same call the Storybook mobile version makes.
 *
 * **QUICK ORDER / PRO SHOP / TEE SHEET are gone.** Three pure-navigation
 * buttons that earn their place on the terminal only because its action bar
 * would otherwise be empty. All three are in this screen's own drawer, and here
 * the tray is spoken for by the punches.
 *
 * **An empty state had to be added.** The terminal draws nothing before the
 * first punch, which is unremarkable there because the two buttons still fill
 * the canvas. Move them into the tray and the same absence leaves 669px of
 * blank body, which reads as a failed load rather than a fresh day.
 *
 * ## What is live
 *
 * Everything. `clockToggle` is the same action the terminal dispatches, so a
 * punch made here is in `state.punches` and shows on the counter's log a second
 * later. The button flips because `state.clockedIn` flipped, not because a
 * local `useState` did.
 */

/** `MM/DD/YYYY h:MM AM` — the format the terminal's log uses, verbatim. */
const stamp = (d: Date) => {
    const hh = d.getHours() % 12 || 12;
    const mm = String(d.getMinutes()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mo}/${dd}/${d.getFullYear()} ${hh}:${mm} ${d.getHours() < 12 ? "AM" : "PM"}`;
};

export const MobileTimeClockScreen = () => {
    const { state } = useStore();
    const { clockToggle } = useActions();

    const clockedOut = !state.clockedIn;

    return (
        <MobileShell
            title="Time Clock"
            subtitle={state.operator?.name}
            active="timeclock"
            showOverflow={false}
            actions={
                <MobileActionArea>
                    {/* The punch that is not available, kept visible and grey —
                        it tells the operator which way the clock is pointing. */}
                    <MobileSecondaryRow>
                        <MobileSecondary tone="muted" disabled>
                            {clockedOut ? "Clock Out" : "Clock In"}
                        </MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary
                        tone={clockedOut ? "primary" : "destructive"}
                        icon={clockedOut ? <LoginIcon sx={{ fontSize: 20 }} /> : <LogoutIcon sx={{ fontSize: 20 }} />}
                        onClick={() => clockToggle(stamp(new Date()))}
                    >
                        {clockedOut ? "Clock In" : "Clock Out"}
                    </MobilePrimary>
                </MobileActionArea>
            }
        >
            {state.punches.length === 0 ? (
                <MobileEmpty message="No punches yet today. Clock in to start the shift." />
            ) : (
                <>
                    <MobileSectionHeading>Today&rsquo;s punches</MobileSectionHeading>
                    {/* The terminal's log is a 50%-width band with the timestamp
                        right-aligned against the midline and the type just after
                        it. At 402px the type is what is being scanned and the
                        timestamp qualifies it, so they stack. */}
                    {state.punches.map((punch, i) => (
                        <MobileRow key={`${punch.at}-${punch.kind}-${i}`} title={punch.kind} subtitle={punch.at} />
                    ))}
                </>
            )}
        </MobileShell>
    );
};
