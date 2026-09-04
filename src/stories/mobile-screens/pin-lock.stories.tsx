import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobilePin } from "@/components/mobile/screens/mobile-pin";

/**
 * **PIN lock — the handheld's front door.** From the Sept 4 reference capture.
 *
 * Not the tablet's sign-in narrowed. The counter terminal uses a 690px text
 * field, which assumes a hardware keyboard beside it; a handheld has neither the
 * keyboard nor the width, and asking the OS for one would put a four-digit entry
 * behind a QWERTY layout with half the screen covered.
 *
 * So it borrows the pattern every phone already uses to unlock itself — the one
 * interaction an operator has performed a thousand times.
 *
 * **What came from the capture is the structure**, not the paint: dots instead
 * of a field, a keypad instead of the OS keyboard, and half the screen left
 * empty so the keys fall under a thumb. The ground stays `appColors.navy` and
 * the Tenfore mark stays, because the lock screen and the terminal's front door
 * should not look like two different products.
 */
const meta = {
    title: "Mobile Screens/PIN lock",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Live.** Tap the keys and watch the dots fill; the fourth digit submits.
 *
 * There is no confirm key, and that is deliberate: the PIN is fixed-length, so a
 * confirm button would be a tap that can only ever mean *"yes, I meant those
 * four"*.
 *
 * Note what has no chrome. Ten of the twelve keys are bare numerals — boxes
 * would add ten rectangles competing with the two keys that genuinely differ.
 * Each key is still a **110 × 72dp** target; the generous spacing is hit area,
 * not decoration.
 */
export const Default: Story = { name: "Enter your PIN", render: () => <MobilePin /> };

/** Two digits in. The filled dots are the only feedback, and the only feedback needed. */
export const PartlyEntered: Story = { name: "Two digits entered", render: () => <MobilePin value="12" /> };

/**
 * **A wrong PIN.** The dots shake and clear.
 *
 * The error is spent on the dots rather than on a message, because the operator
 * already knows what went wrong — there is exactly one thing that can.
 */
export const Error: Story = { name: "Wrong PIN", render: () => <MobilePin value="1234" error /> };

/**
 * **Six digits**, for a course that wants a longer code.
 *
 * The dot row is fixed-width, so a longer PIN tightens the spacing rather than
 * pushing the keypad down — the keys must not move between terminals.
 */
export const SixDigit: Story = { name: "Six-digit PIN", render: () => <MobilePin length={6} value="1234" /> };
