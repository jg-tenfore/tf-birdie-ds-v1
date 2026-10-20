import type { Meta, StoryObj } from "@storybook/react-vite";

import { ClinicJourney } from "@/components/concepts/clinics/clinic-journey";
import { clinicOrderLines, girlsSummerCamp, selectableSessions } from "@/components/screens/clinics/clinic-data";
import { ClinicList, ClinicSessionPicker } from "@/components/screens/clinics/clinic-screens";

/**
 * **Selling a clinic, start to finish — as it ships.**
 *
 * The whole path in one component: the Pro Shop grid, the clinic list, the
 * session picker, the order, payment, the receipt, and back to the grid.
 *
 * ## The walkthrough
 *
 * 1. Tap the **Clinics** tile in the grid.
 * 2. Open **Girls Summer Camp**. The card says `Camp 10` — that is the
 *    maximum roster, not the places left, and nothing on screen says so.
 * 3. Pick dates, or **SELECT ALL**. The two `(FULL)` sessions stay out of it;
 *    the other eight tell you nothing about how full they are.
 * 4. **SAVE**, and the booking lands in the order.
 * 5. Pay, and read the receipt.
 *
 * ## What the run shows that a screenshot cannot
 *
 * **No number arrives until step 4.** Not a price, not a remaining count —
 * four screens of work before the first figure, which is Weston's complaint
 * stated as a sequence: *"users can fill out full registration and only hit the
 * limit at the very end."*
 *
 * **The empty order panel follows you** through both clinic screens, holding a
 * third of the canvas and saying `No items in order.`
 *
 * **The clinic is named twice, differently.** The order panel prints its blurb,
 * *Come learn the game!*; the receipt prints *Girls Summer Camp*.
 */
const meta = {
    title: "Flows/Clinics/Current state/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Start on the **Clinics** tile.
 *
 * The order the booking produces is the device's own: **three lines** at $0.00,
 * $22.47 and $44.94 no matter how many sessions were chosen, each printing the
 * clinic's blurb and none of them naming a date. Nobody on the call could
 * explain the $0.00 line, so it is reproduced rather than tidied.
 */
export const SellAClinic: Story = {
    name: "Sell a clinic",
    render: () => (
        <ClinicJourney
            showOrderPanel
            selectableSessions={selectableSessions}
            renderList={({ open }) => <ClinicList clinics={[girlsSummerCamp]} onOpen={open} />}
            renderSessions={({ selected, toggle, selectAll }) => (
                <ClinicSessionPicker clinic={girlsSummerCamp} selected={selected} onToggle={toggle} onSelectAll={selectAll} />
            )}
            linesFor={(booked) => (booked.length === 0 ? [] : clinicOrderLines)}
        />
    ),
};
