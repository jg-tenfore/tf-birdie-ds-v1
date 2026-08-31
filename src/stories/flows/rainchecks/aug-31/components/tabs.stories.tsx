import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { RaincheckTabs, type CreditTab } from "@/components/concepts/rainchecks/aug-31/raincheck-tender";
import { appColors } from "@/theme/app-replica-tokens";
import { PaneFrame } from "./pane-frame";

/**
 * **Aug 31 → Components. The tab bar and its badge.**
 *
 * The control the whole solution is named for, on its own.
 *
 * ## Spec
 *
 * | | |
 * | :-- | :-- |
 * | Height | **52px** — above the 48dp touch floor, and the pane is behind a counter |
 * | Labels | `AVAILABLE` / `HISTORY`, ALL-CAPS, 15px, `letterSpacing: 0.06em` |
 * | Active | `appColors.greenTee` text and a 3px bottom border |
 * | Inactive | `appColors.textSecondary`, transparent border |
 * | Badge | `appColors.orange` pill, 22px, white 13px numerals, hidden at 0 |
 * | Roles | `role="tablist"` / `role="tab"` with `aria-selected` |
 *
 * ## Two things a developer will otherwise get wrong
 *
 * **The badge counts the cart customer's non-spendable credits — not search
 * results.** It is a property of who is on the ticket, so it must not move while
 * somebody types. A badge that changes under a search is reporting a different
 * fact from the one the operator read a second ago.
 *
 * **It is amber, not red.** A customer with spent rainchecks is an ordinary
 * fact, not an error, and the counter sees this on a good day as well as a bad
 * one.
 *
 * ## Why it is shaped differently from the tender strip above it
 *
 * The seven-tender strip (CREDIT / CASH / GIFT CARD / RAIN / …) is icons over
 * labels with its own underline. Two bands of tabs stacked on one pane will read
 * as one control unless they differ, so this one is text-only. Same job, one
 * level down, visibly subordinate.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 31/Components/Tabs & badge",
    parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ label, count, tab }: { label: string; count: number; tab: CreditTab }) => (
    <Stack sx={{ gap: 0.5 }}>
        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{label}</Typography>
        <RaincheckTabs tab={tab} onTab={() => {}} historyCount={count} />
    </Stack>
);

/** Every state the bar has, stacked so the badge threshold is visible at a glance. */
export const AllStates: Story = {
    name: "Every state",
    render: () => (
        <PaneFrame height="auto" note="890px — the real RAIN pane width">
            <Stack sx={{ gap: 2.5, p: 2 }}>
                <Row label="Available active · no history — the badge is suppressed at zero" count={0} tab="available" />
                <Row label="Available active · one past credit" count={1} tab="available" />
                <Row label="Available active · three past credits — the incident's customer" count={3} tab="available" />
                <Row label="History active" count={3} tab="history" />
            </Stack>
        </PaneFrame>
    ),
};

/** Tap it. Nothing but the bar — the state it drives lives in `RaincheckTender`. */
export const Interactive: Story = {
    render: function Interactive() {
        const [tab, setTab] = useState<CreditTab>("available");
        return (
            <PaneFrame height="auto">
                <RaincheckTabs tab={tab} onTab={setTab} historyCount={3} />
                <Typography sx={{ p: 2, fontSize: 14, color: appColors.textSecondary }}>
                    Active tab: <strong>{tab}</strong>
                </Typography>
            </PaneFrame>
        );
    },
};
