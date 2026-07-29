import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * The Events picker.
 *
 * Two centred columns — event ID, event name — on 46px rows separated by
 * hairlines, from `references/072926/15-events/`. There is no search field, no
 * date filter and no sort control: the list is alphabetical by name and the
 * operator scrolls. Tapping a row opens that event's order screen.
 */

export interface EventListRow {
    id: string;
    name: string;
}

export const EventsListRow = ({ row, onSelect }: { row: EventListRow; onSelect?: () => void }) => (
    <Box
        role="button"
        tabIndex={0}
        onClick={onSelect}
        sx={{
            display: "flex",
            alignItems: "center",
            height: 46,
            bgcolor: appColors.surface,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
            cursor: "pointer",
        }}
    >
        <Typography sx={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: 15, color: appColors.textPrimary }} noWrap>
            {row.id}
        </Typography>
        <Typography sx={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: 15, color: appColors.textPrimary }} noWrap>
            {row.name}
        </Typography>
    </Box>
);

export const EventsList = ({ rows }: { rows: EventListRow[] }) => (
    <Box sx={{ bgcolor: appColors.surface, borderTop: "1px solid", borderColor: appColors.divider }}>
        {rows.map((row) => (
            <EventsListRow key={row.id} row={row} />
        ))}
    </Box>
);

/** Verbatim from the reference screenshot, in the order the app lists them. */
export const eventRows: EventListRow[] = [
    { id: "7379", name: "1 Trevor Event Test" },
    { id: "7186", name: "18 Hole Spring Ice Breaker Scramble" },
    { id: "5197", name: "1st Annual Tenfore Charity Golf Tournament" },
    { id: "5946", name: "2 Person Scramble Tournament" },
    { id: "7315", name: "2026 Member-Guest" },
    { id: "4042", name: "9 Hole Test Event" },
    { id: "2837", name: "A" },
    { id: "7370", name: "A Awesome Service Charge Test" },
    { id: "7372", name: "A Awesome Service Charge Test II (Electric Bugaloo)" },
    { id: "5091", name: "A booked Event for the Month Of June" },
    { id: "1733", name: "AAA Event" },
    { id: "5083", name: "AAA Super Event" },
    { id: "5869", name: "AC Test Event" },
    { id: "1804", name: "asdf" },
    { id: "2843", name: "asdfa" },
];

export default EventsList;
