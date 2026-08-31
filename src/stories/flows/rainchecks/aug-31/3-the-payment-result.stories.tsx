import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";

import { OrderCompleteCredit } from "@/components/concepts/rainchecks/order-complete-credit";
import { raincheckById } from "@/data/rainchecks";

/**
 * **Aug 31 — the chosen solution. The payment result.**
 *
 * > *"This info should also be available in the raincheck payment result."*
 *
 * The shipping screen reads "Cash Tendered" and an amount, whatever the tender
 * actually was. Nothing on it names the raincheck, the round it came from, the
 * course that issued it, or what is left.
 *
 * So the sale that empties a credit produces **no record the customer can
 * hold**, and the next conversation starts from nothing — which is the same
 * failure as the search, one step later. Fixing the tender without fixing this
 * means the counter answers the question well once and then loses the answer.
 *
 * **This is where the History tab gets its content.** Every line the tender
 * reads out three months from now — *"used up 5/02 at Falls Road"* — exists
 * because a receipt like this recorded it. Carried forward from Aug 24
 * unchanged; choosing Option B does not change what a receipt should say.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 31/3 — The payment result",
    parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: React.ReactNode }) => <Box sx={{ width: 720, height: 620, display: "flex" }}>{children}</Box>;

/**
 * **A credit with money left on it.**
 *
 * The customer walks away knowing the id, the round it was cut from, what this
 * sale drew and what remains — so the next visit does not begin with *"I think
 * I have a raincheck"*.
 */
export const PartlyUsed: Story = {
    name: "Some left on it",
    render: () => (
        <Frame>
            <OrderCompleteCredit credit={raincheckById("41331")!} applied={53.48} orderNumber="5741002" total={53.48} />
        </Frame>
    ),
};

/**
 * **The sale that empties a credit** — the one quoted back months later.
 *
 * This is the receipt whose absence caused the incident. `#38204` was issued at
 * **Falls Road**, and the block says so, because a credit honoured away from the
 * course that cut it is exactly the fact nobody can reconstruct afterwards.
 */
export const Emptied: Story = {
    name: "The sale that empties it",
    render: () => (
        <Frame>
            <OrderCompleteCredit
                credit={raincheckById("38204")!}
                applied={14.76}
                orderNumber="5741118"
                total={38.5}
                remainingTender={{ label: "Credit Card", amount: 23.74 }}
            />
        </Frame>
    ),
};

/**
 * A credit issued at another course and honoured here.
 *
 * The amber line is deliberate. In a multi-course operation this is ordinary,
 * and it is still the single most useful thing to have printed when somebody
 * asks about it later.
 */
export const IssuedElsewhere: Story = {
    name: "Issued at another course",
    render: () => (
        <Frame>
            <OrderCompleteCredit credit={raincheckById("22470")!} applied={49.67} orderNumber="5741204" total={49.67} />
        </Frame>
    ),
};
