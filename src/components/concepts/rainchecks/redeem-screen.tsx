import type { ReactNode } from "react";

import Stack from "@mui/material/Stack";
import BoltIcon from "@mui/icons-material/Bolt";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { checkoutCustomer, checkoutTotals } from "@/components/screens/checkout/checkout-fixtures";
import { CheckoutTicketPane, TenderTabs, type CheckoutTicketPaneProps, type TenderTab } from "@/components/screens/checkout/checkout-panes";

/**
 * **Concept — Aug 24.** The shipping redeem screen, with the RAIN panel swapped.
 *
 * This is [Flows → Rainchecks → 4 — Redeem at the register] rebuilt from its own
 * parts rather than approximated: the same `AppShell`, the same
 * `CheckoutTicketPane`, the same `TenderTabs`, the same action bar. Nothing
 * about the screen changes except **the contents of the RAIN panel**, which is
 * the only thing this feedback is about.
 *
 * Composed here rather than by adding a slot to `CheckoutBody`, because both
 * pieces it needs are already exported and a concept has no business reaching
 * into a shipping replica to change it.
 *
 * The ticket is the fixture's real $53.48 one. Weston's telling says "$100" —
 * the figure is not the point, and using the screen's own numbers keeps this a
 * comparison rather than a redrawing.
 */
export interface RedeemScreenProps {
    /** Whatever replaces the RAIN panel body. */
    children: ReactNode;
    /** Lights the commit button, exactly as the shipping story does. */
    canApply?: boolean;
    onApply?: () => void;
    applyLabel?: string;
    ticket?: Partial<CheckoutTicketPaneProps>;
}

const PANE_BG = "#F4F6F8";

/**
 * The screen below the app bar: ticket on the left, tender tabs and one panel on
 * the right.
 *
 * Exported separately so the start-to-finish flow can put a narration band above
 * it without ending up with two app bars.
 */
export const RedeemBody = ({
    children,
    ticket,
    tab = "RAIN",
    onTab,
}: {
    children: ReactNode;
    ticket?: Partial<CheckoutTicketPaneProps>;
    tab?: TenderTab;
    onTab?: (tab: TenderTab) => void;
}) => (
    <Stack direction="row" sx={{ height: "100%", minHeight: 0 }}>
        <CheckoutTicketPane {...ticket} />
        <Stack sx={{ flex: 1, minWidth: 0, bgcolor: PANE_BG }}>
            <TenderTabs active={tab} onChange={onTab} />
            <Stack sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</Stack>
        </Stack>
    </Stack>
);

export const RedeemScreen = ({ children, canApply, onApply, applyLabel = "Apply Raincheck", ticket }: RedeemScreenProps) => (
    <AppShell
        title="Credit Card Payment"
        active="proshop"
        accountLabel="Join Admin"
        actionBar={
            <>
                <ActionButton icon={<GolfCourseIcon />}>Tee Sheet</ActionButton>
                <ActionButton icon={<StorefrontIcon />}>Pro Shop</ActionButton>
                <ActionButton icon={<PersonIcon />}>{checkoutCustomer}</ActionButton>
                <ActionButton icon={<NotesIcon />}>Order Notes</ActionButton>
                <ActionButton icon={<BoltIcon />} tone={canApply ? "primary" : "disabled"} grow={1.6} onClick={onApply}>
                    {applyLabel}
                </ActionButton>
            </>
        }
    >
        <RedeemBody ticket={ticket}>{children}</RedeemBody>
    </AppShell>
);

/** What the ticket owes, so panels can say whether a credit clears it. */
export const TICKET_OWED = checkoutTotals.total;
