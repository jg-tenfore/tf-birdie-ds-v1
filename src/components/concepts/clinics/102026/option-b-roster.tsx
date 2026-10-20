import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { ClinicCustomerSearch } from "@/components/screens/clinics/clinic-screens";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import { camp, clinicSummary, isNearlyFull, sessionDate, spotsLabel, usd, type SessionAvailability } from "./clinic-availability";
import { ClinicStepper } from "./clinic-stepper";

/**
 * **Option B — the roster, first.**
 *
 * A clinic is a roster with dates attached, so this version leads with how full
 * it is and turns the dates into **rows rather than chips**.
 *
 * A row holds what a chip cannot: the date, the day of the week, the start
 * time, how many places are left, a small meter showing how full that session
 * is, and its price. Ten chips of plain text are hard to compare; ten rows in
 * columns are read down.
 *
 * - The clinic header carries a fill bar — *23 of 100 places taken across 10
 *   dates* — so the shape of the clinic is visible before any date is chosen.
 * - **Nearly-full sessions are the ones that matter** and the amber count finds
 *   them down a column.
 * - A full row stays in place, greyed, with its checkbox gone and `Full` where
 *   its count was.
 * - The running total sits in a summary bar above the action bar, so money is
 *   on screen while dates are being chosen.
 * - No order panel, as Weston asked.
 *
 * **The guest is a second step, not a second half.** The shipping screen stacks
 * the dates and a bank of name fields on one canvas with no heading between
 * them; here a stepper names both questions and asks them one at a time —
 * *1 Dates*, then *2 Guest*. Going back is a tap on a finished step.
 *
 * The cost: rows take more height than chips, so a ten-session clinic fills the
 * screen and a twenty-session one scrolls, and the guest is now a page turn
 * away. Option A stays denser and flatter.
 */

/* ----------------------------------------------------------- the list */

/** A fill bar. Grey track, green fill, amber once a clinic is nearly full. */
const FillBar = ({ taken, capacity }: { taken: number; capacity: number }) => {
    const share = Math.min(1, taken / capacity);

    return (
        <Box sx={{ width: "100%", height: 8, bgcolor: appColors.divider, borderRadius: 4, overflow: "hidden" }}>
            <Box sx={{ width: `${share * 100}%`, height: "100%", bgcolor: share >= 0.8 ? appColors.orange : appColors.green }} />
        </Box>
    );
};

export const ClinicCardB = ({ onOpen }: { onOpen?: () => void }) => {
    const summary = clinicSummary(camp.sessions);
    const places = camp.sessions.length * camp.capacity;
    const taken = places - summary.spotsAcross;

    return (
        <Box
            onClick={onOpen}
            role={onOpen ? "button" : undefined}
            sx={{
                width: 480,
                bgcolor: appColors.surface,
                borderRadius: `${appRadius.card}px`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                px: 3,
                py: 2.5,
                cursor: onOpen ? "pointer" : "default",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: appColors.textPrimary }}>{camp.name}</Typography>
                <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{usd(camp.sessions[0].price)} / session</Typography>
            </Box>

            <Typography sx={{ fontSize: 16, color: appColors.textSecondary, mt: 0.5, mb: 2 }}>
                {camp.category} · {camp.capacity} per session · {camp.sessions.length} dates
            </Typography>

            <FillBar taken={taken} capacity={places} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                    {taken} of {places} places taken
                </Typography>
                <Typography sx={{ fontSize: 15, color: appColors.greenDark }}>{summary.openSessions} dates still open</Typography>
            </Box>
        </Box>
    );
};

export const ClinicListB = ({ onOpen }: { onOpen?: () => void }) => (
    <Box sx={{ minHeight: "100%", bgcolor: appColors.canvas, p: 3 }}>
        <ClinicCardB onOpen={onOpen} />
    </Box>
);

/* -------------------------------------------------------- the sessions */

const COLUMNS = { date: 220, day: 120, spots: 180, price: 110 } as const;

