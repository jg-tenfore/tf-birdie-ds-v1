import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { EditReservationScreen } from "@/components/screens/tee-sheet/tee-time-edit";

/**
 * **Edit reservation** — pricing for one player.
 *
 * Pushed from a card's Edit button; it takes the whole canvas and returns via
 * BACK. Three headers across the top: the guest, the booker (unknown here, so
 * dashes), and a Change Customer lookup with a green shortcut for spending
 * someone else's punchcards.
 *
 * Below that, two independently totalled fee groups. Green fees carry a
 * one-of-many rate selection — "Birdie (25%)" is filled navy — and an 18-holes
 * toggle; transportation fees are a separate list with their own SubTotal and
 * Grand Total. Splitting the totals lets a starter see which half of the price a
 * comp landed on.
 *
 * **SAVE FEES TO ALL** applies this selection to every player in the tee time,
 * which is why it sits beside SAVE rather than being folded into it.
 */
const meta = { title: "App Screens/2-teesheet/Edit reservation — fees", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell
            title=""
            active="teesheet"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosIcon />}>Back</ActionButton>
                    <ActionButton icon={<AddIcon />}>Add customer</ActionButton>
                    <ActionButton icon={<MailOutlinedIcon />}>Send email</ActionButton>
                    <ActionButton tone="primary" icon={<DoneAllIcon />}>
                        Save fees to all
                    </ActionButton>
                    <ActionButton tone="primary" icon={<CheckIcon />}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <EditReservationScreen />
        </AppShell>
    ),
};
