import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { touchTarget } from "@/theme/tokens";

/**
 * Stepper — for multi-step flows where the operator needs to know how much is
 * left. Register close-out is the canonical one.
 *
 * Horizontal is the landscape default: it consumes ~72px of height rather than
 * the several hundred a vertical stepper eats, and height is the scarce axis.
 */
const meta = {
    title: "Components/Navigation/Stepper",
    component: Stepper,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const closeoutSteps = ["Count drawer", "Reconcile card batch", "Review voids", "Print report"];

export const Horizontal: Story = {
    render: () => (
        <Stack spacing={4} sx={{ p: 3 }}>
            <Stepper activeStep={1}>
                {closeoutSteps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box sx={{ p: 4, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", minHeight: 200 }}>
                <Typography variant="h5">Reconcile card batch</Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
                    47 transactions · $8,412.60 expected
                </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
                <Button variant="outlined" size="large">
                    Back
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button size="large" sx={{ minHeight: touchTarget.large, minWidth: 200 }}>
                    Continue
                </Button>
            </Stack>
        </Stack>
    ),
};

export const Alternative: Story = {
    name: "Alternative label",
    render: () => (
        <Box sx={{ p: 3 }}>
            <Stepper activeStep={2} alternativeLabel>
                {closeoutSteps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 3, maxWidth: 680 }}>
                Labels below the dots, which reads better across a wide canvas — the connector lines stay long
                enough to show direction.
            </Typography>
        </Box>
    ),
};

export const WithError: Story = {
    name: "With error",
    render: () => (
        <Box sx={{ p: 3 }}>
            <Stepper activeStep={2}>
                <Step>
                    <StepLabel>Count drawer</StepLabel>
                </Step>
                <Step>
                    <StepLabel>Reconcile card batch</StepLabel>
                </Step>
                <Step>
                    <StepLabel error optional={<Typography variant="caption" sx={{ color: "error.main" }}>$12.40 short</Typography>}>
                        Review voids
                    </StepLabel>
                </Step>
                <Step>
                    <StepLabel>Print report</StepLabel>
                </Step>
            </Stepper>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 3, maxWidth: 680 }}>
                The error carries the number. "$12.40 short" tells the operator what to go looking for;
                a red dot alone tells them only that something is wrong.
            </Typography>
        </Box>
    ),
};

export const Vertical: Story = {
    render: () => (
        <Stack direction="row" spacing={4} sx={{ p: 3 }}>
            <Stepper activeStep={1} orientation="vertical" sx={{ minWidth: 280 }}>
                {closeoutSteps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420, alignSelf: "center" }}>
                Vertical works when it sits *beside* the content rather than above it — a left rail of steps
                with the form on the right. Stacking steps above content spends height we don't have.
            </Typography>
        </Stack>
    ),
};
