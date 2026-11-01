import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { MobilePin } from "@/components/mobile/screens/mobile-pin";
import { useActions } from "../../store";
import { MobileViewport } from "../mobile-shell";

/**
 * PIN sign-in on the handheld — the lock screen from the Sept 4 reference.
 *
 * The layout lives in `@/components/mobile/screens/mobile-pin`, documented in
 * Storybook under `Mobile Screens → PIN lock`. This file is the seam: it hands
 * that component a real sign-in and a real navigate, and nothing else.
 *
 * Same rule as the counter terminal — any four-digit PIN is accepted, and the
 * operator is chosen from the first digit so different codes sign you in as
 * different staff. That is enough to demonstrate shift and till attribution
 * without building auth.
 */
const OPERATORS = [
    { name: "Dana Kim", initials: "DK", till: "Register 2" },
    { name: "Chris Moreno", initials: "CM", till: "Register 1" },
    { name: "Ana Silva", initials: "AS", till: "Register 3" },
];

export const MobileSignInScreen = () => {
    const { signIn, signOut, toast } = useActions();
    const navigate = useNavigate();
    const [error, setError] = useState(false);

    const enter = (pin: string) => {
        setError(false);
        signIn(OPERATORS[Number(pin[0]) % OPERATORS.length]);
        navigate("/proshop");
    };

    return (
        <MobileViewport>
            <MobilePin
                error={error}
                onComplete={enter}
                // The reference puts a biometric key on the pad, so it does
                // something: it signs in the till's default operator. A key that
                // is drawn and dead is worse than one that is not drawn.
                onBiometric={() => {
                    signIn(OPERATORS[0]);
                    toast(`Signed in as ${OPERATORS[0].name}`);
                    navigate("/proshop");
                }}
                // `Logout` on a lock screen is not "cancel" — it releases the
                // terminal so the next person signs in as themselves.
                onLogout={() => {
                    signOut();
                    toast("Terminal released");
                }}
            />
        </MobileViewport>
    );
};
