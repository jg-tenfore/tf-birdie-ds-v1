import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { camp, usd } from "@/components/concepts/clinics/102026/clinic-availability";
import { ClinicListB, ClinicSessionsB } from "@/components/concepts/clinics/102026/option-b-roster";

/**
 * **B — roster first.** A clinic is a roster with dates attached, so this
 * version leads with how full it is and turns the dates into rows.
 *
 * A row holds what a chip cannot: the date, the time, a fill meter, the count
 * and the price. Ten rows in columns are read down; ten chips are read one at
 * a time.
 *
 * Both stories are live: tap the rows.
 */
const meta = {
    title: "Flows/Clinics/102026/Option B — Roster first/Screens",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const openSessions = camp.sessions.filter((session) => session.spotsLeft > 0).map((session) => session.label);

/** The clinic chrome, minus the order panel Weston asked to remove. */
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

/**
 * **B — step 2, the guest.**
 *
 * The name fields are their own step now rather than a second half of the
 * dates screen. It opens with what step 1 decided — the dates and the total —
 * so the guest is attached to something visible.
 *
 * The bar at the top shows the first step finished and allows a tap back to it.
 */
export const BGuest: Story = {
    name: "B — Guest details",
    render: function BGuestStory() {
        const [step, setStep] = useState(1);
        const chosen = ["10/6/26 2:00 PM", "10/22/26 2:00 PM", "11/3/26 1:00 PM"];
        const total = camp.sessions.filter((s) => chosen.includes(s.label)).reduce((sum, s) => sum + s.price, 0);

        return (
            <ClinicShell title={camp.name} saveLabel={`SAVE · ${usd(total)}`}>
                <ClinicSessionsB selected={chosen} step={step} onStep={setStep} />
            </ClinicShell>
        );
    },
};
