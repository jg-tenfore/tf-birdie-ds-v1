import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { usd } from "@/components/concepts/clinics/102126/clinic-catalog";
import { OptionC, canAdvanceC, nextLabelC, pagesC, stepCountC } from "@/components/concepts/clinics/102226/option-c-confirm-first";
import {
    copyBookings,
    emptyRegistration,
    findCustomer,
    registrationLines,
    registrationTotals,
    toggleClinic,
    toggleDate,
    type Registration,
} from "@/components/concepts/clinics/102226/registration";
import type { RegistrationApi } from "@/components/concepts/clinics/102226/registration-flow";
import { LiveOrderPanel, Shell } from "../pos-shell";
import { useActions } from "../store";

/**
 * **Clinics — V2**, built on Option C from the Oct 22 round.
 *
 * V1 has no clinic screen at all: the Pro Shop's Clinics tile drills into a
 * product list like any other category. This is the registration flow Weston
 * described — *"you'd first be asked how many players… then you collect their
 * information… then you step through it for each person"* — with the shortcut
 * he asked for taken literally.
 *
 * Option C steps only the first player. Everyone after them is a row on the
 * summary you either copy in one tap — *"same as Justin, and it just skips
 * those steps"* — or open in place to change the one thing that differs.
 *
 * **Five pages for two players**, where stepping everybody takes ten.
 *
 * It ends at the cart rather than the card, which was Weston's call:
 * *"adding it to the cart and not skipping gives us the most flexibility."*
 */
export const ClinicsScreen = () => {
    const navigate = useNavigate();
    const { addItem } = useActions();

    const [registration, setRegistration] = useState<Registration>(() => emptyRegistration(1));
    const [step, setStep] = useState(0);
    const [playerIndex, setPlayerIndex] = useState(0);

    const api: RegistrationApi = {
        registration,
        step,
        playerIndex,
        setStep,
        setPlayerIndex,
        setCount: (count) =>
            setRegistration((prev) => {
                const players = emptyRegistration(count).players.map((player, index) => prev.players[index] ?? player);
                const kept = Object.fromEntries(players.map((player) => [player.id, prev.bookings[player.id] ?? []]));

                return { players, bookings: kept };
            }),
        findPlayer: (index) =>
            setRegistration((prev) => ({
                ...prev,
                players: prev.players.map((player, i) => (i === index ? { ...player, customer: findCustomer(index) } : player)),
            })),
        toggleClinicFor: (playerId, clinicId) => setRegistration((prev) => toggleClinic(prev, playerId, clinicId)),
        toggleDateFor: (playerId, clinicId, label) => setRegistration((prev) => toggleDate(prev, playerId, clinicId, label)),
        copyFrom: (fromIndex, toIndex) =>
            setRegistration((prev) => copyBookings(prev, prev.players[fromIndex].id, prev.players[toIndex].id)),
        commit: () => undefined,
    };

    const totals = registrationTotals(registration);
    const last = step >= stepCountC() - 1;
    const ready = canAdvanceC(api);

    /** One line per player per date, named and dated — the Oct 22 decision. */
    const addToCart = () => {
        for (const line of registrationLines(registration)) {
            addItem({ id: line.id, name: line.name, price: Number(line.price.replace(/[^0-9.]/g, "")) }, "Pro Shop");
        }

        navigate("/proshop");
    };

    return (
        <Shell
            title={pagesC()[step]?.kind === "confirm" ? "Review registration" : "Clinics"}
            active="proshop"
            orderPanel={<LiveOrderPanel />}
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />} onClick={() => (step > 0 ? setStep(step - 1) : navigate("/proshop"))}>
                        Back
                    </ActionButton>
                    <ActionButton
                        tone="primary"
                        disabled={!ready}
                        onClick={!ready ? undefined : last ? addToCart : () => setStep(step + 1)}
                    >
                        {last ? `Add to cart · ${usd(totals.net)}` : nextLabelC(api)}
                    </ActionButton>
                </>
            }
        >
            <OptionC api={api} />
        </Shell>
    );
};
