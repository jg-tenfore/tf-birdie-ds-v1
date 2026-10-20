import type { Meta, StoryObj } from "@storybook/react-vite";

import { ClinicJourney } from "@/components/concepts/clinics/clinic-journey";
import { camp, sessionDate, SESSION_PRICE, usd } from "@/components/concepts/clinics/102026/clinic-availability";
import { ClinicListB, ClinicSessionsB } from "@/components/concepts/clinics/102026/option-b-roster";

/**
 * **B, start to finish.**
 *
 * The clinic card leads with a fill bar, and the dates are a table — date,
 * time, meter, count, price — under a header that says how the whole clinic is
 * filling. The running total sits above the action bar the entire time.
 *
 * Worth watching on the way through: the nearly-full dates are found down one
 * column rather than read chip by chip.
 */
const meta = {
    title: "Flows/Clinics/102026/Option B — Roster first/End to end",
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
            renderSessions={({ selected, toggle, selectAll }) => (
                <ClinicSessionsB selected={selected} onToggle={toggle} onSelectAll={selectAll} />
            )}
            linesFor={linesFor}
            saveLabel={(selected) => (selected.length === 0 ? "SAVE" : `SAVE · ${usd(selected.length * SESSION_PRICE)}`)}
        />
    ),
};
