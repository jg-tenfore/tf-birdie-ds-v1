import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { camp, clinicSummary, usd } from "@/components/concepts/clinics/102026/clinic-availability";
import { ClinicListA, ClinicSessionsA } from "@/components/concepts/clinics/102026/option-a-counts";
import { ClinicListB, ClinicSessionsB } from "@/components/concepts/clinics/102026/option-b-roster";
import { ClinicBookingC } from "@/components/concepts/clinics/102026/option-c-guest-first";

/**
 * **Oct 20 — three ways to fix the clinic screens.**
 *
 * From Weston's walkthrough: the `10` on the clinic card is the maximum roster,
 * not availability; a guest can be taken through the whole registration and
 * only hit the limit at the end; the session view needs per-date availability;
 * and the empty order shelf should go.
 *
 * All three versions fix those four things. They differ in how far they move
 * from what ships:
 *
 * | | **A — Counts in place** | **B — Roster first** | **C — Guest first** |
 * | :-- | :-- | :-- | :-- |
 * | Change | Same screens, labelled | Chips become rows | The job is reordered |
 * | Dates | Chips, each with a count | A table with fill meters | Cards, checked against the guest |
 * | Guest | The six fields, kept | The six fields, under the dates | One search, first |
 * | Price | A line under the dates | A summary bar | A running rail |
 * | Risk | Lowest | Medium | Highest |
 *
 * Every story is live — tap the dates.
 *
 * The availability numbers are invented: the device never shows a remaining
 * count, which is the complaint. The two sessions it marks `(FULL)` are the
 * only real ones.
 */
const meta = {
    title: "Flows/Clinics/102026/Options",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const openSessions = camp.sessions.filter((session) => session.spotsLeft > 0).map((session) => session.label);

/** The clinic screen chrome, minus the order panel Weston asked to remove. */
const ClinicShell = ({ title, children, saveLabel }: { title: string; children: React.ReactNode; saveLabel: string }) => (
    <AppShell
        title={title}
        active="proshop"
        actionBar={
            <>
                <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                <ActionButton tone="primary">{saveLabel}</ActionButton>
            </>
        }
    >
        {children}
    </AppShell>
);

/* ----------------------------------------------------------- option A */

/**
 * **A — the clinic list.**
 *
 * The bare `10` is gone. The card says how many dates are still open, how many
 * places that is in total, and when the next one is — three facts that answer
 * *"can I get my daughter in?"* without opening anything.
 */
export const AList: Story = {
    name: "A — Clinic list",
    render: () => (
        <ClinicShell title="Clinics" saveLabel="SAVE">
            <ClinicListA />
        </ClinicShell>
    ),
};

/**
 * **A — choosing dates.**
 *
 * The same chips, now carrying their own count, with the full ones greyed and
 * stripped of the radio that invited a tap. The empty order panel is gone, so
 * the customer search sits above the fold instead of below it, and a price line
 * appears under the dates.
 *
 * Tap the chips: the count at the bottom follows.
 */
export const ASessions: Story = {
    name: "A — Choose dates",
    render: function AStory() {
        const [selected, setSelected] = useState<string[]>([]);
        const total = camp.sessions.filter((s) => selected.includes(s.label)).reduce((sum, s) => sum + s.price, 0);

        return (
            <ClinicShell title={camp.name} saveLabel={selected.length ? `SAVE · ${usd(total)}` : "SAVE"}>
                <ClinicSessionsA
                    selected={selected}
                    onToggle={(label) => setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))}
                    onSelectAll={() => setSelected(openSessions)}
                />
            </ClinicShell>
        );
    },
};

/* ----------------------------------------------------------- option B */

/**
 * **B — the clinic list.**
 *
 * The card leads with the roster: a fill bar, *23 of 100 places taken across 10
 * dates*, and the price per session. A counter can see how healthy the clinic
 * is before opening it — the question a manager asks, not just the one a parent
 * asks.
 */
export const BList: Story = {
    name: "B — Clinic list",
    render: () => (
        <ClinicShell title="Clinics" saveLabel="SAVE">
            <ClinicListB />
        </ClinicShell>
    ),
};

/**
 * **B — choosing dates.**
 *
 * Chips become rows: date, time, a fill meter, the count, the price. Ten rows
 * in columns are read down; ten chips of text have to be read one at a time.
 *
 * The nearly-full dates are the ones that matter, and amber finds them down a
 * single column. The total sits in a bar above the action bar, so money is on
 * screen the whole time.
 */
export const BSessions: Story = {
    name: "B — Choose dates",
    render: function BStory() {
        const [selected, setSelected] = useState<string[]>([]);
        const total = camp.sessions.filter((s) => selected.includes(s.label)).reduce((sum, s) => sum + s.price, 0);

        return (
            <ClinicShell title={camp.name} saveLabel={selected.length ? `SAVE · ${usd(total)}` : "SAVE"}>
                <ClinicSessionsB
                    selected={selected}
                    onToggle={(label) => setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))}
                    onSelectAll={() => setSelected(openSessions)}
                />
            </ClinicShell>
        );
    },
};

/* ----------------------------------------------------------- option C */

/**
 * **C — the guest, before the dates.**
 *
 * One search field instead of six, and *Add new guest* beside it. The six on
 * the shipping screen are all ways of naming the same person.
 */
export const CGuest: Story = {
    name: "C — Who is it for",
    render: () => (
        <ClinicShell title={camp.name} saveLabel="ADD TO ORDER">
            <ClinicBookingC guest={null} />
        </ClinicShell>
    ),
};

/**
 * **C — dates, checked against that guest.**
 *
 * Because the app knows who is being booked, **10/8 reads "Already booked"** and
 * cannot be chosen again — the one check the current design cannot make, since
 * it never learns the guest until after the dates.
 *
 * The rail on the right is the booking as it is built: the guest, each date,
 * each price, the total. Nothing is a surprise at the till.
 */
export const CDates: Story = {
    name: "C — Which dates",
    render: function CStory() {
        const [selected, setSelected] = useState<string[]>(["10/6/26 2:00 PM", "10/15/26 2:00 PM"]);
        const total = camp.sessions.filter((s) => selected.includes(s.label)).reduce((sum, s) => sum + s.price, 0);

        return (
            <ClinicShell title={camp.name} saveLabel={`ADD TO ORDER · ${usd(total)}`}>
                <ClinicBookingC
                    selected={selected}
                    onToggle={(label) => setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))}
                />
            </ClinicShell>
        );
    },
};

/**
 * **C — nothing chosen yet.**
 *
 * The guest is set and the rail explains itself rather than sitting empty —
 * the thing the shipping order panel never does.
 */
export const CEmpty: Story = {
    name: "C — Before any date is picked",
    render: () => (
        <ClinicShell title={camp.name} saveLabel="ADD TO ORDER">
            <ClinicBookingC selected={[]} />
        </ClinicShell>
    ),
};

/**
 * All ten dates, so the three options can be compared on a full clinic:
 * **{@link ASessions}**, **{@link BSessions}**, **{@link CDates}** — same data,
 * same decision, three shapes.
 */
export const CFull: Story = {
    name: "C — Every open date chosen",
    render: () => (
        <ClinicShell
            title={camp.name}
            saveLabel={`ADD TO ORDER · ${usd(clinicSummary(camp.sessions).openSessions * camp.sessions[0].price)}`}
        >
            <ClinicBookingC selected={openSessions.filter((label) => label !== "10/8/26 2:00 PM")} />
        </ClinicShell>
    ),
};
