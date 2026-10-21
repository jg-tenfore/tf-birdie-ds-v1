import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderPanel, OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import {
    giftCardAmount,
    giftCardFrom,
    giftCardTo,
    giftCardTypes,
    phoneSearchResults,
    toSearchResults,
} from "@/components/screens/gift-cards/gift-card-data";
import { CreateGiftCard, UpcDialog } from "@/components/screens/gift-cards/gift-card-screens";

/**
 * **Create a Gift Card, one screen at a time.** Transcribed from
 * `references/102226/giftCards/`.
 *
 * One canvas does five jobs — how much, which barcode, what kind, who from,
 * who to — and then SAVE drops a single line in the order. Every flaw below is
 * reproduced rather than corrected.
 *
 * **[End to end](?path=/story/flows-gift-cards-current-state-end-to-end--sell-a-purchased-gift-card)**
 * runs the whole path.
 */
const meta = {
    title: "Flows/Gift Cards/Current state/Screens",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Shell = ({ children, overlay }: { children: React.ReactNode; overlay?: React.ReactNode }) => (
    <AppShell
        title="Create a Gift Card"
        active="proshop"
        overlay={overlay}
        orderPanel={
            <OrderPanel>
                <OrderPanelEmpty />
            </OrderPanel>
        }
        actionBar={
            <>
                <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                <ActionButton tone="primary">SAVE</ActionButton>
            </>
        }
    >
        {children}
    </AppShell>
);

/**
 * **How the screen opens.**
 *
 * The largest control on the canvas is the white box top-left, and it is
 * **captioned by nothing at all** — no label, no placeholder, no currency
 * symbol. The only way to learn it is the amount is to tap it and watch a
 * number keypad come up.
 *
 * Two more things arrive already decided. The expiry reads **AUGUST 19 2122**,
 * ninety-six years out, with nothing saying whether that is policy, a sentinel
 * for *never*, or a bug. And all four spend categories are **ticked**, with
 * nothing saying what unticking Alcohol would stop the card paying for.
 *
 * Eight search fields, none marked required. SAVE is live from this frame.
 */
export const Empty: Story = {
    name: "1 — Create a gift card",
    render: () => (
        <Shell>
            <CreateGiftCard />
        </Shell>
    ),
};

/**
 * **Finding the buyer.**
 *
 * Typing a phone number into the FROM block raises a sheet of matching
 * records. One hit here, and picking it writes the name and the Golf Course
 * Customer ID into the heading above the fields.
 *
 * The dropdown is live — tap the row.
 */
export const FromSearch: Story = {
    name: "2 — Finding the buyer",
    render: function FromSearchStory() {
        const [from, setFrom] = useState<typeof giftCardFrom | undefined>(undefined);

        return (
            <Shell>
                <CreateGiftCard
                    amount={giftCardAmount}
                    from={from}
                    activeField={from ? undefined : "from-phone"}
                    results={
                        from
                            ? undefined
                            : {
                                  field: "from-phone",
                                  items: [{ name: "Justin Girard", email: giftCardFrom.email, phone: giftCardFrom.phone }],
                              }
                    }
                    onField={() => undefined}
                    onPick={() => setFrom(giftCardFrom)}
                />
            </Shell>
        );
    },
};

/**
 * **Finding the recipient — the screen's worst moment.**
 *
 * Typing `Weston` returns **six records**, four of them the same person
 * distinguished only by a `+tag` on one email address, one named for a
 * booking-window setting rather than a human, and one headed by a bare
 * `(tr456)` that appears nowhere else on the screen.
 *
 * Underneath, the TO block's Email and Phone are showing **red error glyphs**
 * — while the search that will fill them is still open. The screen is marking
 * a field invalid for not yet containing something the operator is in the
 * middle of choosing.
 */
export const ToSearch: Story = {
    name: "3 — Finding the recipient",
    render: () => (
        <Shell>
            <CreateGiftCard
                amount={giftCardAmount}
                from={giftCardFrom}
                showToErrors
                activeField="to-last"
                results={{ field: "to-last", items: toSearchResults }}
            />
        </Shell>
    ),
};

/**
 * **The database, unedited.**
 *
 * The same search by phone number. `Fake Name`, `buster douglas`,
 * `pee@poo.com`, `BLOCK Tournament` — four records sharing one phone number,
 * returned to a counter mid-sale with nothing to tell them apart by.
 *
 * A gift card issued to the wrong one of these is money moved to a stranger,
 * and the screen offers no member number, no last visit, no balance.
 */
export const PhoneSearch: Story = {
    name: "4 — Four records, one phone number",
    render: () => (
        <Shell>
            <CreateGiftCard
                amount={giftCardAmount}
                from={giftCardFrom}
                showToErrors
                activeField="to-phone"
                results={{ field: "to-phone", items: phoneSearchResults }}
            />
        </Shell>
    ),
};

/**
 * **Both parties attached.**
 *
 * The headings now carry the names and the Golf Course Customer IDs —
 * `1499612` for the buyer, `423505` for the recipient — and the red glyphs are
 * gone.
 *
 * Note what the recipient's heading says: **Weston Senior**. The row picked
 * was `Weston Senior - Senior`, a customer record whose name is a membership
 * tier. The device prints it as a person.
 */
export const Filled: Story = {
    name: "5 — Both parties attached",
    render: () => (
        <Shell>
            <CreateGiftCard amount={giftCardAmount} from={giftCardFrom} to={giftCardTo} />
        </Shell>
    ),
};

/**
 * **The dialog SAVE opens.**
 *
 * It fires because the UPC box was left empty — which the screen itself calls
 * *optional* — and it explains a server behaviour rather than asking anything.
 *
 * **CANCEL is red and OK is green**, so the destructive-looking colour is on
 * the action that keeps your work and the reassuring one is on the action that
 * commits. It is the last thing between an operator and a $200 card.
 */
export const Upc: Story = {
    name: "6 — The UPC dialog",
    render: () => (
        <Shell overlay={<UpcDialog />}>
            <CreateGiftCard amount={giftCardAmount} from={giftCardFrom} to={giftCardTo} />
        </Shell>
    ),
};

/**
 * **The second type in the dropdown.**
 *
 * The captures never open the type menu — every screen reads `Purchased Gift
 * Card` — so this second entry is **invented**: a promotional card is issued
 * rather than sold, lands in the order at $0.00 and settles with no tender.
 *
 * If the real second type is something else, this is the first thing in the
 * folder to correct. Tap the dropdown to switch it.
 */
export const Promotional: Story = {
    name: "7 — Promotional type (unverified)",
    render: function PromotionalStory() {
        const [type, setType] = useState<(typeof giftCardTypes)[number]>(giftCardTypes[1]);

        return (
            <Shell>
                <CreateGiftCard amount="0.00" type={type} from={giftCardFrom} to={giftCardTo} onType={setType} />
            </Shell>
        );
    },
};
