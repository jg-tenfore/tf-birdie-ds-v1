import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import { camp, clinicSummary, isNearlyFull, sessionDate, spotsLabel, usd, type SessionAvailability } from "./clinic-availability";
import { ClinicStepper } from "./clinic-stepper";

/**
 * **Option C — the guest, first.**
 *
 * The furthest of the three, and the only one that changes the order of the
 * job. Today a counter picks dates and then goes looking for the guest, which
 * is backwards twice over: the guest is standing there, and **nothing can be
 * checked against a roster until the app knows who is being booked.**
 *
 * So: guest first, dates second, with the booking building in a rail on the
 * right as it goes.
 *
 * - **Step 1 is one search field**, not six. The six on the shipping screen are
 *   all ways of finding the same person; this is one field that takes any of
 *   them, with *Add new guest* beside it.
 * - **Step 2 knows who it is for.** A date the guest already holds says so and
 *   cannot be double-booked — the one availability check the current design
 *   cannot make, since it never knows the guest in time.
 * - **The rail is the receipt before the receipt**: the guest, each date,
 *   each price, the total. The shipping flow shows the first figure after SAVE;
 *   here it is never not on screen.
 * - The action bar commits with the amount on it — *Add to order $67.41* —
 *   rather than a bare SAVE.
 *
 * **The two questions are two steps**, named in a bar at the top — *1 Guest*,
 * then *2 Dates* — the same stepper B uses, run in the other order. Keeping the
 * guest first is what buys the clash check; everything else about the two
 * options' chrome matches so they can be compared fairly.
 *
 * The cost: it is a bigger build than A or B, and it asks the counter to answer
 * "who" before "when", which is a change of habit. Worth it only if the roster
 * check at the end is the thing actually hurting.
 */

const GUEST = { name: "Avery Nguyen", detail: "avery.nguyen@email.com · (801) 555-0148" };
/** A date this guest already holds — the clash the shipping flow cannot see. */
const ALREADY_BOOKED = "10/8/26 2:00 PM";

/* --------------------------------------------------------------- step 1 */

export const GuestStep = ({ guest = GUEST }: { guest?: { name: string; detail: string } | null }) => (
    <Box>
        <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1 }}>1 · WHO IS THIS FOR</Typography>

        {guest ? (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minHeight: 64,
                    px: 2,
                    bgcolor: appColors.surface,
                    border: "1px solid",
                    borderColor: appColors.green,
                    borderRadius: `${appRadius.card}px`,
                }}
            >
                <Box sx={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: appColors.canvas }}>
                    <PersonIcon sx={{ color: appColors.textSecondary }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{guest.name}</Typography>
                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{guest.detail}</Typography>
                </Box>
                <Typography sx={{ fontSize: 15, color: appColors.greenDark }}>Change</Typography>
            </Box>
        ) : (
            <Box sx={{ display: "flex", gap: 1.5 }}>
                {/* One field, not six: every one of the shipping screen's inputs
                    is a different way of naming the same person. */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        minHeight: 64,
                        px: 2,
                        bgcolor: appColors.fieldFill,
                        borderBottom: "1px solid rgba(0,0,0,0.42)",
                        borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
                    }}
                >
                    <SearchIcon sx={{ color: appColors.textSecondary }} />
                    <Typography sx={{ fontSize: 18, color: appColors.textSecondary }}>Search name, email, phone or member ID</Typography>
                </Box>
                <Box
                    sx={{
                        display: "grid",
                        placeItems: "center",
                        minWidth: 200,
                        px: 2,
                        bgcolor: appColors.slate,
                        borderRadius: `${appRadius.button}px`,
                    }}
                >
                    <Typography sx={{ fontSize: 15, letterSpacing: "0.06em", color: "#fff" }}>ADD NEW GUEST</Typography>
                </Box>
            </Box>
        )}
    </Box>
);

/* --------------------------------------------------------------- step 2 */

