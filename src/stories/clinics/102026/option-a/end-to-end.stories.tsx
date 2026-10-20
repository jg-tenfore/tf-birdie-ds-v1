import type { Meta, StoryObj } from "@storybook/react-vite";

import { ClinicJourney } from "@/components/concepts/clinics/clinic-journey";
import { camp, sessionDate, SESSION_PRICE, usd } from "@/components/concepts/clinics/102026/clinic-availability";
import { ClinicListA, ClinicSessionsA } from "@/components/concepts/clinics/102026/option-a-counts";

/**
 * **A, start to finish.**
 *
 * The same five screens as today, with the counts in place: the card says how
 * many dates are open before anything is tapped, each chip carries its own
 * remaining count, the empty order shelf is gone, and the SAVE button carries
 * the price.
 *
 * Run it beside **Current state → End to end**: same number of taps, and the
 * roster is answered on screen two instead of never.
 */
const meta = {
    title: "Flows/Clinics/102026/Option A — Counts in place/End to end",
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
            renderList={({ open }) => <ClinicListA onOpen={open} />}
            renderSessions={({ selected, toggle, selectAll }) => (
                <ClinicSessionsA selected={selected} onToggle={toggle} onSelectAll={selectAll} />
            )}
            linesFor={linesFor}
            saveLabel={(selected) => (selected.length === 0 ? "SAVE" : `SAVE · ${usd(selected.length * SESSION_PRICE)}`)}
        />
    ),
};
