import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate, useParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { EventsListRow, eventRows } from "@/components/screens/operations/events-list";
import { EventCategoryGrid, EventOrderLineRow, eventOrderLines } from "@/components/screens/operations/events-order";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money } from "../store";

/**
 * Events, from `references/072926/15-events/`.
 *
 * The list is two centred columns — ID and name — sorted by name, so numeric
 * names and test rows come first. It has **no bottom action bar at all**, which
 * makes the app bar's overflow menu the only way to do anything other than open
 * an event.
 *
 * Opening one lands on the event's expense ledger: everything charged to the
 * event on the left, and the full category catalogue on the right so more can be
 * added. The event name replaces the screen title, so there is no longer any
 * label saying you are inside Events.
 *
 * The quantity badge on a ledger line is a dark corner chip, not the green
 * left-edge strip the register's order panel uses for the same idea.
 */

export const EventsScreen = () => {
    const navigate = useNavigate();

    return (
        <Shell title="Events" active="events" topBarRight={null} showOverflow>
            <Box sx={{ bgcolor: appColors.surface, borderTop: `1px solid ${appColors.divider}` }}>
                {eventRows.map((row) => (
                    <EventsListRow key={row.id} row={row} onSelect={() => navigate(`/events/${row.id}`)} />
                ))}
            </Box>
        </Shell>
    );
};

export const EventDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const event = eventRows.find((r) => r.id === id);
    const lines = eventOrderLines;

    // The ledger total is not shown on the device — ADD PAYMENT carries no
    // amount — but it is worth having here to make the screen answer the
    // question the operator actually has.
    const charged = lines.reduce((sum, l) => sum + Number(l.price.replace(/[^0-9.]/g, "")), 0);

    return (
        <Shell
            title={event?.name ?? "Event"}
            active="events"
            topBarRight={null}
            orderPanel={
                <Box sx={{ flex: 1, overflowY: "auto", bgcolor: appColors.surface }}>
                    {lines.map((line) => (
                        <EventOrderLineRow key={line.id} line={line} />
                    ))}
                </Box>
            }
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate("/events")}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<AddIcon />} tone="primary" grow={2} onClick={() => navigate("/pay")}>
                        Add payment
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ p: 2 }}>
                <Stack direction="row" sx={{ justifyContent: "flex-end", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Charged to this event</Typography>
                    <Typography sx={{ fontSize: 20 }}>{money(charged)}</Typography>
                </Stack>
                <EventCategoryGrid />
            </Box>
        </Shell>
    );
};
