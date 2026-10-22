import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { ClinicStepper } from "../102026/clinic-stepper";
import { clinicById, usd } from "../102126/clinic-catalog";
import { bookableClinics, bookingsFor, clinicsFor, priceBooking, type Registration } from "./registration";
import { ClinicDates, ClinicMultiSelect, ConfirmationStep, PlayerBand, PlayerCountStep, PlayerInfoStep } from "./registration-parts";
import { copyLabel, type RegistrationApi } from "./registration-flow";

/**
 * **B — every clinic for a player, on one page.**
 *
 * The other answer to the question Weston left open: *"do we do each clinic by
 * itself, or is it like all on this page?"*
 *
 * All on this page. A player's chosen clinics stack as sections down one
 * scroll, each with its own dates, its own running count and its own discount
 * line. Picking Justin's four Junior Golf Academy dates and his two Putting Lab
 * dates is one screen and one **FINISH**, not two pages and two.
 *
 * **Two players in two clinics each is six pages here, against A's ten.** That
 * is the whole argument for it.
 *
 * **The cost is the scroll.** Two twelve-session clinics is a long page, and
 * the running total at the bottom of section two is below the fold while
 * section one is being read. A keeps every clinic at full screen.
 */

export type PageB =
    { kind: "count" } | { kind: "info" } | { kind: "clinics"; player: number } | { kind: "dates"; player: number } | { kind: "confirm" };

export const pagesB = (registration: Registration): PageB[] => [
    { kind: "count" },
    { kind: "info" },
    ...registration.players.flatMap((_, index): PageB[] => [
        { kind: "clinics", player: index },
        { kind: "dates", player: index },
    ]),
    { kind: "confirm" },
];

export const stepCountB = (api: RegistrationApi) => pagesB(api.registration).length;

export const canAdvanceB = (api: RegistrationApi) => {
    const page = pagesB(api.registration)[api.step];
    if (!page) return false;

    switch (page.kind) {
        case "info":
            return api.registration.players.every((player) => player.customer);
        case "clinics":
            return clinicsFor(api.registration, api.registration.players[page.player].id).length > 0;
        // Every chosen clinic needs at least one date, or a player leaves this
        // page registered for a clinic on no days at all.
        case "dates":
            return bookingsFor(api.registration, api.registration.players[page.player].id).every((booking) => booking.dates.length > 0);
        default:
            return true;
    }
};

export const titleB = (api: RegistrationApi) => {
    const page = pagesB(api.registration)[api.step];

    return page?.kind === "confirm" ? "Review registration" : "Clinics";
};

export const nextLabelB = (api: RegistrationApi) => {
    const page = pagesB(api.registration)[api.step];

    return page?.kind === "dates" ? "FINISH PLAYER" : "NEXT";
};

const StepperB = ({ api }: { api: RegistrationApi }) => {
    const page = pagesB(api.registration)[api.step];
    const current = page?.kind === "count" ? 0 : page?.kind === "info" ? 1 : page?.kind === "confirm" ? 3 : 2;

    return (
        <ClinicStepper
            steps={[
                { label: "Players", hint: `${api.registration.players.length}` },
                { label: "Who they are", hint: api.registration.players.every((p) => p.customer) ? "All found" : "Search each one" },
                { label: "Clinics and dates", hint: "One page each" },
                { label: "Review", hint: "Then add to cart" },
            ]}
            current={current}
            onStep={(index) => index < current && api.setStep(index === 0 ? 0 : 1)}
        />
    );
};

/** Everything this player is signed up for, totalled at the foot of the page. */
const PlayerTotal = ({ registration, playerId }: { registration: Registration; playerId: string }) => {
    const prices = bookingsFor(registration, playerId).map(priceBooking);
    const dates = prices.reduce((sum, price) => sum + price.dates.length, 0);
    const net = prices.reduce((sum, price) => sum + price.net, 0);
    const saved = prices.reduce((sum, price) => sum + price.saved, 0);

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minHeight: 60,
                px: 2.5,
                bgcolor: appColors.surface,
                borderRadius: `${appRadius.card}px`,
            }}
        >
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16, color: appColors.textSecondary }}>
                {prices.length} {prices.length === 1 ? "clinic" : "clinics"} · {dates} {dates === 1 ? "date" : "dates"}
            </Typography>
            {saved > 0 && <Typography sx={{ fontSize: 15, color: appColors.greenDark }}>Discounts −{usd(saved)}</Typography>}
            <Typography sx={{ fontSize: 20, fontWeight: 500, color: appColors.textPrimary }}>{usd(net)}</Typography>
        </Box>
    );
};

export const OptionB = ({ api }: { api: RegistrationApi }) => {
    const { registration } = api;
    const page = pagesB(registration)[api.step];
    if (!page) return null;

    const body = () => {
        switch (page.kind) {
            case "count":
                return <PlayerCountStep count={registration.players.length} onCount={api.setCount} />;
            case "info":
                return <PlayerInfoStep players={registration.players} onFind={api.findPlayer} />;
            case "clinics": {
                const player = registration.players[page.player];

                return (
                    <>
                        <PlayerBand
                            player={player}
                            index={page.player}
                            total={registration.players.length}
                            copyFrom={copyLabel(registration, page.player)}
                            onCopy={page.player > 0 ? () => api.copyFrom(page.player - 1, page.player) : undefined}
                        />
                        <Box sx={{ flex: 1, minHeight: 0 }}>
                            <ClinicMultiSelect
                                clinics={bookableClinics}
                                chosen={clinicsFor(registration, player.id)}
                                onToggle={(clinicId) => api.toggleClinicFor(player.id, clinicId)}
                            />
                        </Box>
                    </>
                );
            }
            case "dates": {
                const player = registration.players[page.player];
                const chosen = clinicsFor(registration, player.id);

                return (
                    <>
                        <PlayerBand player={player} index={page.player} total={registration.players.length} />
                        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, py: 2.5 }}>
                            {/* Every clinic this player picked, stacked. */}
                            {chosen.map((clinicId) => (
                                <ClinicDates
                                    key={clinicId}
                                    clinic={clinicById(clinicId)}
                                    registration={registration}
                                    playerId={player.id}
                                    onToggle={(label) => api.toggleDateFor(player.id, clinicId, label)}
                                />
                            ))}
                            <PlayerTotal registration={registration} playerId={player.id} />
                        </Box>
                    </>
                );
            }
            default:
                return (
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                        <ConfirmationStep
                            registration={registration}
                            onEdit={(index) => {
                                const target = pagesB(registration).findIndex((p) => p.kind === "dates" && p.player === index);
                                if (target >= 0) api.setStep(target);
                            }}
                        />
                    </Box>
                );
        }
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            <StepperB api={api} />
            {body()}
        </Box>
    );
};

export default OptionB;
