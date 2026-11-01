import type { Meta, StoryObj } from "@storybook/react-vite";

import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import ReplayIcon from "@mui/icons-material/Replay";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { BayWorkspace } from "@/components/concepts/bay-sheet/103026/bay-workspace";

/**
 * **A day on the bay sheet, start to finish.**
 *
 * The same component the V2 prototype runs, so what happens here happens
 * there. Nothing is staged — the day is real state and every dialog changes
 * it.
 *
 * ## Things worth doing
 *
 * 1. **Book a bay.** Tap any blank slot. Search `maya` — a guest, no punch
 *    card — pick a duration, and watch the fee follow. Book it and the chip
 *    appears where you tapped.
 * 2. **Try to double-book.** Tap 11:00 in Blue Bay, where Riley already has
 *    two hours. The warning names who has it, and there is no way past it.
 * 3. **Hit the limit.** Book `justin` anywhere. He already holds two today, so
 *    the amber warning appears **with a switch** — compare it with the red one
 *    above, which has none.
 * 4. **Use a punch card.** Book `avery` for 90 minutes. She has one punch and
 *    it needs two; the panel shows the shortfall instead of hiding it.
 * 5. **Edit a standing booking.** Open the 1:00 in Teal Bay. Change its
 *    duration and the fee and the punch count move with it. Note the line
 *    above: changes apply to this occurrence only.
 * 6. **Open a tab.** Open the 9:00 in Orange Bay and tap OPEN TAB. The chip
 *    gains its receipt mark on the sheet.
 * 7. **Cancel something, then book over it.** Cancel any reservation; its chip
 *    turns to paper and the time is bookable again.
 * 8. **Block a bay**, and give the block a repeat.
 *
 * ## What the run shows that a screenshot cannot
 *
 * **The two guards behave differently.** One refuses, one warns and lets you
 * through. That distinction is the whole of requirements 10 and 18, and it
 * only reads when you hit both.
 *
 * **Cancelling gives time back.** Requirement 27 is a sentence in the PRD and
 * a visible change here: the chip stops being a booking and the slot under it
 * starts answering taps again.
 *
 * **The fee is never typed.** Change who, when, how long or which bay, and it
 * recalculates — requirement 23, which is easy to agree to on paper and easy
 * to get wrong in a build.
 */
const meta = {
    title: "Bay Sheet Oct 30/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The sheet as staff would find it at the start of a shift. */
export const RunTheDay: Story = {
    name: "Run the day",
    render: () => (
        <AppShell
            title="Bay Sheet"
            active="baysheet"
            showOverflow={false}
            actionBar={
                <>
                    <ActionButton icon={<ReplayIcon />}>REFRESH</ActionButton>
                    <ActionButton icon={<BlockIcon />}>ADD BLOCK</ActionButton>
                    <ActionButton tone="primary" icon={<AddIcon />}>
                        NEW RESERVATION
                    </ActionButton>
                </>
            }
        >
            <BayWorkspace />
        </AppShell>
    ),
};
