import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderPanel, OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { membershipCustomer, soldMembership } from "@/components/screens/memberships/membership-data";
import { MembershipForm, MembershipList } from "@/components/screens/memberships/membership-screens";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";

/**
 * **Memberships, one screen at a time.** Transcribed from
 * `references/102226/memberships/`.
 *
 * Two screens: a grid of everything the course has ever configured, and a form
 * that sells one of them.
 *
 * **[End to end](?path=/story/flows-memberships-current-state-end-to-end--sell-a-membership)**
 * runs the whole path.
 */
const meta = {
    title: "Flows/Memberships/Current state/Screens",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Shell = ({ title, children, actionBar }: { title: string; children: React.ReactNode; actionBar: React.ReactNode }) => (
    <AppShell
        title={title}
        active="proshop"
        orderPanel={
            <OrderPanel>
                <OrderPanelEmpty />
            </OrderPanel>
        }
        actionBar={actionBar}
    >
        {children}
    </AppShell>
);

/**
 * **The catalogue.**
 *
 * Eighteen memberships in three columns under two tiles that are **filters
 * drawn as products** — same footprint, a logo where the price goes, and
 * nothing saying that tapping one replaces the grid beneath it.
 *
 * The list has never been weeded. `Beta Compare`, `July QA`, `a new
 * membership`, `Cheapos`, `Jeremy Weekday Mem` sit beside the real ones with
 * no way to tell which is which.
 *
 * And read down the price column: **$0.00** on four of them, **$611.25** on
 * *Free Punches*, **$999.00** on *Limited Member*, and **-$490.20** on
 * *Monthly Credit* — a negative number in a screen whose only job is to take
 * money. There is no search, no sort and no grouping beyond the two tiles.
 *
 * Tap `testing` to see the filter work.
 */
export const List: Story = {
    name: "1 — The catalogue",
    render: function ListStory() {
        const [group, setGroup] = useState<string | undefined>(undefined);

        return (
            <Shell title="Pro Shop Order" actionBar={<ProShopActions showBack onBack={() => setGroup(undefined)} />}>
                <MembershipList group={group} onGroup={setGroup} />
            </Shell>
        );
    },
};

/**
 * **The `testing` group.**
 *
 * Eighteen memberships become two. The group tiles vanish with them, so the
 * only way back out is the BACK button in the action bar — which on the grid
 * itself is not there at all.
 */
export const Filtered: Story = {
    name: "2 — Filtered to a group",
    render: () => (
        <Shell title="Pro Shop Order" actionBar={<ProShopActions showBack />}>
            <MembershipList group="testing" />
        </Shell>
    ),
};

/**
 * **The form, as it opens.**
 *
 * Six searches and two numbers on one canvas. Three things to settle before
 * anyone builds from this:
 *
 * 1. **The price is not the tile's price.** `Austin Membership` costs $1.00 in
 *    the catalogue; this form opens on **$0.32**, and the tile's figure is
 *    never shown again.
 * 2. **`First month type / Prorated` is a sentence, not a control.** It sits in
 *    a column of fields with no affordance, and it is the only hint on screen
 *    that the two numbers are related.
 * 3. **`Enter quantity to pay for now`** asks a billing question in a text box,
 *    beside the customer's phone number.
 *
 * Nothing is marked required, and SAVE is live from this frame.
 */
export const Form: Story = {
    name: "3 — The membership form",
    render: () => (
        <Shell
            title={soldMembership.name}
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                    <ActionButton tone="primary">SAVE</ActionButton>
                </>
            }
        >
            <MembershipForm />
        </Shell>
    ),
};

/**
 * **The form, with a customer attached.**
 *
 * The search filled four fields and the Golf Course Customer ID — but the ID
 * **stays greyed out** after it fills, so the one field holding a real answer
 * is the one that reads as disabled.
 *
 * `Member Number` is still empty. On a screen selling a membership, nothing
 * says whether that is a problem.
 */
export const Filled: Story = {
    name: "4 — Customer attached",
    render: () => (
        <Shell
            title={soldMembership.name}
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                    <ActionButton tone="primary">SAVE</ActionButton>
                </>
            }
        >
            <MembershipForm customer={membershipCustomer} />
        </Shell>
    ),
};
