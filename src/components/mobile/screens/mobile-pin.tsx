import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { MobileFrame } from "../mobile-shell";

/**
 * **Mobile Screens — the PIN lock screen.** From the Sept 4 reference capture.
 *
 * The phone's front door, and it is **not** the tablet's sign-in narrowed. The
 * counter terminal signs in with a 690px text field on navy, which assumes a
 * hardware keyboard sitting beside it. A handheld has neither the keyboard nor
 * the width, and asking the OS for one would put a four-digit entry behind a
 * QWERTY layout with half the screen covered.
 *
 * So this is the pattern a phone already uses to unlock itself, which is the
 * one interaction every operator on the course has performed a thousand times.
 *
 * ## What the reference establishes
 *
 * **Navy, edge to edge, with the mark kept.** The capture was green and
 * markless; the app's own sign-in ground is `appColors.navy`, and that is what
 * this uses — the lock screen and the terminal's front door should not be two
 * different products. The Tenfore mark stays for the same reason: it is the
 * only screen an operator sees before they are anybody, so it is the one place
 * the device says whose it is.
 *
 * What the capture actually contributed is the **structure** — dots instead of
 * a field, a keypad instead of the OS keyboard, and half the screen left empty
 * so the keys fall under a thumb.
 *
 * **Four dots, not a text field.** They sit high — around a quarter of the way
 * down — because the thumb owns the bottom half and the dots only need to be
 * *seen*, never reached. A masked input box would put the same information
 * behind a control that invites a tap it cannot use.
 *
 * **Numerals with no chrome.** No boxes, no fills, no borders — just large
 * light-weight figures on the green. Buttons would add 12 rectangles competing
 * with the two controls that genuinely differ: the biometric key and the
 * delete key, which are the only ones drawn as shapes.
 *
 * Each key is a **~110 x 72dp** target even though the glyph is smaller, so the
 * generous spacing is hit area rather than decoration.
 *
 * **Delete is the only filled key.** It is the one destructive control on the
 * screen and the one an operator hits without looking, so it gets a silhouette
 * the thumb can find by shape.
 *
 * ## Two decisions the reference implies rather than states
 *
 * **This is a lock screen, not a first-run sign-in** — hence `Logout` in the
 * corner. The distinction matters: a locked terminal still has an operator
 * attached, and `Logout` is how you hand the device to someone else rather than
 * how you cancel. It is wired to a real sign-out.
 *
 * **Four digits commits.** There is no confirm key in the reference and none
 * here: the PIN is fixed-length, so the fourth digit is the submit. A confirm
 * button would be a tap that can only ever mean "yes, I meant those four".
 */

/** The keypad, in reading order. `bio` and `del` are the two shaped keys. */
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "bio", "0", "del"] as const;

export interface MobilePinProps {
    /** How many digits the PIN takes. The last one submits. */
    length?: number;
    /** Fires when the final digit lands. */
    onComplete?: (pin: string) => void;
    onBiometric?: () => void;
    onLogout?: () => void;
    /** Shakes the dots and clears — a wrong PIN, from the caller. */
    error?: boolean;
    /** Seeds digits so a story can show a half-entered state. */
    value?: string;
}

/** The Face ID glyph — four corner brackets around a face, drawn rather than iconed. */
const BiometricGlyph = () => (
    <Box component="svg" viewBox="0 0 44 44" sx={{ width: 34, height: 34, fill: "none", stroke: "#fff", strokeWidth: 2.4 }}>
        {/* Corner brackets */}
        <path d="M2 13V6a4 4 0 0 1 4-4h7" strokeLinecap="round" />
        <path d="M31 2h7a4 4 0 0 1 4 4v7" strokeLinecap="round" />
        <path d="M42 31v7a4 4 0 0 1-4 4h-7" strokeLinecap="round" />
        <path d="M13 42H6a4 4 0 0 1-4-4v-7" strokeLinecap="round" />
        {/* Eyes and mouth */}
        <path d="M15 17v4M29 17v4" strokeLinecap="round" />
        <path d="M15 28c2.2 2.2 4.6 3.3 7 3.3s4.8-1.1 7-3.3" strokeLinecap="round" />
    </Box>
);

/**
 * The delete key.
 *
 * The reference draws it as a filled arrow-tag with a cut-out cross — the shape
 * every phone keypad uses, so it reads as "backspace" before it is read at all.
 * Filled in a lighter green so it sits on the ground rather than on a button.
 */
