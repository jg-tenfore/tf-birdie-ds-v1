import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { camp, clinicSummary, usd } from "@/components/concepts/clinics/102026/clinic-availability";
import { ClinicBookingC } from "@/components/concepts/clinics/102026/option-c-guest-first";

/**
 * **C — the guest, first.** The furthest of the three, and the only one that
 * changes the order of the job.
 *
 * Guest first, dates second, with the booking building in a rail as it goes.
 * Because the app knows who is being booked, a date the guest already holds
 * reads **Already booked** and cannot be taken twice — the one availability
 * check the current design cannot make.
 *
 * Every story is live: tap the dates.
 */
const meta = {
    title: "Flows/Clinics/102026/Option C — Guest first/Screens",
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
 * **C — the guest, before the dates.**
 *
 * One search field instead of six, and *Add new guest* beside it. The six on
 * the shipping screen are all ways of naming the same person.
 */
export const CGuest: Story = {
    name: "C — Who is it for",
    render: () => (
        <ClinicShell title={camp.name} saveLabel="ADD TO ORDER">
            <ClinicBookingC guest={null} step={0} />
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
                    step={1}
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
