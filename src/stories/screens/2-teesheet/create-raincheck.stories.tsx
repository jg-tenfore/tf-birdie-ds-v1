import { useState } from "react";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BoltIcon from "@mui/icons-material/Bolt";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { RaincheckForm } from "@/components/screens/tee-sheet/raincheck-form";

/**
 * **Create raincheck** — the screen behind a paid booking's **Raincheck** button.
 *
 * A round the weather cut short is refunded in proportion to what is left of it:
 * an 18-hole round abandoned after 5 holes returns 13/18, printed
 * `$72.22 (72%)`. The radios are the only input on the screen, and they stop at
 * 17 — a completed round has nothing to give back.
 *
 * Two things are worth arguing about in a redesign. The result sits *above* the
 * control that produces it, so the number moves when you touch something below
 * it and nothing connects the two. And the chips at the bottom — the other
 * positions on the same tee time — silently change which round is being
 * refunded, which means they can change the price and the hole count on the left
 * as well.
 *
 * The credit this screen creates is the same object the register's RAIN tender
 * spends. **Flows → Rainchecks** walks the whole loop, from the booking that
 * earns one to the receipt that spends it.
 */
const meta = { title: "App Screens/2-teesheet/Create raincheck", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** Live — move the radios and watch the credit and the percentage follow. */
export const Default: Story = {
    render: function CreateRaincheckStory() {
        const [holesPlayed, setHolesPlayed] = useState(5);
        const [player, setPlayer] = useState("10314910");

        return (
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
            </AppShell>
        );
    },
};