const DeleteGlyph = () => (
    <Box component="svg" viewBox="0 0 40 30" sx={{ width: 40, height: 30 }}>
        <path d="M13 1h23a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H13L1 15z" fill="rgba(255,255,255,0.82)" />
        <path d="M20 10l10 10M30 10L20 20" stroke={appColors.navy} strokeWidth="3" strokeLinecap="round" />
    </Box>
);

export const MobilePin = ({ length = 4, onComplete, onBiometric, onLogout, error = false, value }: MobilePinProps) => {
    const [pin, setPin] = useState(value ?? "");
    const entered = value ?? pin;

    const press = (key: string) => {
        if (key === "del") return setPin((p) => p.slice(0, -1));
        if (key === "bio") return onBiometric?.();
        if (entered.length >= length) return;
        const next = entered + key;
        setPin(next);
        // The last digit is the submit. Delayed a frame so the fourth dot is
        // seen filling before the screen changes — without it the transition
        // reads as though the tap did nothing.
        if (next.length === length) setTimeout(() => onComplete?.(next), 140);
    };

    return (
        <MobileFrame>
            <Stack sx={{ flex: 1, bgcolor: appColors.navy, position: "relative" }}>
                {/* Header. The title is centred on the screen, not on the space
                    left over by Logout — the reference centres it absolutely. */}
                <Box sx={{ position: "relative", pt: 2.5, pb: 1 }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#fff", textAlign: "center" }}>Enter your PIN</Typography>
                    <ButtonBase
                        onClick={onLogout}
                        sx={{ position: "absolute", right: 8, top: 8, minHeight: 44, px: 1, fontSize: 17, color: "#fff" }}
                    >
                        Logout
                    </ButtonBase>
                </Box>

                {/* The mark. Small and centred — it identifies the device
                    without competing with the only two things that matter here,
                    which are the dots and the keypad. */}
                <Box
                    component="img"
                    src={assetUrl("logos/tf-logo-white.svg")}
                    alt="Tenfore"
                    sx={{ width: 148, alignSelf: "center", mt: 4, opacity: 0.95 }}
                />

                {/* The dots sit high and stay there. They are read, never
                    reached — the thumb owns the bottom half. */}
                <Stack
                    direction="row"
                    role="status"
                    aria-label={`${entered.length} of ${length} digits entered`}
                    sx={{
                        justifyContent: "space-between",
                        width: 214,
                        alignSelf: "center",
                        mt: 4,
                        animation: error ? "pinShake 320ms" : undefined,
                        "@keyframes pinShake": {
                            "0%,100%": { transform: "translateX(0)" },
                            "25%": { transform: "translateX(-8px)" },
                            "75%": { transform: "translateX(8px)" },
                        },
                    }}
                >
                    {Array.from({ length }, (_, i) => (
                        <Box
                            key={i}
                            sx={{
                                width: 11,
                                height: 11,
                                borderRadius: "50%",
                                border: "1.5px solid #fff",
                                bgcolor: i < entered.length ? "#fff" : "transparent",
                                transition: "background-color 120ms linear",
                            }}
                        />
                    ))}
                </Stack>

                {/* Everything between the dots and the keypad is deliberately
                    empty. The reference leaves roughly half the screen blank,
                    which is what puts the keys under a thumb rather than in the
                    middle of the device. */}
                <Box sx={{ flex: 1 }} />

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        rowGap: 0.5,
                        px: 2,
                        pb: 2,
                    }}
                >
                    {KEYS.map((key) => (
                        <ButtonBase
                            key={key}
                            onClick={() => press(key)}
                            disableRipple
                            aria-label={key === "del" ? "Delete" : key === "bio" ? "Sign in with Face ID" : key}
                            sx={{
                                // Hit area, not decoration: the glyph is small
                                // and the target is not.
                                height: 72,
                                borderRadius: 2,
                                color: "#fff",
                                fontSize: 40,
                                fontWeight: 300,
                                lineHeight: 1,
                                // A brief flash rather than MUI's ripple: the
                                // ripple leaves a lingering rectangle, and a
                                // rectangle is the one thing these keys must
                                // not have.
                                "&:active": { bgcolor: "rgba(255,255,255,0.14)" },
                                transition: "background-color 90ms linear",
                            }}
                        >
                            {key === "bio" ? <BiometricGlyph /> : key === "del" ? <DeleteGlyph /> : key}
                        </ButtonBase>
                    ))}
                </Box>
            </Stack>
        </MobileFrame>
    );
};
