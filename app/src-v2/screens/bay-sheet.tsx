import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import ReplayIcon from "@mui/icons-material/Replay";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { BayWorkspace } from "@/components/concepts/bay-sheet/103026/bay-workspace";
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
export const BaySheetScreen = () => {
    const navigate = useNavigate();
    const { addItem } = useActions();

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
                    <ActionButton icon={<BlockIcon />}>Add Block</ActionButton>
                    <ActionButton tone="primary" icon={<AddIcon />}>
                        New Reservation
                    </ActionButton>
                </>
            }
        >
            <BayWorkspace
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
