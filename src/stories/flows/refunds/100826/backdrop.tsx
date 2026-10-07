import type { ReactNode } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLookupResults } from "@/components/concepts/refunds/order-lookup-results";
import { RefundedTransactionDetails } from "@/components/concepts/refunds/100826/refunded-transaction-details";
import { emptyLedger, type RefundLedger } from "@/components/concepts/refunds/100826/refund-ledger";
import { TransactionDetails } from "@/components/concepts/refunds/transaction-details";
import { dayOrderRows, type TransactionOrder } from "@/components/concepts/refunds/refund-data";

/**
 * The transaction a modal is refunding, behind the modal.
 *
 * Pass a `ledger` and the order behind the sheet shows what it has already
 * given back — which is what the second-refund stories are about.
 */
export const RefundBackdrop = ({
    order,
    ledger = emptyLedger,
    refundDisabled = false,
    children,
}: {
    order: TransactionOrder;
    ledger?: RefundLedger;
    /** True once the order has nothing left to refund. */
    refundDisabled?: boolean;
    children?: ReactNode;
}) => {
    const touched = Object.keys(ledger.byItem).length > 0;

    return (
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
                    <ActionButton tone="danger" disabled={refundDisabled}>
                        REFUND
                    </ActionButton>
                </>
            }
        >
            {touched ? <RefundedTransactionDetails order={order} ledger={ledger} /> : <TransactionDetails order={order} />}
        </AppShell>
    );
};

/** The list the flow lands back on, with the reversal orders on top. */
export const RefundResultsScreen = () => (
    <AppShell
        title="Order Lookup Results"
        active="orderlookup"
        accountLabel=""
        showLogOut={false}
        showOverflow={false}
        actionBar={<ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>}
    >
        <OrderLookupResults rows={dayOrderRows} />
    </AppShell>
);

export default RefundBackdrop;
