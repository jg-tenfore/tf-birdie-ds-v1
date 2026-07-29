import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CheckIcon from "@mui/icons-material/Check";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { CartSignOutScreen } from "@/components/screens/tee-sheet/tee-time-edit";

/**
 * **Cart Sign Out.**
 *
 * A liability waiver captured on the tablet before the keys change hands.
 * Reservation number at the top, name prefilled from the booking, cart number
 * typed in, an unchecked consent box against the damage clause, and a signature
 * area under the "Sign Here" rule.
 *
 * Only two actions: BACK and SAVE. There is no way to skip the signature from
 * this screen.
 */
const meta = { title: "App Screens/2-teesheet/Cart sign out", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell
            title="Cart Sign Out"
            active="teesheet"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosIcon />}>Back</ActionButton>
                    <ActionButton tone="primary" icon={<CheckIcon />}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <CartSignOutScreen />
        </AppShell>
    ),
};
