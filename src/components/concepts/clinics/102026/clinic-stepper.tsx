import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";

import { appColors } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";

/**
 * **Two steps, stated.**
 *
 * Both B and C ask two separate questions — which dates, and who for — and the
 * shipping screen stacks them on one canvas with no heading between them, so
 * the relationship between a row of dates and a bank of name fields is left to
 * be inferred.
 *
 * This is the bar that separates them: numbered, named, and showing where the
 * operator is. A finished step keeps its place and gains a check, so going back
 * is visibly allowed rather than a guess.
 *
 * It is drawn from the app's own parts — slate for the step in hand, green for
 * one that is done, the same grey rule the screens use elsewhere — so it reads
 * as the product rather than a new pattern.
 */
export interface Step {
    label: string;
    /** A word on what the step collects, shown under the label. */
    hint?: string;
}

export const ClinicStepper = ({ steps, current, onStep }: { steps: Step[]; current: number; onStep?: (index: number) => void }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "stretch",
            gap: 1,
            px: 3,
            py: 1.5,
            bgcolor: appColors.surface,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        {steps.map((step, index) => {
            const done = index < current;
            const active = index === current;
            // Only a finished step can be returned to: stepping forward is the
            // primary action's job, not this bar's.
            const reachable = done && Boolean(onStep);

            return (
                <Box
                    key={step.label}
                    onClick={reachable ? () => onStep?.(index) : undefined}
                    role={reachable ? "button" : undefined}
                    aria-current={active ? "step" : undefined}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        minHeight: touchTarget.min,
                        px: 2,
                        cursor: reachable ? "pointer" : "default",
                        opacity: active || done ? 1 : 0.55,
                    }}
                >
                    <Box
                        sx={{
                            width: 28,
                            height: 28,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "50%",
                            bgcolor: done ? appColors.green : active ? appColors.slate : "transparent",
                            border: done || active ? "none" : "1px solid",
                            borderColor: appColors.textSecondary,
                            color: done || active ? "#fff" : appColors.textSecondary,
                            fontSize: 15,
                        }}
                    >
                        {done ? <CheckIcon sx={{ fontSize: 17 }} /> : index + 1}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: 16,
                                fontWeight: active ? 500 : 400,
                                color: appColors.textPrimary,
                                lineHeight: 1.2,
                            }}
                        >
                            {step.label}
                        </Typography>
                        {step.hint && <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{step.hint}</Typography>}
                    </Box>

                    {index < steps.length - 1 && (
                        <Box sx={{ width: 32, height: "1px", ml: 1.5, bgcolor: appColors.divider, alignSelf: "center" }} />
                    )}
                </Box>
            );
        })}
    </Box>
);

export default ClinicStepper;
