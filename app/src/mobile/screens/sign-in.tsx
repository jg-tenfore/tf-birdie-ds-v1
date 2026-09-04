import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import { useNavigate } from "react-router-dom";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { MobileFrame } from "@/components/mobile/mobile-shell";
import { useActions } from "../../store";
import { MobileViewport } from "../mobile-shell";

/**
 * PIN sign-in, on a phone.
 *
 * Same rule as the terminal: any 4-digit PIN is accepted and the operator is
 * picked from the first digit, so different codes sign you in as different
 * staff.
 *
 * **What changes is the keypad.** The terminal has a 690px field and relies on
 * a hardware keyboard being there. A phone has neither, and a POS sign-in that
 * summons the OS keyboard puts a numeric entry behind a QWERTY layout — so this
 * draws its own 3x4 keypad. 64dp keys, which is what a thumb needs on a device
 * held in one hand at a counter.
 */
const OPERATORS = [
    { name: "Dana Kim", initials: "DK", till: "Register 2" },
    { name: "Chris Moreno", initials: "CM", till: "Register 1" },
    { name: "Ana Silva", initials: "AS", till: "Register 3" },
];

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export const MobileSignInScreen = () => {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const { signIn } = useActions();
    const navigate = useNavigate();

    const submit = (value: string) => {
        if (value.length < 4) {
            setError(true);
            return;
        }
        signIn(OPERATORS[Number(value[0]) % OPERATORS.length]);
        navigate("/proshop");
    };

    const press = (k: string) => {
        setError(false);
        if (k === "del") return setPin((p) => p.slice(0, -1));
        if (!k) return;
        const next = (pin + k).slice(0, 6);
        setPin(next);
        // Four digits is a complete PIN, so it signs in rather than waiting for
        // a confirm the terminal only needs because it has a keyboard.
        if (next.length === 4) setTimeout(() => submit(next), 120);
    };

    return (
        <MobileViewport>
            <MobileFrame>
                <Stack sx={{ flex: 1, bgcolor: appColors.navy, alignItems: "center", justifyContent: "space-between", py: 4, px: 3 }}>
                    <Stack sx={{ alignItems: "center", gap: 3, pt: 4 }}>
                        <Box component="img" src={assetUrl("logos/tf-logo-white.svg")} alt="Tenfore" sx={{ width: 180 }} />

                        <InputBase
                            value={pin}
                            readOnly
                            type="password"
                            placeholder="Enter your PIN"
                            inputProps={{ style: { textAlign: "center" }, "aria-label": "Enter your PIN" }}
                            sx={{
                                width: 280,
                                bgcolor: "#E4E4E4",
                                borderRadius: `${appRadius.button}px`,
                                py: 1.25,
                                "& input": { fontSize: 22, letterSpacing: "0.4em" },
                            }}
                        />
                        <Typography sx={{ fontSize: 13, color: error ? appColors.red : "rgba(255,255,255,0.6)", minHeight: 20 }}>
                            {error ? "A PIN is four digits." : "Any four digits will do."}
                        </Typography>
                    </Stack>

                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25, width: 264 }}>
                        {KEYS.map((k, i) =>
                            k === "" ? (
                                <Box key={i} />
                            ) : (
                                <ButtonBase
                                    key={i}
                                    onClick={() => press(k)}
                                    aria-label={k === "del" ? "Delete" : k}
                                    sx={{
                                        height: 64,
                                        borderRadius: `${appRadius.button}px`,
                                        bgcolor: "rgba(255,255,255,0.08)",
                                        color: "#fff",
                                        fontSize: 24,
                                    }}
                                >
                                    {k === "del" ? <BackspaceOutlinedIcon sx={{ fontSize: 22 }} /> : k}
                                </ButtonBase>
                            ),
                        )}
                    </Box>
                </Stack>
            </MobileFrame>
        </MobileViewport>
    );
};
