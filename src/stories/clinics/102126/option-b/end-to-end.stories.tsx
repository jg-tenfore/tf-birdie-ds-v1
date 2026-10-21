import type { Meta, StoryObj } from "@storybook/react-vite";

import { ClinicFlow } from "@/components/concepts/clinics/102126/clinic-flow";
import { ClinicBookingB, openLabelsB } from "@/components/concepts/clinics/102126/option-b-party";

/**
 * **B, start to finish.**
 *
 * The whole path with the party question in front of it: the Pro Shop grid,
 * twenty clinics with a search, **1 Players**, **2 Dates**, **3 Who they are**,
 * the order, payment, the receipt.
 *
 * ## The walkthrough
 *
 * 1. Tap the **Clinics** tile, then open a clinic.
 * 2. **Say how many players.** Each tile shows how many dates that number fits.
 * 3. Pick dates. Anything that cannot seat the party is greyed, with the reason
 *    on the row.
 * 4. Name them — one card per player.
 * 5. **SAVE**, pay, read the receipt.
 *
 * ## What the run shows that a screenshot cannot
 *
 * **The error never happens.** Weston's worry was the validation: *"what if one
 * session has one availability but another one you selected has two? We'd have
 * to throw an error there."* Asking first turns that error into a filter — go
 * back to step 1, raise the party, and watch dates drop out of step 2 before
 * anything is committed.
 *
 * **Changing the party clears the dates.** A selection made for two is not
 * valid for four, so it is dropped rather than silently re-checked. That is a
 * real cost of asking first, and it is on screen rather than in a footnote.
 *
 * **One party, one set of dates.** Someone who needs different dates is a
 * second booking — the names carry over, so it is the Option A path with a head
 * start. Whether that is the right call is the question this round leaves open.
 */
const meta = {
    title: "Flows/Clinics/102126/Option B — Party up front/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start on the **Clinics** tile in the Pro Shop grid. */
export const SellAClinic: Story = {
    name: "Sell a clinic",
    render: () => (
        <ClinicFlow
            steps={3}
            selectAllFor={(clinic, party) => openLabelsB(clinic, party)}
            canAdvance={({ step, selected }) => (step === 1 ? selected.length > 0 : true)}
            renderBooking={({ clinic, selected, party, step, guest, toggle, selectAll, setParty, setStep }) => (
                <ClinicBookingB
                    clinic={clinic}
                    party={party}
                    selected={selected}
                    step={step}
                    guest={guest}
                    onParty={setParty}
                    onToggle={toggle}
                    onSelectAll={selectAll}
                    onStep={setStep}
                />
            )}
        />
    ),
};
