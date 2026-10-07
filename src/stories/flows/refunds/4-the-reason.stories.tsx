import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { CreateRefund, linesFromOrder } from "@/components/concepts/refunds/create-refund";
import { DialogScrim, RefundReasonDialog } from "@/components/concepts/refunds/refund-reason-dialog";
import { proShopOrder } from "@/components/concepts/refunds/refund-data";

/**
 * **Step 4 — the reason.**
 *
 * A press of REFUND that passes the coverage check opens one dialog: *Why are
 * you issuing this refund?* — a field and a green OK over the dimmed screen.
 *
 * It is the last gate before the money moves, and it is not a confirmation. It
 * repeats no amount, no tender, no item count. A counter who has mis-set a
 * stepper has nothing here to catch it; what they get instead is a prompt to
 * explain a refund whose figures are now off-screen.
 *
 * Two smaller things, both worth fixing in whatever replaces this:
 *
 * - **There is no Cancel.** OK is the only control on the sheet.
 * - **The colors invert.** The refund was committed with a red button; it is
 *   confirmed with a green one.
 *
 * And the field itself decides whether refund reasons are ever reportable. Free
 * text, no suggestions, no minimum — at a queue it collects what one hand can
 * type.
 */
const meta = {
    title: "Flows/Refunds/4 — The reason",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The dialog over the refund it is confirming, scrim and all. Type in it. */
const ReasonPrompt = ({ reason: initial = "" }: { reason?: string }) => {
    const [reason, setReason] = useState(initial);
    const lines = linesFromOrder(proShopOrder).map((line) => (line.name === "Bubly Lime" ? { ...line, quantity: 0 } : line));

    return (
        <AppShell
            title="Create a Refund"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                    <ActionButton tone="danger">REFUND</ActionButton>
                </>
            }
            overlay={
                <DialogScrim>
                    <RefundReasonDialog value={reason} onChange={setReason} />
                </DialogScrim>
            }
        >
            <CreateRefund lines={lines} payments={proShopOrder.payments} selected={["Cash", "Gift Card"]} />
        </AppShell>
    );
};

/**
 * As it appears: empty field, cursor waiting.
 *
 * Behind the scrim is $42.34 across two tenders — legible here only because the
 * dialog is narrow enough to read around, which is not something to rely on.
 */
export const Empty: Story = {
    name: "The prompt",
    render: () => <ReasonPrompt />,
};

/**
 * A realistic answer, which is to say a short one.
 *
 * "wrong size" is what this field collects in practice. If refund reasons are
 * meant to be reported on later, the control has to do more than accept a
 * string.
 */
export const Typed: Story = {
    name: "A typical answer",
    render: () => <ReasonPrompt reason="wrong size" />,
};
