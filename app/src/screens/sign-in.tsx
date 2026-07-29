import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { useActions } from "../store";

/**
 * PIN sign-in — the app's front door.
 *
 * Any 4-digit PIN is accepted; the operator is picked from the PIN so different
 * codes land you in the app as different staff. That is enough to demonstrate
 * the shift/till attribution without building real auth.
 */
const OPERATORS = [
    { name: "Dana Kim", initials: "DK", till: "Register 2" },
    { name: "Chris Moreno", initials: "CM", till: "Register 1" },
    { name: "Ana Silva", initials: "AS", till: "Register 3" },
];

export const SignInScreen = () => {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const { signIn } = useActions();
    const navigate = useNavigate();

    const submit = () => {
        if (pin.length < 4) {
            setError(true);
            return;
        }
        const operator = OPERATORS[Number(pin[0]) % OPERATORS.length];
        signIn(operator);
        navigate("/proshop");
    };

    return (
        <Box
            sx={{
                height: "100vh",
                bgcolor: appColors.navy,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
            }}
        >
            <Box component="img" src={assetUrl("logos/tf-logo-white.svg")} alt="Tenfore" sx={{ width: 220 }} />

            <Stack sx={{ width: 690, gap: 3 }}>
                <InputBase
                    autoFocus
                    value={pin}
                    onChange={(e) => {
                        setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setError(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    type="password"
                    placeholder="Enter your PIN"
                    inputProps={{ inputMode: "numeric", style: { textAlign: "center" }, "aria-label": "Enter your PIN" }}
                    sx={{
                        bgcolor: "#E4E4E4",
                        borderRadius: `${appRadius.tile}px`,
                        height: 88,
                        px: 3,
                        fontSize: 24,
                        border: error ? "2px solid #E53950" : "2px solid transparent",
                        "& input::placeholder": { color: "#6E6E6E", opacity: 1 },
                    }}
                />

                {error && <Typography sx={{ color: "#F4695F", textAlign: "center" }}>Enter at least 4 digits.</Typography>}

                <Button
                    onClick={submit}
                    disableElevation
                    sx={{
                        height: 100,
                        bgcolor: appColors.green,
                        color: "#fff",
                        fontSize: 15,
                        letterSpacing: "0.09em",
                        borderRadius: `${appRadius.tile}px`,
                        "&:hover": { bgcolor: appColors.greenDark },
                    }}
                >
                    Sign in
                </Button>

                <Typography sx={{ color: "rgba(255,255,255,.5)", fontSize: 13, textAlign: "center" }}>
                    Demo — any 4 digits work. The first digit picks the operator.
                </Typography>
            </Stack>
        </Box>
    );
};
