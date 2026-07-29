import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton } from "@/components/app-chrome/app-shell";
import type { ChartTable } from "./table-chart-canvas";
import { EdgeLabel } from "./tables-shared-parts";

/**
 * Chrome shared by the Table Chart stories.
 *
 * Screen context: Table Chart is the floor-plan editor. Managers pick a room
 * from the middle bottom-bar button, drag tokens to match the real floor, add
 * tables with NEW TABLE, then SAVE. The app bar drops the account cluster and
 * overflow entirely — NEW TABLE is the only top-bar action.
 */

export const newTableAction = <Typography sx={{ fontSize: 13, letterSpacing: "0.06em", color: "#fff" }}>NEW TABLE</Typography>;

export const detachedTokens: ChartTable[] = [
    { label: "Detached 27699", x: 96, y: 90 },
    { label: "Detached 58829", x: 241, y: 111 },
];

/** The room button renders its stored casing verbatim, hence `transform="none"`. */
export const ChartActionBar = ({ room, saveTone = "primary" }: { room: string; saveTone?: "primary" | "disabled" }) => (
    <>
        <ActionButton>
            <EdgeLabel icon={<ChevronLeftIcon sx={{ fontSize: 26 }} />}>Tables</EdgeLabel>
        </ActionButton>
        <ActionButton>
            <EdgeLabel transform="none">{room}</EdgeLabel>
        </ActionButton>
        <ActionButton tone={saveTone}>
            <EdgeLabel icon={<CheckIcon sx={{ fontSize: 30 }} />}>Save</EdgeLabel>
        </ActionButton>
    </>
);
