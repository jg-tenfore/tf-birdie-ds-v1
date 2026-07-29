import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";

import { fontFamily, radius, touchTarget } from "@/theme/tokens";

/**
 * The operator PIN pad.
 *
 * This is the single most-used control in the product — every shift change,
 * every void, every manager override goes through it — and it is the one screen
 * an operator uses without looking, while a guest waits. So the keys are 88px
 * (past even the `critical` tier), the grid never reflows, and the digits are
 * monospaced so key positions stay fixed regardless of glyph width.
 *
 * There is no on-screen keyboard involved: a numeric PIN with a fixed pad is
 * faster and far more error-tolerant than a text field on a tablet.
 */

const KEY_SIZE = 88;

export interface PinPadProps {
    /** Number of digits entered so far — drives the filled dots. */
    length: number;
    /** Total digits required. */
    maxLength?: number;
    onDigit?: (digit: string) => void;
    onBackspace?: () => void;
    /** Renders the dots in the error color and shakes nothing — motion is noise here. */
    isError?: boolean;
    isDisabled?: boolean;
    /** Contrast mode: the pad sits on the dark lock screen by default. */
    tone?: "onDark" | "onLight";
}

const PinKey = ({
    children,
    onClick,
    tone,
    isDisabled,
    label,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    tone: "onDark" | "onLight";
    isDisabled?: boolean;
    label: string;
}) => (
    <ButtonBase
        aria-label={label}
        disabled={isDisabled}
        onClick={onClick}
        sx={{
            width: KEY_SIZE,
            height: KEY_SIZE,
            borderRadius: `${radius.lg}px`,
            fontSize: 32,
            fontWeight: 500,
            fontFamily: fontFamily.mono,
            transition: "background-color 80ms linear",
            ...(tone === "onDark"
                ? {
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.10)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
                      "&.Mui-disabled": { color: "rgba(255,255,255,0.3)" },
                  }
                : {
                      color: "text.primary",
                      bgcolor: "action.hover",
                      "&:hover": { bgcolor: "action.selected" },
                  }),
        }}
    >
        {children}
    </ButtonBase>
);

export const PinPad = ({ length, maxLength = 4, onDigit, onBackspace, isError, isDisabled, tone = "onDark" }: PinPadProps) => {
    const dotColor = isError ? "#f4695f" : tone === "onDark" ? "#fff" : "var(--mui-palette-primary-main)";
    const dotEmpty = tone === "onDark" ? "rgba(255,255,255,0.25)" : "var(--mui-palette-divider)";

    return (
        <Stack spacing={4} sx={{ alignItems: "center" }}>
            {/* Entry indicator. Dots rather than digits: the guest is standing
                on the other side of the counter and can read a 32px numeral. */}
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", minHeight: 28 }}>
                {Array.from({ length: maxLength }).map((_, i) => (
                    <Box
                        key={i}
                        sx={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            bgcolor: i < length ? dotColor : "transparent",
                            border: "2px solid",
                            borderColor: i < length ? dotColor : dotEmpty,
                            transition: "background-color 80ms linear, border-color 80ms linear",
                        }}
                    />
                ))}
            </Stack>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: `repeat(3, ${KEY_SIZE}px)`,
                    gap: `${touchTarget.minGap * 1.5}px`,
                    justifyContent: "center",
                }}
            >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                    <PinKey key={digit} label={digit} tone={tone} isDisabled={isDisabled} onClick={() => onDigit?.(digit)}>
                        {digit}
                    </PinKey>
                ))}

                {/* Bottom row keeps 0 centered under 8 — muscle memory beats
                    filling the grid, so the empty cell stays empty. */}
                <Box />
                <PinKey label="0" tone={tone} isDisabled={isDisabled} onClick={() => onDigit?.("0")}>
                    0
                </PinKey>
                <PinKey label="Backspace" tone={tone} isDisabled={isDisabled} onClick={onBackspace}>
                    <BackspaceOutlinedIcon sx={{ fontSize: 30 }} />
                </PinKey>
            </Box>
        </Stack>
    );
};

/** Small helper used by the stories to label the pad without duplicating copy. */
export const PinPrompt = ({ title, hint, isError }: { title: string; hint?: string; isError?: boolean }) => (
    <Stack spacing={0.75} sx={{ alignItems: "center", textAlign: "center" }}>
        <Typography variant="h5" sx={{ color: "#fff" }}>
            {title}
        </Typography>
        {hint && (
            <Typography variant="body1" sx={{ color: isError ? "#f4695f" : "rgba(255,255,255,0.7)" }}>
                {hint}
            </Typography>
        )}
    </Stack>
);
