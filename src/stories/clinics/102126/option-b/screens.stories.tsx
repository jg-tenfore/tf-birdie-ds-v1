import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { clinicById, usd } from "@/components/concepts/clinics/102126/clinic-catalog";
import { ClinicSearchList } from "@/components/concepts/clinics/102126/clinic-parts";
import { DEMO_GUEST } from "@/components/concepts/clinics/102126/clinic-flow";
import { ClinicBookingB, openLabelsB } from "@/components/concepts/clinics/102126/option-b-party";

/**
 * **B — the party, up front.** The number of players is asked before the dates,
 * so the dates can answer it: anything that cannot seat the whole party is
 * never offered.
 *
 * Every story here is live. On **Choose dates**, change the party size on the
 * first step and watch the table change under it.
 */
const meta = {
    title: "Flows/Clinics/102126/Option B — Party up front/Screens",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const camp = clinicById("girls-summer-camp");

const ClinicShell = ({ title, children, primary }: { title: string; children: React.ReactNode; primary: string }) => (
    <AppShell
        title={title}
        active="proshop"
        actionBar={
            <>
                <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                <ActionButton tone="primary">{primary}</ActionButton>
            </>
        }
    >
        {children}
    </AppShell>
);

/**
 * **The clinic list** — the same twenty rows and the same search as Option A.
 * The two versions are identical up to the moment a clinic is opened.
 */
export const BList: Story = {
    name: "B — Clinic list",
    render: () => (
        <ClinicShell title="Clinics" primary="SAVE">
            <ClinicSearchList />
        </ClinicShell>
    ),
};

/**
 * **Step 1 — how many players.**
 *
 * The question Weston agreed to ask first:
 *
 * > — *"Do you want to ask up front how many people you want to register,
 * >   before we get into this step, just so it can hone down the spots that are
 * >   available?"*
 * > — *"Yeah, yeah."*
 *
 * Each tile says what the choice will cost before it is made: on this clinic,
 * a party of 1 fits 8 dates and a party of 6 fits 3. Nobody picks a number and
 * then discovers the calendar emptied.
 *
 * The line underneath states the rule this version runs on — one party, one set
 * of dates — and names the way out of it.
 */
export const BParty: Story = {
    name: "B — How many players",
    render: function BPartyStory() {
        const [party, setParty] = useState(1);

        return (
            <ClinicShell title={camp.name} primary="NEXT">
                <ClinicBookingB clinic={camp} party={party} step={0} onParty={setParty} />
            </ClinicShell>
        );
    },
};

/**
 * **Step 2 — the dates, filtered.**
 *
 * This starts at a **party of three**. Look down the meter column: the dates
 * with one and two places left are out, greyed like a full date, and each one
 * says why — `Needs 3 — only 1 left`.
 *
 * Weston's version of the same sentence: *"this one spot left — you could put
 * one spot left, but this won't work for 2 participants, so it's greyed out."*
 *
 * The price column shows what the date costs **for the party**, not per head,
 * so the running total on the button is never a surprise. Tap step 1 in the bar
 * to change the number and watch the table redraw.
 */
export const BDates: Story = {
    name: "B — Choose dates",
    render: function BDatesStory() {
        const [party, setParty] = useState(3);
        const [selected, setSelected] = useState<string[]>([]);
        const [step, setStep] = useState(1);
        const total = selected.length * camp.price * party;

        return (
            <ClinicShell title={camp.name} primary={selected.length ? `NEXT · ${usd(total)}` : "NEXT"}>
                <ClinicBookingB
                    clinic={camp}
                    party={party}
                    selected={selected}
                    step={step}
                    onParty={(count) => {
                        setParty(count);
                        setSelected([]);
                    }}
                    onToggle={(label) => setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))}
                    onSelectAll={() => setSelected(openLabelsB(camp, party))}
                    onStep={setStep}
                />
            </ClinicShell>
        );
    },
};

/**
 * **Step 3 — who they are.**
 *
 * One card per player, numbered, each with its own search. Player 1 arrives
 * filled in when the cart already holds a booking, the same recall Option A
 * uses; the rest are empty.
 *
 * The step carries the same two subtractions as Option A's guest step: no
 * clinic stats above it, no totals strip below it. The booking card at the top
 * is the confirmation, and the total is on the button.
 */
export const BPlayers: Story = {
    name: "B — Who they are",
    render: function BPlayersStory() {
        const [step, setStep] = useState(2);
        const party = 3;
        const chosen = ["10/27/26 2:00 PM", "10/29/26 2:00 PM"];

        return (
            <ClinicShell title={camp.name} primary={`SAVE · ${usd(chosen.length * camp.price * party)}`}>
                <ClinicBookingB clinic={camp} party={party} selected={chosen} step={step} guest={DEMO_GUEST} onStep={setStep} />
            </ClinicShell>
        );
    },
};
