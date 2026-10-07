import type { ReactNode } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { TransactionDetails } from "@/components/concepts/refunds/transaction-details";
import type { TransactionOrder } from "@/components/concepts/refunds/refund-data";

/**
 * The transaction the modal is refunding, behind the modal.
 *
 * Both options are shown in place rather than on a blank canvas, for one
 * reason: the refund is an act performed *on* an order, and the full-screen
 * screen it replaces loses that order the moment it opens. Keeping the receipt
 * visible on three sides is half the argument for a modal.
 *
 * The chrome here is the shipping app's, unchanged — the new work is the sheet
 * on top of it.
 */
export const RefundBackdrop = ({ order, children }: { order: TransactionOrder; children: ReactNode }) => (
    <AppShell
        title="Transaction Details"
        active="orderlookup"
        accountLabel=""
        showLogOut={false}
        overlay={children}
        actionBar={
            <>
                <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                <ActionButton icon={<ChevronLeftIcon />}>PRO SHOP</ActionButton>
                <ActionButton tone="danger">REFUND</ActionButton>
            </>
        }
    >
        <TransactionDetails order={order} />
    </AppShell>
);

export default RefundBackdrop;
