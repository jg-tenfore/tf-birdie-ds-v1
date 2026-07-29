import Box from "@mui/material/Box";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { GiftCardSearchBar } from "@/components/screens/operations/gift-cards-search-bar";
import { GiftCardTableBody, GiftCardTableHeader, westonGiftCards, type GiftCardRow } from "@/components/screens/operations/gift-cards-table";

/**
 * Gift Cards — look up a customer's cards by name or number.
 *
 * Transcribed from `references/072926/14-giftcards/`. The screen is a search
 * field over an eight-column table and nothing else: no issue flow, no reload,
 * no balance adjustment. The app bar drops its usual account / log-out cluster
 * entirely, and the only bottom action is a single full-width BACK.
 *
 * Two behaviours worth noting because they are load-bearing and unlabelled:
 * results are returned with **no empty/`no results` message** (the pre-search
 * state is a bare canvas under the header band), and cards with a zero balance
 * are communicated purely by dimming the entire row.
 */
const meta = {
    title: "App Screens/14-giftcards",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const GiftCardsScreen = ({ query, rows }: { query?: string; rows: GiftCardRow[] }) => (
    <AppShell
        title="Gift Cards"
        active="giftcards"
        topBarRight={<Box />}
        subBar={
            <Box sx={{ flexShrink: 0 }}>
                <GiftCardSearchBar value={query} />
                <GiftCardTableHeader />
            </Box>
        }
        actionBar={
            <ActionButton grow={1} icon={<ChevronLeftIcon />}>
                Back
            </ActionButton>
        }
    >
        <GiftCardTableBody rows={rows} />
    </AppShell>
);

/**
 * How the screen opens. The column header band is already drawn over an empty
 * canvas, so the table reads as present-but-unfilled rather than absent.
 */
export const Empty: Story = {
    render: () => <GiftCardsScreen rows={[]} />,
};

/**
 * A search for "weston" — a mix of purchased cards and tournament winnings for
 * the same two customers. The two Tony Finau rows are dimmed: one is fully
 * spent, the other was issued at $0.00. Winnings cards carry no UPC.
 */
export const Results: Story = {
    render: () => <GiftCardsScreen query="weston" rows={westonGiftCards} />,
};

