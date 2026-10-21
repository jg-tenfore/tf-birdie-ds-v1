import type { Meta, StoryObj } from "@storybook/react-vite";

import { ClinicFlow } from "@/components/concepts/clinics/102126/clinic-flow";
import { ClinicBookingA, openLabelsA } from "@/components/concepts/clinics/102126/option-a-repeat";

/**
 * **A, start to finish — and then again.**
 *
 * The whole path: the Pro Shop grid, twenty clinics with a search, the dates,
 * the guest, the order, payment, the receipt.
 *
 * ## The walkthrough
 *
 * 1. Tap the **Clinics** tile.
 * 2. Search, or scroll. Open any clinic — the greyed rows have nothing left.
 * 3. Pick dates, or **SELECT ALL OPEN**. Tap **NEXT**.
 * 4. The guest. Tap **SAVE**, and the booking lands in the cart.
 * 5. **Now tap Clinics again.** That is the part worth running.
 *
 * ## What step 5 shows
 *
 * The cart keeps what it had, and the guest comes with you. Open the same
 * clinic and the dates return ticked — *"you selected these, you're just
 * changing the customer."* Open a different one and the dates start empty while
 * the name stays — *"I click on chipping, my info is already there because I
 * added to the cart. I just have to select the dates."*
 *
 * Registering four people is still four trips. This version's claim is that
 * trips two, three and four cost almost nothing.
 *
 * ## What the order says
 *
 * **One line per date, named and dated.** The shipping flow drops three lines
 * reading *Come learn the game!* with no dates on them however many sessions
 * were picked; a counter reading that order cannot tell what was sold.
 */
const meta = {
    title: "Flows/Clinics/102126/Option A — One at a time/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start on the **Clinics** tile in the Pro Shop grid. */
export const SellAClinic: Story = {
    name: "Sell a clinic",
    render: () => (
        <ClinicFlow
            steps={2}
            recallDates
            selectAllFor={(clinic) => openLabelsA(clinic)}
            canAdvance={({ step, selected }) => (step === 0 ? selected.length > 0 : true)}
            renderBooking={({ clinic, selected, step, guest, toggle, selectAll, setStep, clearGuest }) => (
                <ClinicBookingA
                    clinic={clinic}
                    selected={selected}
                    step={step}
                    guest={guest}
                    onToggle={toggle}
                    onSelectAll={selectAll}
                    onStep={setStep}
                    onClearGuest={clearGuest}
                />
            )}
        />
    ),
};
