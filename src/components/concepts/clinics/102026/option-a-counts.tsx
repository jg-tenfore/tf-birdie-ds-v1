import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import { ClinicCustomerSearch, SelectAllButton } from "@/components/screens/clinics/clinic-screens";
import { camp, clinicSummary, isNearlyFull, sessionDate, spotsLabel, usd, type SessionAvailability } from "./clinic-availability";

/**
 * **Option A — the counts, in place.**
 *
 * The smallest change that answers the complaint. Same two screens, same
 * controls, same order of operations; what changes is that **every number is
 * labelled and availability is on screen from the first tap**.
 *
 * - The clinic card stops printing a bare `10`. It says how many dates are
 *   open, how many places that adds up to, and when the next one is.
 * - Every session chip carries its own count — `3 spots left`, `1 spot left`,
 *   `Full` — so a counter can see what is nearly gone before a guest has
 *   chosen it.
 * - A full session loses its radio. Today it keeps one, which is an invitation
 *   to tap something that cannot be tapped.
 * - **The empty order panel is gone.** Weston: *"Remove the 'no items in order'
 *   shelf, not used."* The canvas it frees pays for the counts.
 * - A price line sits under the sessions, because today the first figure
 *   anybody sees arrives after SAVE.
 *
 * What it does not do: change the shape of the job. If that is what is wanted,
 * B and C are next door.
 */

/* ----------------------------------------------------------- the list */

export const ClinicCardA = ({ onOpen }: { onOpen?: () => void }) => {
    const summary = clinicSummary(camp.sessions);

    return (
        <Box
            onClick={onOpen}
            role={onOpen ? "button" : undefined}
            sx={{
                width: 420,
                bgcolor: appColors.surface,
                borderRadius: `${appRadius.card}px`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                px: 3,
                py: 2.5,
                cursor: onOpen ? "pointer" : "default",
            }}
        >
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: appColors.textPrimary }}>{camp.name}</Typography>
            <Typography sx={{ fontSize: 16, color: appColors.textSecondary, mt: 0.5 }}>
                {camp.category} · {summary.totalSessions} sessions · {usd(camp.sessions[0].price)} each
            </Typography>

            {/*
             * The number the card was missing. Two facts, because one is not
             * enough: how many dates can still take somebody, and how many
             * places that is in total. "2 of 10" would describe a session on a
             * card that stands for ten of them.
             */}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 2 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 500, color: appColors.greenDark }}>
                    {summary.openSessions} of {summary.totalSessions} dates open
                </Typography>
                <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>· {summary.spotsAcross} places in all</Typography>
            </Box>

            <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mt: 0.5 }}>
                Next: {sessionDate(summary.nextOpen)} — {spotsLabel(summary.nextOpen.spotsLeft)}
            </Typography>
        </Box>
    );
};

export const ClinicListA = ({ onOpen }: { onOpen?: () => void }) => (
    <Box sx={{ minHeight: "100%", bgcolor: appColors.canvas, p: 3 }}>
        <ClinicCardA onOpen={onOpen} />
    </Box>
);

/* -------------------------------------------------------- the sessions */

/**
 * A session chip that says what it holds.
 *
 * The date keeps the size it had; the count sits under it in the colour its
 * state earns — amber at two or fewer, grey when open, and a full session is
 * greyed with no radio at all.
 */
export const SessionChipA = ({
    session,
    selected,
    onToggle,
}: {
    session: SessionAvailability;
    selected?: boolean;
    onToggle?: () => void;
}) => {
    const full = session.spotsLeft === 0;

    return (
        <Box
            onClick={full ? undefined : onToggle}
            role={full ? undefined : "checkbox"}
            aria-checked={selected ?? false}
            aria-label={`${sessionDate(session)} — ${spotsLabel(session.spotsLeft)}`}
            aria-disabled={full}
            sx={{
                position: "relative",
                width: 156,
                minHeight: 88,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                px: 1.5,
                pt: 2.5,
                pb: 1.5,
                bgcolor: full ? appColors.canvas : appColors.surface,
                border: "1px solid",
                borderColor: selected ? appColors.green : appColors.divider,
                borderRadius: `${appRadius.card}px`,
                boxShadow: full ? "none" : "0 1px 2px rgba(0,0,0,0.12)",
                cursor: full ? "default" : "pointer",
            }}
        >
            {/*
             * The radio moves to the corner. On the shipping chip it is pinned
             * to the left edge and overlaps the first character of a two-line
             * date — the smallest of the complaints, and the cheapest to fix.
             *
             * A full session has no radio at all: there is nothing to choose.
             */}
            {!full &&
                (selected ? (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 20,
                            height: 20,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "50%",
                            bgcolor: appColors.green,
                        }}
                    >
                        <CheckIcon sx={{ fontSize: 14, color: "#fff" }} />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: "1px solid",
                            borderColor: appColors.textSecondary,
                        }}
                    />
                ))}

            <Typography
                sx={{
                    fontSize: 17,
                    lineHeight: 1.2,
                    textAlign: "center",
                    color: full ? appColors.textDisabled : appColors.textPrimary,
                }}
            >
                {sessionDate(session)}
            </Typography>

            <Typography
                sx={{
                    fontSize: 14,
                    color: full ? appColors.textDisabled : isNearlyFull(session.spotsLeft) ? "#A9661F" : appColors.textSecondary,
                }}
            >
                {spotsLabel(session.spotsLeft)}
            </Typography>
        </Box>
    );
};

/**
 * The session screen, full width.
 *
 * Losing the order panel gives the chips room to carry a second line each and
 * still sit five to a row, and lifts the customer search above the fold — on
 * the device it starts below it.
 */
export const ClinicSessionsA = ({
    selected = [],
    onToggle,
    onSelectAll,
}: {
    selected?: string[];
    onToggle?: (label: string) => void;
    onSelectAll?: () => void;
}) => {
    const chosen = camp.sessions.filter((session) => selected.includes(session.label));
    const total = chosen.reduce((sum, session) => sum + session.price, 0);

    return (
        <Box sx={{ minHeight: "100%", bgcolor: appColors.canvas, px: 3, py: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                <SelectAllButton onClick={onSelectAll} />
                <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>
                    {clinicSummary(camp.sessions).openSessions} of {camp.sessions.length} dates open
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, maxWidth: 1180 }}>
                {camp.sessions.map((session) => (
                    <SessionChipA
                        key={session.label}
                        session={session}
                        selected={selected.includes(session.label)}
                        onToggle={() => onToggle?.(session.label)}
                    />
                ))}
            </Box>

            {/*
             * Money, before SAVE rather than after it. The shipping screen
             * shows no price anywhere, so the first figure a guest hears is
             * the one the counter reads off the order panel on the next
             * screen.
             */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 1,
                    minHeight: touchTarget.min,
                    mt: 2.5,
                    px: 1,
                }}
            >
                <Typography sx={{ fontSize: 18, fontWeight: 500, color: appColors.textPrimary }}>
                    {chosen.length} {chosen.length === 1 ? "session" : "sessions"} · {usd(total)}
                </Typography>
                {chosen.length === 0 && (
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Choose the dates to book</Typography>
                )}
            </Box>

            <Box sx={{ mt: 3 }}>
                <ClinicCustomerSearch />
            </Box>
        </Box>
    );
};

export default ClinicSessionsA;
