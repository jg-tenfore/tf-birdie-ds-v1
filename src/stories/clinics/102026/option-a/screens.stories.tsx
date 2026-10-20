import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { camp, usd } from "@/components/concepts/clinics/102026/clinic-availability";
import { ClinicListA, ClinicSessionsA } from "@/components/concepts/clinics/102026/option-a-counts";

/**
 * **A — counts in place.** The smallest change that answers the complaint.
 *
 * Same two screens, same controls, same order of operations. What changes is
 * that every number is labelled and availability is on screen from the first
 * tap — plus the empty order panel is gone and a price appears before SAVE.
 *
 * Both stories are live: tap the chips.
 */
const meta = {
    title: "Flows/Clinics/102026/Option A — Counts in place/Screens",
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
