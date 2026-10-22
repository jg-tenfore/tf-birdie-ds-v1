import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import { ClinicStepper } from "../102026/clinic-stepper";
import { clinicById, usd } from "../102126/clinic-catalog";
import { bookableClinics, bookingsFor, clinicsFor, playerName, priceBooking, registrationTotals } from "./registration";
import { ClinicDates, ClinicMultiSelect, DiscountNudges, PlayerBand, PlayerCountStep, PlayerInfoStep } from "./registration-parts";
import { copyLabel, type RegistrationApi } from "./registration-flow";

/**
 * **C — the first player steps, the rest are filled in on the summary.**
 *
 * A and B both walk every player through the same pages. Weston's own
 * shortcut says that is usually wasted work:
 *
 * > *"And then maybe we add like a 'same as Justin', and it just selects it and
 * > **skips those steps** of selecting each one."*
 *
 * So this version takes him at his word and removes the steps entirely. Player
 * one is set up the normal way; then the registration lands on the summary, and
 * players two onward are **rows you fill in place**:
 *
 * - **SAME AS JUSTIN** copies the whole selection in one tap, done.
 * - **CHOOSE SEPARATELY** opens that player's clinics and dates *inside the
 *   row*, so the rest of the family stays visible while you work.
 *
 * Which is the case Weston actually described: *"yeah, he's going to do the
 * Junior Golf Academy, but he actually can't do Tuesdays because he has
 * baseball, so I'm going to put him on Wednesday."* Copy, then change the one
 * thing, without leaving the page that shows everyone.
 *
 * **Five pages for two players, against A's ten.** The cost is that the
 * summary does two jobs at once, and on a long family it is a tall page.
 */

export type PageC = { kind: "count" } | { kind: "info" } | { kind: "clinics" } | { kind: "dates" } | { kind: "confirm" };

/** Only player one gets pages. Everyone else lives on the summary. */
export const pagesC = (): PageC[] => [{ kind: "count" }, { kind: "info" }, { kind: "clinics" }, { kind: "dates" }, { kind: "confirm" }];

export const stepCountC = () => pagesC().length;

export const canAdvanceC = (api: RegistrationApi) => {
    const page = pagesC()[api.step];
    const first = api.registration.players[0];
    if (!page || !first) return false;

    switch (page.kind) {
        case "info":
            return api.registration.players.every((player) => player.customer);
        case "clinics":
            return clinicsFor(api.registration, first.id).length > 0;
        case "dates":
            return bookingsFor(api.registration, first.id).every((booking) => booking.dates.length > 0);
        default:
            return true;
    }
};

export const titleC = (api: RegistrationApi) => (pagesC()[api.step]?.kind === "confirm" ? "Review registration" : "Clinics");

export const nextLabelC = (api: RegistrationApi) => (pagesC()[api.step]?.kind === "dates" ? "FINISH PLAYER" : "NEXT");

const StepperC = ({ api }: { api: RegistrationApi }) => {
    const kind = pagesC()[api.step]?.kind;
    const current = kind === "count" ? 0 : kind === "info" ? 1 : kind === "confirm" ? 3 : 2;

    return (
        <ClinicStepper
            steps={[
                { label: "Players", hint: `${api.registration.players.length}` },
                { label: "Who they are", hint: api.registration.players.every((p) => p.customer) ? "All found" : "Search each one" },
                { label: "First player", hint: playerName(api.registration.players[0], 0) },
                { label: "Everyone else", hint: "On the summary" },
            ]}
            current={current}
            onStep={(index) => index < current && api.setStep(index === 0 ? 0 : 1)}
        />
    );
};

/* ------------------------------------------------- the working summary */

