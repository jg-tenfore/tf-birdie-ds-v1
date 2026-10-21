import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { clinicById, usd } from "@/components/concepts/clinics/102126/clinic-catalog";
import { ClinicSearchList } from "@/components/concepts/clinics/102126/clinic-parts";
import { DEMO_GUEST } from "@/components/concepts/clinics/102126/clinic-flow";
import { ClinicBookingA, openLabelsA } from "@/components/concepts/clinics/102126/option-a-repeat";

/**
 * **A — one at a time, remembered.** One booking is one person, exactly as the
 * device works today. What is new is that the second registration starts where
 * the first one ended.
 *
 * Every story here is live: type in the search, tap the rows, tap the steps.
 */
const meta = {
    title: "Flows/Clinics/102126/Option A — One at a time/Screens",
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
 * **The clinic list, with twenty in it.**
 *
 * Weston: *"Do like 20 — that's not unrealistic… I'm assuming you just scroll
 * and find the tile"* → *"a search would be great."* Both are here: the rows
 * scroll, and the field filters on name and category as you type. Try `junior`,
 * or `league`.
 *
 * Each row carries one figure, and it is the one he asked for — **`8 dates
 * still open`**, not the roster bar that used to sit there. A clinic with
 * nothing left is greyed and cannot be opened.
 *
 * This screen is shared with Option B; the two versions differ only after it.
 */
export const AList: Story = {
    name: "A — Clinic list",
    render: () => (
        <ClinicShell title="Clinics" primary="SAVE">
            <ClinicSearchList />
        </ClinicShell>
    ),
};

/**
 * **Choosing dates.**
 *
 * The rows that won the Oct 20 comparison: date, time, a fill meter, the count,
 * the price — read down a column rather than across a field of chips. Amber
 * finds the nearly-gone dates; a full date keeps its place, greyed, with no
 * checkbox to tap.
 *
 * The header above them lost its roster bar. *"That doesn't tell me anything…
 * if you just said that 8 dates are still open, then I know that they're
 * open."*
 */
export const ADates: Story = {
    name: "A — Choose dates",
    render: function ADatesStory() {
        const [selected, setSelected] = useState<string[]>([]);
        const total = selected.length * camp.price;

        return (
            <ClinicShell title={camp.name} primary={selected.length ? `NEXT · ${usd(total)}` : "NEXT"}>
                <ClinicBookingA
                    clinic={camp}
                    selected={selected}
                    onToggle={(label) => setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))}
                    onSelectAll={() => setSelected(openLabelsA(camp))}
                />
            </ClinicShell>
        );
    },
};

/**
 * **The guest step, stripped.**
 *
 * This is the screen from the two marked-up captures, with both marks acted on:
 *
 * - The clinic stats and fill bar that sat above the booking are **gone** —
 *   *"not really pertinent once you select the dates."*
 * - The `3 of 8 open dates chosen · $67.41` strip under the form is **gone** —
 *   *"we're showing it here, seems a little redundant."* The total is on the
 *   SAVE button, where it already was.
 *
 * What is left is what the step is for: the dates being bought, and who is
 * being bought them for.
 */
export const AGuest: Story = {
    name: "A — Guest details",
    render: function AGuestStory() {
        const [step, setStep] = useState(1);
        const chosen = ["10/27/26 2:00 PM", "10/29/26 2:00 PM", "11/3/26 1:00 PM"];

        return (
            <ClinicShell title={camp.name} primary={`SAVE · ${usd(chosen.length * camp.price)}`}>
                <ClinicBookingA clinic={camp} selected={chosen} step={step} onStep={setStep} />
            </ClinicShell>
        );
    },
};

/**
 * **The second registration.**
 *
 * The same step after a booking is already in the cart. Weston:
 *
 * > *"Once you add it, if you hit clinics again, it just saves all of your
 * > info. Like you selected these, you're just changing the customer."*
 *
 * The six fields arrive filled, with a band saying where they came from and a
 * **SOMEONE ELSE** action that empties them. For a parent registering a second
 * child, the work is one tap and two names; for the same guest in a second
 * clinic, it is no typing at all.
 *
 * Tap **SOMEONE ELSE** to see the empty state it falls back to.
 */
export const ARecall: Story = {
    name: "A — Guest carried over",
    render: function ARecallStory() {
        const [step, setStep] = useState(1);
        const [guest, setGuest] = useState<typeof DEMO_GUEST | undefined>(DEMO_GUEST);
        const chosen = ["10/27/26 2:00 PM", "10/29/26 2:00 PM", "11/3/26 1:00 PM"];

        return (
            <ClinicShell title={camp.name} primary={`SAVE · ${usd(chosen.length * camp.price)}`}>
                <ClinicBookingA
                    clinic={camp}
                    selected={chosen}
                    step={step}
                    guest={guest}
                    onStep={setStep}
                    onClearGuest={() => setGuest(undefined)}
                />
            </ClinicShell>
        );
    },
};
