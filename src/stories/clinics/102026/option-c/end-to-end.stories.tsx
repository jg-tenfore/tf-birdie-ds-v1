import type { Meta, StoryObj } from "@storybook/react-vite";

import { ClinicJourney } from "@/components/concepts/clinics/clinic-journey";
import { camp, sessionDate, SESSION_PRICE, usd } from "@/components/concepts/clinics/102026/clinic-availability";
import { ClinicListB } from "@/components/concepts/clinics/102026/option-b-roster";
import { ClinicBookingC } from "@/components/concepts/clinics/102026/option-c-guest-first";

/**
 * **C, start to finish.**
 *
 * The booking screen asks *who* before *when*, and the rail on the right builds
 * the order as the dates are picked. **10/8 reads "Already booked"** and cannot
 * be taken — the guest is known early enough to check.
 *
 * The clinic list is B's card, since C changes the booking screen rather than
 * the list; swap it if the list should differ too.
 */
const meta = {
    title: "Flows/Clinics/102026/Option C — Guest first/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const openSessions = camp.sessions.filter((session) => session.spotsLeft > 0).map((session) => session.label);

/**
 * One line per date, named and dated.
 *
 * The shipping flow drops three lines reading *Come learn the game!* with no
 * dates on them, however many sessions were chosen. Every version here books
 * what was actually picked, which is the least an order can say.
 */
const linesFor = (booked: string[]) =>
    booked.map((label) => ({
        id: label,
        name: `${camp.name} — ${sessionDate(camp.sessions.find((s) => s.label === label)!)}`,
        qty: 1,
        price: usd(SESSION_PRICE),
    }));

/** Start on the **Clinics** tile in the Pro Shop grid. */
export const SellAClinic: Story = {
    name: "Sell a clinic",
    render: () => (
        <ClinicJourney
            selectableSessions={openSessions}
            renderList={({ open }) => <ClinicListB onOpen={open} />}
            renderSessions={({ selected, toggle }) => <ClinicBookingC selected={selected} onToggle={toggle} />}
            linesFor={linesFor}
            saveLabel={(selected) => (selected.length === 0 ? "ADD TO ORDER" : `ADD TO ORDER · ${usd(selected.length * SESSION_PRICE)}`)}
        />
    ),
};
