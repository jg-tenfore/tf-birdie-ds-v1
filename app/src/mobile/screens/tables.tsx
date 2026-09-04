import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BoltIcon from "@mui/icons-material/Bolt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate } from "react-router-dom";

import { MobileBottomSheet } from "@/components/mobile/mobile-shell";
import { MobileEmpty, MobileFab, MobileRow, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { floorRoomOrder, statusFill, type FloorElement } from "@/components/screens/restaurant/floor-plan";
import { appColors } from "@/theme/app-replica-tokens";
import { money, totalOf, useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Restaurant Tables, on a phone — the live floor as a roster.
 *
 * ## The floor plan does not narrow, so it is not attempted
 *
 * The terminal draws this room on a 1280×760 canvas at 90% zoom, with tables
 * positioned where they actually stand and a zoom pill in the corner. That is a
 * **spatial** view: its whole value is that the screen matches the room. At
 * 402px the canvas would either scale to 31% — a 100px table becomes 31px,
 * under the 48dp touch floor — or crop, which hides the half of the room you
 * were not looking at.
 *
 * `mobile-table-chart.tsx` reaches the same conclusion for the editor and says
 * so out loud rather than shipping a squashed plan. The same rule applies here,
 * and this screen says it on the screen too.
 *
 * ## What the phone gets instead
 *
 * The same rooms and the same tables, **read out of the same `state.floorPlans`
 * the terminal renders**, as a list ordered by table number. That is more than
 * the Storybook `mobile-tables` extrapolation assumed possible — it wrote the
 * phone off as "you arrived with a table already in hand" because it had no
 * store to read. With one, choosing a table by name is a list, and a list
 * narrows fine.
 *
 * What is genuinely lost is *where* the table is. A runner who knows the room
 * can find `Table 4`; a runner who does not cannot be shown.
 *
 * | Terminal | Phone |
 * | :-- | :-- |
 * | Tables drawn in position on a 1280×760 canvas | One row per table, ordered by number |
 * | Warm fill for seated, cool for free | A status word and the open check's amount on the row |
 * | FLOOR PLAN button raising a 366px room panel | A `Room` row raising the same list as a bottom sheet |
 * | Zoom pill | Gone — there is nothing to zoom |
 *
 * ## Tapping a table does exactly what the terminal's tap does
 *
 * `openTable(label, seats, server)` then `/tabs/active`, with the label built
 * the same way — `Detached ${27600 + number + 99}` — so a check opened on the
 * phone and one opened on the counter are the same ticket with the same name,
 * and either device can pick the other's up.
 */

/** Server initials on the floor plan map to the names the breadcrumb prints. */
const SERVERS: Record<string, string> = {
    BT: "Kyler Brooksby",
    SC: "Sasha Cole",
    MR: "Maya Reyes",
    JL: "Jonah Lin",
    AK: "Amara Kaur",
};

/** The terminal's label rule, copied so both prototypes name a check alike. */
export const tableLabel = (el: FloorElement) => `Detached ${27600 + Number(el.num?.replace(/\D/g, "") ?? 0) + 99}`;

const STATUS_WORD: Record<string, string> = {
    empty: "Open",
    occupied: "Seated",
    reserved: "Reserved",
    cleaning: "Cleaning",
    blocked: "Blocked",
    "check-requested": "Check requested",
};

export const MobileTablesScreen = () => {
    const { state } = useStore();
    const { setFloorRoom, openTable } = useActions();
    const navigate = useNavigate();

    const [sheet, setSheet] = useState(false);
    const [overflow, setOverflow] = useState(false);

    const room = state.floorRoom;
    const tables = (state.floorPlans[room] ?? [])
        .filter((el) => el.kind === "table")
        .slice()
        // The canvas has no order; a list must have one, and the number is what
        // a runner is told.
        .sort((a, b) => Number(a.num ?? 0) - Number(b.num ?? 0));

    /** The open check on a table, if the store is holding one. */
    const checkFor = (el: FloorElement) =>
        state.tickets.find((t) => t.name === tableLabel(el) && t.status !== "paid" && t.status !== "voided");

    const open = (el: FloorElement) => {
        const server = el.party?.server ? (SERVERS[el.party.server] ?? el.party.server) : "Kyler Brooksby";
        openTable(tableLabel(el), el.seats ?? 4, server);
        // /tabs/active resolves to whatever the reducer just opened, so this
        // does not have to guess the new ticket's id.
        navigate("/tabs/active");
    };

    return (
        <MobileShell
            title="Tables"
            subtitle={room}
            active="tables"
            onOverflow={() => setOverflow(true)}
            fab={<MobileFab label="Quick Order" onClick={() => navigate("/quickorder")} />}
            overlay={
                sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={floorRoomOrder.map((r) => ({
                            label: `${r}${(state.floorPlans[r] ?? []).length === 0 ? " — empty" : ""}`,
                            onClick: () => {
                                setFloorRoom(r);
                                setSheet(false);
                            },
                        }))}
                    />
                ) : overflow ? (
                    <MobileBottomSheet
                        onDismiss={() => setOverflow(false)}
                        items={[
                            { label: "Tabs", icon: <CreditCardIcon sx={{ fontSize: 20 }} />, onClick: () => navigate("/tabs") },
                            { label: "Quick Order", icon: <BoltIcon sx={{ fontSize: 20 }} />, onClick: () => navigate("/quickorder") },
                            { label: "Table Chart", icon: <DashboardIcon sx={{ fontSize: 20 }} />, onClick: () => navigate("/tablechart") },
                        ]}
                    />
                ) : undefined
            }
        >
            <MobileRow title="Room" trailing={room} drills onClick={() => setSheet(true)} />

            <MobileSectionHeading>
                {tables.length === 0 ? "Tables" : `${tables.length} ${tables.length === 1 ? "table" : "tables"}`}
            </MobileSectionHeading>

            {tables.length === 0 ? (
                <MobileEmpty message={`${room} has no tables laid out. Set the room up on the terminal.`} />
            ) : (
                tables.map((el) => {
                    const check = checkFor(el);
                    const status = check ? "Seated" : (STATUS_WORD[el.status ?? "empty"] ?? "Open");
                    return (
                        <MobileRow
                            key={el.id}
                            title={`Table ${el.num ?? "—"}`}
                            subtitle={[
                                `${el.seats ?? 4} seats`,
                                status,
                                el.party?.server ? (SERVERS[el.party.server] ?? el.party.server) : null,
                            ]
                                .filter(Boolean)
                                .join(" · ")}
                            // The floor plan's own status fill, kept as a 4px
                            // leading bar — the one piece of the spatial view
                            // that survives at list width.
                            accent={check ? appColors.green : statusFill(el.status)}
                            trailing={check && check.lines.length > 0 ? money(totalOf(check.lines)) : undefined}
                            image={undefined}
                            onClick={() => open(el)}
                        />
                    );
                })
            )}

            {/* Said on the screen, not only in the docs — an operator who came
                looking for the floor plan should be told where it went. */}
            <Box sx={{ px: 1.5, py: 2 }}>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                    The room is drawn on the terminal. This device lists the tables in it and opens their checks; it does not show where
                    they stand.
                </Typography>
            </Box>

            <Box sx={{ height: 56 }} />
        </MobileShell>
    );
};
