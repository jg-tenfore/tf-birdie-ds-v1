import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { formatMoney, type TransactionOrder } from "../refund-data";
import {
    AmountPane,
    ItemSelectRow,
    ModalFooter,
    ReasonPicker,
    RefundComplete,
    RefundModal,
    RefundTotals,
    ScopeTabs,
    SelectAllRow,
    ShortfallNote,
    TenderSplit,
} from "./refund-modal-parts";
import { useRefundDraft, type RefundDraftSeed } from "./use-refund-draft";

/**
 * **Option B — one question per step.**
 *
 * The same three decisions, in sequence: *what goes back* → *where it goes and
 * why* → done. Each surface holds one question, so nothing scrolls on a
 * six-line order and the operator is never reading two decisions at once.
 *
 * It follows the shape of the reference flow in
 * `references/100626/RefundFlow-new`, with two departures that matter:
 *
 * - **The amount is in the header from step 1 onward.** The reference hides the
 *   figure until the last screen; a counter refunding in front of a guest needs
 *   it in view the whole way.
 * - **The split is on step 2, with amounts.** The reference asks only which
 *   tender; this prints what each one takes, because an operator who checks two
 *   boxes without seeing $25.00 / $17.34 is in exactly the position Weston was
 *   in on the call.
 *
 * The cost of this shape: a whole-order refund is a page turn longer than
 * Option A, and the tender split cannot be seen while the basket is being
 * chosen — if the split is wrong you go back a step to fix the selection.
 */
export const OptionBStepped = ({
    order,
    reversalOrderId,
    onClose,
    seed,
    openAt = 1,
}: {
    order: TransactionOrder;
    reversalOrderId: string;
    onClose?: () => void;
    /** Stories open the modal in the state they are about; the rest is live. */
    seed?: RefundDraftSeed;
    openAt?: 1 | 2 | 3;
}) => {
    const draft = useRefundDraft(order, seed);
    const [step, setStep] = useState<1 | 2 | 3>(openAt);

    if (step === 3) {
        return (
            <RefundModal title="Refund complete" onClose={onClose}>
                <RefundComplete
                    total={draft.breakdown.total}
                    allocations={draft.allocations}
                    reversalOrderId={reversalOrderId}
                    onDone={onClose}
                />
            </RefundModal>
        );
    }

    if (step === 2) {
        return (
            <RefundModal
                title={`Refund ${formatMoney(draft.breakdown.total)}`}
                caption="Step 2 of 2"
                onClose={onClose}
                footer={
                    <ModalFooter
                        total={draft.breakdown.total}
                        hint={draft.blockerShort ?? "This creates a reversal order"}
                        primaryLabel={`Refund ${formatMoney(draft.breakdown.total)}`}
                        primaryDisabled={!draft.isComplete}
                        committing
                        onPrimary={() => setStep(3)}
                        onCancel={() => setStep(1)}
                    />
                }
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box>
                        <TenderSplit
                            payments={order.payments}
                            selected={draft.selectedTenders}
                            allocations={draft.allocations}
                            onToggle={draft.toggleTender}
                        />
                        {draft.shortfall && <ShortfallNote message={draft.shortfall} />}
                    </Box>

                    <ReasonPicker value={draft.reason} note={draft.note} onChange={draft.setReason} onNoteChange={draft.setNote} />

                    <Box sx={{ p: 2, bgcolor: appColors.canvas }}>
                        <RefundTotals breakdown={draft.breakdown} dense />
                    </Box>
                </Box>
            </RefundModal>
        );
    }

    return (
        <RefundModal
            title="Issue refund"
            caption="Step 1 of 2"
            onClose={onClose}
            padBody={false}
            footer={
                <ModalFooter
                    total={draft.breakdown.total}
                    hint={draft.breakdown.total > 0 ? "Items chosen" : (draft.blockerShort ?? undefined)}
                    primaryLabel="Next"
                    primaryDisabled={draft.breakdown.total <= 0}
                    onPrimary={() => setStep(2)}
                    onCancel={onClose}
                />
            }
        >
            {/* The basket scrolls; the total it adds up to does not. */}
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 2, py: 2 }}>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, mb: 2, px: 1.25 }}>
                        Order #{order.orderId} · {formatMoney(order.total)} · {order.customerName}
                    </Typography>

                    <ScopeTabs value={draft.scope} onChange={draft.setScope} />

                    {draft.scope === "items" ? (
                        <Box>
                            <SelectAllRow
                                checked={draft.allSelected}
                                indeterminate={!draft.allSelected && draft.someSelected}
                                onToggle={draft.toggleAll}
                            />
                            {draft.lines.map((line) => (
                                <ItemSelectRow
                                    key={line.name}
                                    line={line}
                                    amount={(line.linePrice / line.soldQuantity) * line.quantity}
                                    onToggle={() => draft.toggleLine(line.name)}
                                    onQuantityChange={(next) => draft.setLineQuantity(line.name, next)}
                                />
                            ))}
                        </Box>
                    ) : (
                        <AmountPane value={draft.amountText} refundable={order.total} onChange={draft.setAmountText} />
                    )}
                </Box>

                <Box
                    sx={{
                        flexShrink: 0,
                        px: 3,
                        py: 1.5,
                        bgcolor: appColors.canvas,
                        borderTop: "1px solid",
                        borderColor: appColors.divider,
                    }}
                >
                    <RefundTotals breakdown={draft.breakdown} dense />
                </Box>
            </Box>
        </RefundModal>
    );
};

export default OptionBStepped;
