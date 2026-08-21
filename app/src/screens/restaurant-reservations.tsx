import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";

/**
 * Restaurant Reservations, from `references/072926/8-reservations/`.
 *
 * A single day of covers: a slate date band, a six-column header, and the rows
 * under it. The date band is the only way to change day and it is not a
 * dropdown — it opens the picker.
 *
 * The reference captures the empty state, which is a centred antler mark over
 * "No reservations for this date." The seeded day below is this prototype's own,
 * so the table has something in it; clearing it out returns the empty state.
 *
 * Worth noting for the redesign: there is nothing here about tables. A
 * reservation carries a party size and a contact but no table assignment, so
 * seating is entirely a matter of the host remembering.
 */

interface Reservation {
    time: string;
    party: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

const COLUMNS = ["Time", "Party", "First Name", "Last Name", "Email", "Phone"];

/** A plausible Wednesday service. Not from the device — the capture was empty. */
const RESERVATIONS: Reservation[] = [
    {
        time: "11:30 AM",
        party: 2,
        firstName: "Weston",
        lastName: "Farnsworth",
        email: "weston.farnsworth@tenfore.golf",
        phone: "8017084153",
    },
    { time: "12:00 PM", party: 4, firstName: "Tony", lastName: "Finau", email: "weston+tony@tenfore.golf", phone: "8017084153" },
    { time: "12:15 PM", party: 6, firstName: "Marissa", lastName: "Chen", email: "m.chen@example.com", phone: "3015540199" },
    {
        time: "1:00 PM",
        party: 2,
        firstName: "Randy",
        lastName: "Orton",
        email: "weston.farnsworth+randy@tenfore.golf",
        phone: "8015962658",
    },
    { time: "1:45 PM", party: 8, firstName: "Delgado", lastName: "Men's League", email: "league@dunesofdelgado.golf", phone: "3015540100" },
    {
        time: "5:30 PM",
        party: 2,
        firstName: "Tom",
        lastName: "Watson",
        email: "weston.farnsworth+tomwatson@tenfore.golf",
        phone: "8015962658",
    },
    { time: "6:00 PM", party: 4, firstName: "Priya", lastName: "Raman", email: "p.raman@example.com", phone: "2404410872" },
    { time: "6:30 PM", party: 3, firstName: "Oda", lastName: "Brennevin", email: "oda.b@example.com", phone: "3015547781" },
    { time: "7:15 PM", party: 10, firstName: "Sandhill", lastName: "Outing", email: "events@sandhill.golf", phone: "3015540144" },
    { time: "8:00 PM", party: 2, firstName: "Chris", lastName: "Moreno", email: "c.moreno@example.com", phone: "2404418890" },
];

const cell = { flex: 1, minWidth: 0, textAlign: "center" as const, px: 1 };

export const RestaurantReservationsScreen = () => {
    const navigate = useNavigate();
    const rows = RESERVATIONS;

    return (
        <Shell
            title="Restaurant Reservations"
            active="reservations"
            topActions={["Add reservation"]}
            showCart={false}
            showOverflow={false}
            subBar={
                <Box sx={{ flexShrink: 0, bgcolor: appColors.surface, p: 1 }}>
                    <Box
                        role="button"
                        tabIndex={0}
                        sx={{
                            bgcolor: appColors.slate,
                            color: "#fff",
                            borderRadius: `${appRadius.button}px`,
                            textAlign: "center",
                            py: 2.25,
                            fontSize: 15,
                            letterSpacing: "0.09em",
                            cursor: "pointer",
                        }}
                    >
                        WEDNESDAY, JULY 29 2026
                    </Box>
                </Box>
            }
            actionBar={
                <ActionButton grow={1} icon={<ArrowBackIosNewIcon />} onClick={() => navigate(-1)}>
                    Back
                </ActionButton>
            }
        >
            <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%" }}>
                {/* The header band sits outside the scroll area on the device, so it
                    is drawn even when there is nothing under it. */}
                <Stack direction="row" sx={{ height: 56, alignItems: "center", bgcolor: "#9A9A9A" }}>
                    {COLUMNS.map((c) => (
                        <Typography key={c} sx={{ ...cell, fontSize: 17, color: appColors.textPrimary }}>
                            {c}
                        </Typography>
                    ))}
                </Stack>

                {rows.length === 0 ? (
                    <Box sx={{ py: 8 }}>
                        <OrderPanelEmpty message="No reservations for this date." />
                    </Box>
                ) : (
                    rows.map((r) => (
                        <Stack
                            key={`${r.time}-${r.lastName}`}
                            direction="row"
                            sx={{
                                minHeight: 64,
                                alignItems: "center",
                                bgcolor: appColors.surface,
                                borderBottom: `1px solid ${appColors.divider}`,
                            }}
                        >
                            <Typography sx={{ ...cell, fontSize: 16 }}>{r.time}</Typography>
                            <Typography sx={{ ...cell, fontSize: 16 }}>{r.party}</Typography>
                            <Typography sx={{ ...cell, fontSize: 16 }}>{r.firstName}</Typography>
                            <Typography sx={{ ...cell, fontSize: 16 }}>{r.lastName}</Typography>
                            <Typography sx={{ ...cell, fontSize: 16 }} noWrap>
                                {r.email}
                            </Typography>
                            <Typography sx={{ ...cell, fontSize: 16 }}>{r.phone}</Typography>
                        </Stack>
                    ))
                )}
            </Box>
        </Shell>
    );
};