const DateCard = ({ session, selected, onToggle }: { session: SessionAvailability; selected?: boolean; onToggle?: () => void }) => {
    const full = session.spotsLeft === 0;
    const booked = session.label === ALREADY_BOOKED;
    const blocked = full || booked;

    return (
        <Box
            onClick={blocked ? undefined : onToggle}
            role={blocked ? undefined : "checkbox"}
            aria-checked={selected ?? false}
            aria-label={`${sessionDate(session)} — ${booked ? "already booked" : spotsLabel(session.spotsLeft)}`}
            aria-disabled={blocked}
            sx={{
                position: "relative",
                width: 176,
                minHeight: 96,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 0.5,
                px: 2,
                py: 1.5,
                bgcolor: blocked ? appColors.canvas : selected ? "#F3F7F4" : appColors.surface,
                border: "1px solid",
                borderColor: selected ? appColors.green : appColors.divider,
                borderRadius: `${appRadius.card}px`,
                cursor: blocked ? "default" : "pointer",
            }}
        >
            {selected && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 22,
                        height: 22,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "50%",
                        bgcolor: appColors.green,
                    }}
                >
                    <CheckIcon sx={{ fontSize: 15, color: "#fff" }} />
                </Box>
            )}

            <Typography sx={{ fontSize: 17, color: blocked ? appColors.textDisabled : appColors.textPrimary }}>
                {sessionDate(session).split(" ")[0]}
            </Typography>
            <Typography sx={{ fontSize: 15, color: blocked ? appColors.textDisabled : appColors.textSecondary }}>
                {sessionDate(session).split(" ").slice(1).join(" ")}
            </Typography>

            {/*
             * The check only this version can make: the guest is known before
             * the dates are, so a clash is caught here instead of at the till.
             */}
            <Typography
                sx={{
                    fontSize: 14,
                    color: booked
                        ? appColors.greenDark
                        : full
                          ? appColors.textDisabled
                          : isNearlyFull(session.spotsLeft)
                            ? "#A9661F"
                            : appColors.textSecondary,
                }}
            >
                {booked ? "Already booked" : spotsLabel(session.spotsLeft)}
            </Typography>
        </Box>
    );
};

/* ---------------------------------------------------------- the screen */

export const ClinicBookingC = ({
    guest = GUEST,
    selected = [],
    step = 1,
    onToggle,
    onStep,
}: {
    guest?: { name: string; detail: string } | null;
    selected?: string[];
    /** 0 = the guest, 1 = the dates. The guest comes first here, by design. */
    step?: number;
    onToggle?: (label: string) => void;
    onStep?: (index: number) => void;
}) => {
    const chosen = camp.sessions.filter((session) => selected.includes(session.label));
    const total = chosen.reduce((sum, session) => sum + session.price, 0);
    const summary = clinicSummary(camp.sessions);

    return (
        <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            <ClinicStepper
                steps={[
                    { label: "Guest", hint: guest ? guest.name : "Nobody chosen yet" },
                    { label: "Dates", hint: chosen.length ? `${chosen.length} chosen · ${usd(total)}` : "None chosen yet" },
                ]}
                current={step}
                onStep={onStep}
            />

            <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
                <Box sx={{ flex: 1, minWidth: 0, px: 3, py: 3 }}>
                    {step === 0 ? (
                        <GuestStep guest={guest} />
                    ) : (
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 1 }}>
                                <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary }}>
                                    WHICH DATES
                                </Typography>
                                <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                                    {summary.openSessions} of {camp.sessions.length} open · {usd(camp.sessions[0].price)} each
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                                {camp.sessions.map((session) => (
                                    <DateCard
                                        key={session.label}
                                        session={session}
                                        selected={selected.includes(session.label)}
                                        onToggle={() => onToggle?.(session.label)}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* The booking, built as it is made. */}
                <Box
                    sx={{
                        width: 360,
                        flexShrink: 0,
                        bgcolor: appColors.surface,
                        borderLeft: "1px solid",
                        borderColor: appColors.divider,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: appColors.divider }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 500, color: appColors.textPrimary }}>{camp.name}</Typography>
                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                            {guest ? guest.name : "No guest chosen yet"}
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                        {chosen.length === 0 ? (
                            <Typography sx={{ px: 2.5, py: 2, fontSize: 15, color: appColors.textSecondary }}>
                                {step === 0 ? "Find the guest, then pick their dates." : "Pick the dates on the left and they appear here."}
                            </Typography>
                        ) : (
                            chosen.map((session) => (
                                <Box
                                    key={session.label}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        minHeight: touchTarget.min,
                                        px: 2.5,
                                        borderBottom: "1px solid",
                                        borderColor: appColors.divider,
                                    }}
                                >
                                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{sessionDate(session)}</Typography>
                                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{usd(session.price)}</Typography>
                                </Box>
                            ))
                        )}
                    </Box>

                    <Box sx={{ px: 2.5, py: 2, bgcolor: appColors.canvas, borderTop: "1px solid", borderColor: appColors.divider }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>
                                {chosen.length} {chosen.length === 1 ? "session" : "sessions"}
                            </Typography>
                            <Typography sx={{ fontSize: 22, fontWeight: 500, color: appColors.textPrimary }}>{usd(total)}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ClinicBookingC;
