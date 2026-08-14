import { useState } from "react";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BoltIcon from "@mui/icons-material/Bolt";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { RaincheckForm } from "@/components/screens/tee-sheet/raincheck-form";

/**
 * **Step 2 — how much is it worth.**
 *
 * One decision on the whole screen: how many holes were actually played. The
 * credit is the unplayed share of what was paid, so 5 of 18 returns 13/18 —
 * `$72.22 (72%)`. Move the radios and watch it follow.
 *
 * Three things to argue about here.
 *
 * **The answer sits above the question.** The amount is the output of the radios
 * below it, so the number moves when you touch something underneath and nothing
 * connects the two. It reads fine once you know the rule and is baffling before
 * then — and this screen is most people's first encounter with the rule.
 *
 * **Nothing is played by default.** The screen opens on 0, which is the most
 * generous refund it can produce. An operator who taps CREATE RAINCHECK without
 * reading has given the round back in full.
 *
 * **The chips change the subject silently.** They are the other positions on the
 * same tee time. Tapping one switches which round is being refunded, and because
 * players on one time can be on different rates, the price and hole count in the
 * left column change with it. There is no confirmation and no undo.
 */
const meta = {
    title: "Flows/Rainchecks/2 — Create raincheck",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: React.ReactNode }) => (
    <AppShell
        title="Raincheck"
        active="teesheet"
        accountLabel=""
        showLogOut={false}
        actionBar={
            <>
                <ActionButton icon={<ArrowBackIosNewIcon />}>Back</ActionButton>
                <ActionButton icon={<BoltIcon />} tone="primary" grow={1.6}>
                    Create Raincheck
                </ActionButton>
            </>
        }
    >
        {children}
    </AppShell>
);

/** Live. An 18-hole round at $100, five holes played. */
export const Default: Story = {
    name: "18 holes",
    render: function CreateRaincheckStory() {
        const [holesPlayed, setHolesPlayed] = useState(5);
        const [player, setPlayer] = useState("10314910");

        return (
            <Frame>
                <RaincheckForm
                    reservation={player}
                    customerEmail="weston.farnsworth+senior@tenfore.golf"
                    roundPrice={100}
                    totalHoles={18}
                    holesPlayed={holesPlayed}
                    onHolesPlayed={setHolesPlayed}
                    players={[{ id: "10314910", name: "Weston Senior" }, { id: "10314913" }]}
                    selectedPlayerId={player}
                    onSelectPlayer={setPlayer}
                />
            </Frame>
        );
    },
};

/**
 * A nine-hole round.
 *
 * The radio grid resizes to 0–8, and each hole is worth a ninth rather than an
 * eighteenth — so one hole played costs the customer more than twice what it
 * would on a full round. Same rule, and it is not obvious from the screen that
 * the denominator has changed.
 */
export const NineHoles: Story = {
    name: "9 holes",
    render: function NineHoleStory() {
        const [holesPlayed, setHolesPlayed] = useState(3);
        return (
            <Frame>
                <RaincheckForm
                    reservation="10390154"
                    customerEmail="jonah.hamlet@tenfore.golf"
                    roundPrice={23.25}
                    totalHoles={9}
                    holesPlayed={holesPlayed}
                    onHolesPlayed={setHolesPlayed}
                    players={[{ id: "10390154", name: "Hamlet, J." }]}
                    selectedPlayerId="10390154"
                />
            </Frame>
        );
    },
};

/**
 * The default state, in full.
 *
 * Nobody teed off, so the whole round comes back — `$100.00 (100%)`. Worth
 * sitting with: this is what the screen shows before anyone has made a decision,
 * and it is indistinguishable from a decision that has been made.
 */
export const NothingPlayed: Story = {
    name: "Nothing played — full refund",
    render: () => (
        <Frame>
            <RaincheckForm
                reservation="10314910"
                customerEmail="weston.farnsworth+senior@tenfore.golf"
                roundPrice={100}
                totalHoles={18}
                holesPlayed={0}
                players={[{ id: "10314910", name: "Weston Senior" }, { id: "10314913" }]}
                selectedPlayerId="10314910"
            />
        </Frame>
    ),
};