const SessionRow = ({ session, selected, onToggle }: { session: SessionAvailability; selected?: boolean; onToggle?: () => void }) => {
    const full = session.spotsLeft === 0;
    const [date, ...time] = sessionDate(session).split(" ");

    return (
        <Box
            onClick={full ? undefined : onToggle}
            role={full ? undefined : "checkbox"}
            aria-checked={selected ?? false}
            aria-label={`${sessionDate(session)} — ${spotsLabel(session.spotsLeft)}`}
            aria-disabled={full}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minHeight: touchTarget.comfortable,
                px: 2,
                bgcolor: full ? appColors.canvas : selected ? "#F3F7F4" : appColors.surface,
                borderBottom: "1px solid",
                borderColor: appColors.divider,
                cursor: full ? "default" : "pointer",
            }}
        >
            <Box sx={{ width: 28, display: "grid", placeItems: "center" }}>
                {full ? null : selected ? (
                    <Box
                        sx={{ width: 22, height: 22, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: appColors.green }}
                    >
                        <CheckIcon sx={{ fontSize: 15, color: "#fff" }} />
                    </Box>
                ) : (
                    <Box sx={{ width: 20, height: 20, borderRadius: 1, border: "2px solid", borderColor: appColors.textSecondary }} />
                )}
            </Box>

            <Typography sx={{ width: COLUMNS.date, fontSize: 17, color: full ? appColors.textDisabled : appColors.textPrimary }}>
                {date}
            </Typography>
            <Typography sx={{ width: COLUMNS.day, fontSize: 17, color: full ? appColors.textDisabled : appColors.textSecondary }}>
                {time.join(" ")}
            </Typography>

            <Box sx={{ width: COLUMNS.spots, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 64 }}>
                    <FillBar taken={session.capacity - session.spotsLeft} capacity={session.capacity} />
                </Box>
                <Typography
                    sx={{
                        fontSize: 15,
                        color: full ? appColors.textDisabled : isNearlyFull(session.spotsLeft) ? "#A9661F" : appColors.textSecondary,
                    }}
                >
                    {spotsLabel(session.spotsLeft)}
                </Typography>
            </Box>

            <Typography
                sx={{
                    width: COLUMNS.price,
                    textAlign: "right",
                    fontSize: 17,
                    color: full ? appColors.textDisabled : appColors.textPrimary,
                }}
            >
                {usd(session.price)}
            </Typography>
        </Box>
    );
};

export const ClinicSessionsB = ({
    selected = [],
    step = 0,
    onToggle,
    onSelectAll,
    onStep,
}: {
    selected?: string[];
    /** 0 = the dates, 1 = the guest. */
    step?: number;
    onToggle?: (label: string) => void;
    onSelectAll?: () => void;
    onStep?: (index: number) => void;
}) => {
    const chosen = camp.sessions.filter((session) => selected.includes(session.label));
    const total = chosen.reduce((sum, session) => sum + session.price, 0);
    const summary = clinicSummary(camp.sessions);
    const places = camp.sessions.length * camp.capacity;

    return (
        <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            <ClinicStepper
                steps={[
                    { label: "Dates", hint: chosen.length ? `${chosen.length} chosen · ${usd(total)}` : "None chosen yet" },
                    { label: "Guest", hint: "Who is being booked" },
                ]}
                current={step}
                onStep={onStep}
            />

            {/* The clinic, stated once, above whichever step is showing. */}
            <Box sx={{ px: 3, py: 2, bgcolor: appColors.surface, borderBottom: "1px solid", borderColor: appColors.divider }}>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 500, color: appColors.textPrimary }}>{camp.name}</Typography>
                    <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>
                        {camp.category} · {camp.capacity} per session · {usd(camp.sessions[0].price)} each
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                    <Box sx={{ width: 240 }}>
                        <FillBar taken={places - summary.spotsAcross} capacity={places} />
                    </Box>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                        {places - summary.spotsAcross} of {places} places taken · {summary.openSessions} dates open
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, px: 3, py: 2.5 }}>
                {step === 0 ? (
                    <>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary }}>DATES</Typography>
                            <Box sx={{ width: 180 }}>
                                <ActionButton onClick={onSelectAll}>SELECT ALL OPEN</ActionButton>
                            </Box>
                        </Box>

                        <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, overflow: "hidden" }}>
                            {camp.sessions.map((session) => (
                                <SessionRow
                                    key={session.label}
                                    session={session}
                                    selected={selected.includes(session.label)}
                                    onToggle={() => onToggle?.(session.label)}
                                />
                            ))}
                        </Box>
                    </>
                ) : (
                    <>
                        {/* Step 2 opens with what step 1 decided, so the guest
                            is being attached to something visible rather than
                            to a selection two screens back. */}
                        <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1 }}>
                            BOOKING
                        </Typography>
                        <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2, py: 1, mb: 3 }}>
                            {chosen.map((session) => (
                                <Box
                                    key={session.label}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        minHeight: 40,
                                        alignItems: "center",
                                        borderBottom: "1px solid",
                                        borderColor: appColors.divider,
                                    }}
                                >
                                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{sessionDate(session)}</Typography>
                                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{usd(session.price)}</Typography>
                                </Box>
                            ))}
                            <Box sx={{ display: "flex", justifyContent: "space-between", minHeight: 44, alignItems: "center" }}>
                                <Typography sx={{ fontSize: 16, fontWeight: 500, color: appColors.textPrimary }}>
                                    {chosen.length} {chosen.length === 1 ? "session" : "sessions"}
                                </Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 500, color: appColors.textPrimary }}>{usd(total)}</Typography>
                            </Box>
                        </Box>

                        <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1 }}>
                            WHO IS IT FOR
                        </Typography>
                        <ClinicCustomerSearch />
                    </>
                )}
            </Box>

            {/* Money, on screen through both steps. */}
            <Box
                sx={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 56,
                    px: 3,
                    bgcolor: appColors.surface,
                    borderTop: "1px solid",
                    borderColor: appColors.divider,
                }}
            >
                <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>
                    {chosen.length} of {summary.openSessions} open dates chosen
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 500, color: appColors.textPrimary }}>{usd(total)}</Typography>
            </Box>
        </Box>
    );
};

export default ClinicSessionsB;