const PlayerRow = ({ api, index }: { api: RegistrationApi; index: number }) => {
    const { registration } = api;
    const player = registration.players[index];
    const [open, setOpen] = useState(false);

    const prices = bookingsFor(registration, player.id).map(priceBooking);
    const net = prices.reduce((sum, price) => sum + price.net, 0);
    const empty = prices.length === 0;
    const previous = copyLabel(registration, index);

    return (
        <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2.5, py: 2, mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minHeight: 44 }}>
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 19, fontWeight: 500, color: appColors.textPrimary }}>
                    {playerName(player, index)}
                </Typography>

                {/* One tap for the common case, before anything else. */}
                {index > 0 && previous && (
                    <Box
                        onClick={() => {
                            api.copyFrom(index - 1, index);
                            setOpen(false);
                        }}
                        role="button"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            minHeight: touchTarget.min,
                            px: 1.75,
                            cursor: "pointer",
                            borderRadius: `${appRadius.button}px`,
                            bgcolor: appColors.slate,
                        }}
                    >
                        <CheckIcon sx={{ fontSize: 17, color: "#fff" }} />
                        <Typography sx={{ fontSize: 14, letterSpacing: "0.04em", color: "#fff" }}>
                            SAME AS {previous.toUpperCase()}
                        </Typography>
                    </Box>
                )}

                <Box
                    onClick={() => setOpen((prev) => !prev)}
                    role="button"
                    aria-expanded={open}
                    aria-label={`Choose separately for ${playerName(player, index)}`}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5, minHeight: touchTarget.min, px: 1.25, cursor: "pointer" }}
                >
                    <Typography sx={{ fontSize: 14, letterSpacing: "0.04em", color: appColors.greenDark }}>
                        {open ? "DONE" : empty ? "CHOOSE SEPARATELY" : "EDIT"}
                    </Typography>
                    <ExpandMoreIcon sx={{ fontSize: 20, color: appColors.greenDark, transform: open ? "rotate(180deg)" : "none" }} />
                </Box>

                <Typography sx={{ width: 90, textAlign: "right", fontSize: 18, color: appColors.textPrimary }}>{usd(net)}</Typography>
            </Box>

            {!open &&
                (empty ? (
                    <Typography sx={{ fontSize: 16, color: appColors.textSecondary, py: 0.5 }}>Nothing chosen yet.</Typography>
                ) : (
                    prices.map((price) => (
                        <Box key={price.clinic.id} sx={{ borderTop: "1px solid", borderColor: appColors.divider, py: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, color: appColors.textPrimary }}>
                                    {price.clinic.name}
                                </Typography>
                                {price.saved > 0 && (
                                    <Typography sx={{ fontSize: 15, color: appColors.greenDark }}>
                                        {price.discount?.percentOff}% off — saving {usd(price.saved)}
                                    </Typography>
                                )}
                                <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{usd(price.net)}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{price.dates.join(" · ")}</Typography>
                        </Box>
                    ))
                ))}

            {/* The whole picker, inside the row, so the family stays on screen. */}
            {open && (
                <Box sx={{ borderTop: "1px solid", borderColor: appColors.divider, pt: 1.5 }}>
                    <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1 }}>CLINICS</Typography>
                    <Box
                        sx={{
                            height: 280,
                            mb: 2,
                            border: "1px solid",
                            borderColor: appColors.divider,
                            borderRadius: `${appRadius.card}px`,
                            overflow: "hidden",
                        }}
                    >
                        <ClinicMultiSelect
                            clinics={bookableClinics}
                            chosen={clinicsFor(registration, player.id)}
                            onToggle={(clinicId) => api.toggleClinicFor(player.id, clinicId)}
                        />
                    </Box>

                    {clinicsFor(registration, player.id).map((clinicId) => (
                        <ClinicDates
                            key={clinicId}
                            clinic={clinicById(clinicId)}
                            registration={registration}
                            playerId={player.id}
                            onToggle={(label) => api.toggleDateFor(player.id, clinicId, label)}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

const SummaryC = ({ api }: { api: RegistrationApi }) => {
    const totals = registrationTotals(api.registration);

    return (
        <Box sx={{ px: 3, py: 2.5 }}>
            <DiscountNudges registration={api.registration} />

            {api.registration.players.map((_, index) => (
                <PlayerRow key={api.registration.players[index].id} api={api} index={index} />
            ))}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minHeight: 64,
                    px: 2.5,
                    bgcolor: appColors.surface,
                    borderRadius: `${appRadius.card}px`,
                }}
            >
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, color: appColors.textSecondary }}>
                    {api.registration.players.length} {api.registration.players.length === 1 ? "player" : "players"} · {totals.dates} dates
                </Typography>
                {totals.saved > 0 && (
                    <Typography sx={{ fontSize: 16, color: appColors.greenDark }}>Discounts −{usd(totals.saved)}</Typography>
                )}
                <Typography sx={{ fontSize: 22, fontWeight: 500, color: appColors.textPrimary }}>{usd(totals.net)}</Typography>
            </Box>
        </Box>
    );
};

export const OptionC = ({ api }: { api: RegistrationApi }) => {
    const { registration } = api;
    const page = pagesC()[api.step];
    const first = registration.players[0];
    if (!page || !first) return null;

    const body = () => {
        switch (page.kind) {
            case "count":
                return <PlayerCountStep count={registration.players.length} onCount={api.setCount} />;
            case "info":
                return <PlayerInfoStep players={registration.players} onFind={api.findPlayer} />;
            case "clinics":
                return (
                    <>
                        <PlayerBand player={first} index={0} total={registration.players.length} />
                        <Box sx={{ flex: 1, minHeight: 0 }}>
                            <ClinicMultiSelect
                                clinics={bookableClinics}
                                chosen={clinicsFor(registration, first.id)}
                                onToggle={(clinicId) => api.toggleClinicFor(first.id, clinicId)}
                            />
                        </Box>
                    </>
                );
            case "dates":
                return (
                    <>
                        <PlayerBand player={first} index={0} total={registration.players.length} />
                        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, py: 2.5 }}>
                            {clinicsFor(registration, first.id).map((clinicId) => (
                                <ClinicDates
                                    key={clinicId}
                                    clinic={clinicById(clinicId)}
                                    registration={registration}
                                    playerId={first.id}
                                    onToggle={(label) => api.toggleDateFor(first.id, clinicId, label)}
                                />
                            ))}
                        </Box>
                    </>
                );
            default:
                return (
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                        <SummaryC api={api} />
                    </Box>
                );
        }
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            <StepperC api={api} />
            {body()}
        </Box>
    );
};

export default OptionC;
