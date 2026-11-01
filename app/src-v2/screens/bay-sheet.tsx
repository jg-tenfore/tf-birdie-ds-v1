import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import ReplayIcon from "@mui/icons-material/Replay";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { BayWorkspace, noDialog, type BayDialogRoute } from "@/components/concepts/bay-sheet/103026/bay-workspace";
import { DAY_END, DAY_START, bays, fmtTime, usd } from "@/components/concepts/bay-sheet/103026/bay-data";
import { Shell } from "../pos-shell";
import { useActions } from "../store";

/**
 * **Bay Sheet — V2**, rebuilt against the Oct 30 PRD.
 *
 * V1's version of this screen is still in `app/src/screens/bay-sheet.tsx`,
 * untouched, so the two can be opened side by side. What changed:
 *
 * - **Eight bays** and a full 8am–10pm day, where V1 drew six over four hours.
 * - A reservation knows nine more things about itself — checked in, paid,
 *   whether a tab is open, its note, whether it repeats, whether it was
 *   cancelled or no-showed, which punch card paid for it, and whether booking
 *   it puts the golfer over their daily limit.
 * - Blank time is a target: tapping it opens the booking flow.
 * - Two guards, drawn differently on purpose — an overlap refuses, the daily
 *   limit warns and offers an override.
 * - Blocks, with the same repeat rules as reservations.
 *
 * The screen is a thin wrapper: every part of it is the same component the
 * **Bay Sheet Oct 30** category in Storybook documents, so the specification
 * and the running prototype cannot drift.
 */

/* ------------------------------------------------------ the dialog as a URL */

/**
 * **Every dialog has an address.**
 *
 * Nov 1, at Justin's request. A review that says *"open the details modal on
 * the standing Tuesday lesson"* is a sentence and three taps; this makes it a
 * link, which is the difference between a comment somebody can act on and one
 * they have to reconstruct.
 *
 * Times are `HHMM` on a 24-hour clock, because minutes-from-midnight is the
 * model's unit and nobody can read `780` as a quarter past one.
 *
 * | Link | What opens |
 * | --- | --- |
 * | `#/baysheet` | the sheet |
 * | `#/baysheet/book/teal/1100` | a new booking, Teal Bay at 11:00 AM |
 * | `#/baysheet/book/blue/1100?customer=c-6` | the same, with Jordan Blake already picked |
 * | `#/baysheet/reservation/r-7` | Justin's standing Tuesday lesson |
 * | `#/baysheet/newblock/green/1200` | a new block on Green Bay at noon |
 * | `#/baysheet/block/bl-1` | the league-night block |
 */

const pad = (value: number) => String(value).padStart(2, "0");

/** 780 → `1300`. */
export const clockOf = (minutes: number): string => `${pad(Math.floor(minutes / 60))}${pad(minutes % 60)}`;

/** `1300` → 780, and anything else → undefined so a bad link just shows the sheet. */
export const minutesOf = (clock: string): number | undefined => {
    const match = /^(\d{2})(\d{2})$/.exec(clock);
    if (!match) return undefined;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    return hours < 24 && minutes < 60 ? hours * 60 + minutes : undefined;
};

export const bayDialogPath = (route: BayDialogRoute): string => {
    switch (route.kind) {
        case "book":
            return `/baysheet/book/${route.bayId}/${clockOf(route.start)}${route.customerId ? `?customer=${route.customerId}` : ""}`;
        case "reservation":
            return `/baysheet/reservation/${route.id}`;
        case "newblock":
            return `/baysheet/newblock/${route.bayId}/${clockOf(route.start)}`;
        case "block":
            return `/baysheet/block/${route.id}`;
        default:
            return "/baysheet";
    }
};

export const parseBayDialog = (splat: string, search = ""): BayDialogRoute => {
    const [kind, first, second] = splat.split("/").filter(Boolean);
    const known = (bayId?: string) => bays.some((bay) => bay.id === bayId);

    if (kind === "reservation" && first) return { kind: "reservation", id: first };
    if (kind === "block" && first) return { kind: "block", id: first };

    if ((kind === "book" || kind === "newblock") && known(first)) {
        const start = minutesOf(second ?? "");
        if (start === undefined) return noDialog;

        return kind === "book"
            ? { kind: "book", bayId: first, start, customerId: new URLSearchParams(search).get("customer") ?? undefined }
            : { kind: "newblock", bayId: first, start };
    }

    return noDialog;
};

/* -------------------------------------------------------------- the screen */

export const BaySheetScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const { addItem } = useActions();

    const route = parseBayDialog(params["*"] ?? "", location.search);

    return (
        <Shell
            title="Bay Sheet"
            active="baysheet"
            showOverflow={false}
            actionBar={
                <>
                    <ActionButton icon={<StorefrontIcon />} onClick={() => navigate("/proshop")}>
                        Pro Shop
                    </ActionButton>
                    <ActionButton icon={<RestaurantIcon />} onClick={() => navigate("/tables")}>
                        Tables
                    </ActionButton>
                    <ActionButton icon={<ReplayIcon />}>Refresh</ActionButton>
                    <ActionButton
                        icon={<BlockIcon />}
                        onClick={() => navigate(bayDialogPath({ kind: "newblock", bayId: "red", start: 12 * 60 }))}
                    >
                        Add Block
                    </ActionButton>
                    <ActionButton
                        tone="primary"
                        icon={<AddIcon />}
                        onClick={() => navigate(bayDialogPath({ kind: "book", bayId: "red", start: 12 * 60 }))}
                    >
                        New Reservation
                    </ActionButton>
                </>
            }
        >
            <BayWorkspace
                /* The URL is the source of truth for which dialog is open, so
                   a link reproduces the screen and Back closes the dialog. */
                route={route}
                onRoute={(next) => navigate(bayDialogPath(next))}
                /*
                 * Requirement 30 — opening a tab puts the bay fee in the real
                 * order, so it can be settled at the register with whatever
                 * food and drink joined it. The sheet and the till are one
                 * system here, which is the point of running it as an app.
                 */
                onCharge={(reservation) =>
                    addItem(
                        {
                            id: `bay-${reservation.id}`,
                            name: `${reservation.customer.name} — ${fmtTime(reservation.start)} · ${reservation.fee.name}`,
                            price: reservation.fee.amount,
                        },
                        "Pro Shop",
                    )
                }
            />
        </Shell>
    );
};

/**
 * **What the phone build reads from here.**
 *
 * `app/src-v2/mobile/screens/bay-sheet.tsx` draws its own layout for 402px but
 * takes the bays and the day from this screen, so the two surfaces cannot
 * disagree about how many bays the course has or when it opens. They now come
 * from the Oct 30 model rather than from constants declared here — eight bays
 * and an 8am–10pm day, where V1 had six and four hours.
 */
export const BAYS = bays.map((bay) => bay.name);
export const START_HOUR = DAY_START / 60;
export const END_HOUR = DAY_END / 60;
export const fmt = fmtTime;

export { usd };
