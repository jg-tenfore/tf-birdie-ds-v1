import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileShift } from "@/components/mobile/screens/mobile-shift";

/**
 * **Mobile Screens — 17-shift.** Close out the till and review past shifts.
 * Compare against `App Screens → 17-shift`.
 *
 * The tablet puts two unrelated things on one canvas: a **582px close-out form**
 * and a **six-column history table**, sharing no scroll, no grid and no heading.
 * They are side by side because there is 1290px and no reason not to be.
 *
 * 582 is wider than this entire screen, so they become the two bottom-nav
 * destinations this category uses whenever a landscape layout shows two
 * independent things at once.
 */
const meta = {
    title: "Mobile Screens/17-shift",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Open shift.** The screen as it opens on an active shift.
 *
 * Both filled-field states are on this one screen and both are preserved:
 * **Ending Cash Total** untouched, so its label still sits large on the
 * baseline; **Ending Check Total** prefilled with `0`, so its label has shrunk
 * to a caption above the value.
 *
 * The two readouts above them — User Name, Shift Date — were centred
 * label-over-value pairs with 40px of vertical gap, spending about 320px of
 * height on four short strings. As rows they take 128px.
 *
 * **Switch to History to see the narrowing that fixes a shipping defect.** The
 * tablet's six columns are fixed at 110 / 170 / 145 / 120 / 105 / 105 = 755px,
 * against roughly 708px of space beside the form — which is exactly why "End
 * Check" is clipped at the screen edge on the device. Stack the columns and
 * there is no column geometry left to clip, so End Check renders in full. It is
 * the only place in this category where a re-layout repairs something as a side
 * effect.
 *
 * One addition there: the open shift's End and End Cash cells read `----` in
 * the fixture, and among dated table rows that is enough to say "still
 * running". In a stacked row the dashes sit beside their own labels and read as
 * missing data, so the top row is labelled **Open**. Same fact, said in the form
 * the layout can carry.
 *
 * **END SHIFT is still live with the cash total blank**, exactly as it ships. A
 * red destructive primary, full width, because BACK is the app bar's job. That
 * defect is preserved rather than quietly fixed.
 */
export const OpenShift: Story = {
    name: "Open shift",
    render: () => <MobileShift />,
};
