import Box from "@mui/material/Box";

import { appColors } from "@/theme/app-replica-tokens";

import { ClinicStepper } from "../102026/clinic-stepper";
import { clinicById } from "../102126/clinic-catalog";
import { bookableClinics, clinicsFor, datesFor, type Registration } from "./registration";
import { ClinicDates, ClinicMultiSelect, ConfirmationStep, PlayerBand, PlayerCountStep, PlayerInfoStep } from "./registration-parts";
import { copyLabel, type RegistrationApi } from "./registration-flow";

/**
 * **A — one clinic at a time.**
 *
 * Weston described the flow and then handed back the one question inside it:
 *
 * > *"And then it would take you to selecting the dates. That's one question,
 * > and I would leave this open to you, because there could be a list this
 * > long. So maybe it says, you know, this is for Justin — and then do we do
 * > each clinic by itself, or is it like all on this page?"*
 *
 * This is **each clinic by itself**, which is how he first told it: *"I'm going
 * to select this date and this date. And then next it would take you to the
 * putting lab, and I want to do this date and this date. And then maybe there's
 * a finish button."*
 *
 * One clinic fills the screen, so a twelve-session series is read without
 * scrolling past another clinic's dates, and the discount on *this* clinic is
 * the only one in view while its dates are being chosen.
 *
 * **The cost is steps.** Two players in two clinics each is ten pages. Option B
 * folds every clinic for a player onto one page and takes six.
 */

export type PageA =
    | { kind: "count" }
    | { kind: "info" }
    | { kind: "clinics"; player: number }
    | { kind: "dates"; player: number; clinicId: string }
    | { kind: "confirm" };

/**
 * The page list, derived rather than stored.
 *
 * It grows as clinics are chosen — pick a second clinic for Justin and a
 * second dates page appears behind the one you are on — so the stepper and the
 * forward button never have to be told separately what is coming.
 */
export const pagesA = (registration: Registration): PageA[] => [
    { kind: "count" },
    { kind: "info" },
    ...registration.players.flatMap((player, index): PageA[] => [
        { kind: "clinics", player: index },
        ...clinicsFor(registration, player.id).map((clinicId): PageA => ({ kind: "dates", player: index, clinicId })),
    ]),
    { kind: "confirm" },
];

export const stepCountA = (api: RegistrationApi) => pagesA(api.registration).length;

export const canAdvanceA = (api: RegistrationApi) => {
    const page = pagesA(api.registration)[api.step];
    if (!page) return false;

    switch (page.kind) {
        // Everyone's details are collected before any clinic is picked, so the
        // picking is never interrupted by a search.
        case "info":
            return api.registration.players.every((player) => player.customer);
        case "clinics":
            return clinicsFor(api.registration, api.registration.players[page.player].id).length > 0;
        case "dates":
            return datesFor(api.registration, api.registration.players[page.player].id, page.clinicId).length > 0;
        default:
            return true;
    }
};

export const titleA = (api: RegistrationApi) => {
    const page = pagesA(api.registration)[api.step];
    if (!page) return "Clinics";
    if (page.kind === "confirm") return "Review registration";
    if (page.kind === "dates") return clinicById(page.clinicId).name;

    return "Clinics";
};

export const nextLabelA = (api: RegistrationApi) => {
    const pages = pagesA(api.registration);
    const page = pages[api.step];
    const after = pages[api.step + 1];

    // "Finish" when this is the player's last clinic, which is the word Weston
    // used for the moment one player is done and the next begins.
    if (page?.kind === "dates" && after && after.kind !== "dates") return "FINISH PLAYER";

    return "NEXT";
};

/** The bar across the top: where the registration is, in its own words. */
const StepperA = ({ api }: { api: RegistrationApi }) => {
    const page = pagesA(api.registration)[api.step];
    const current = page?.kind === "count" ? 0 : page?.kind === "info" ? 1 : page?.kind === "confirm" ? 3 : 2;

    return (
        <ClinicStepper
            steps={[
                { label: "Players", hint: `${api.registration.players.length}` },
                { label: "Who they are", hint: api.registration.players.every((p) => p.customer) ? "All found" : "Search each one" },
                { label: "Clinics and dates", hint: "Player by player" },
                { label: "Review", hint: "Then add to cart" },
            ]}
            current={current}
            onStep={(index) => index < current && api.setStep(index === 0 ? 0 : 1)}
        />
    );
};

export const OptionA = ({ api }: { api: RegistrationApi }) => {
    const { registration } = api;
    const page = pagesA(registration)[api.step];
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

                return (
                    <>
                        <PlayerBand player={player} index={page.player} total={registration.players.length} />
                        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, py: 2.5 }}>
                            <ClinicDates
                                clinic={clinicById(page.clinicId)}
                                registration={registration}
                                playerId={player.id}
                                onToggle={(label) => api.toggleDateFor(player.id, page.clinicId, label)}
                            />
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
                                // Jump back to that player's clinic list, which
                                // is where every change to them starts.
                                const target = pagesA(registration).findIndex((p) => p.kind === "clinics" && p.player === index);
                                if (target >= 0) api.setStep(target);
                            }}
                        />
                    </Box>
                );
        }
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            <StepperA api={api} />
            {body()}
        </Box>
    );
};

export default OptionA;
