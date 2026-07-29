import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLookupForm } from "@/components/screens/operations/order-lookup-form";

/**
 * **Order Lookup** — find a past order by ID, by payment ID, or by what was on it.
 *
 * The left column scopes the search to one course and one day; the right column
 * holds the three ways in. The three fields are alternatives, not filters that
 * combine, and none of them are pre-filled. PRINT SNAPSHOT in the action bar
 * prints the day's summary for the scope on the left without searching at all.
 *
 * This screen drops the account / log-out cluster from the app bar and uses a
 * white canvas rather than the grey one every other screen sits on.
 */
const meta = {
    title: "App Screens/12-orderlookup",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The screen as it opens — scope set to today's date and the signed-in course. */
export const Search: Story = {
    render: () => (
        <AppShell
            title="Order Lookup"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            actionBar={
                <>
                    <ActionButton>
                        <ChevronLeftIcon sx={{ position: "absolute", left: 20 }} />
                        BACK
                    </ActionButton>
                    <ActionButton>
                        <PrintIcon sx={{ position: "absolute", left: 20 }} />
                        PRINT SNAPSHOT
                    </ActionButton>
                    <ActionButton tone="primary">
                        <SearchIcon sx={{ position: "absolute", left: 20 }} />
                        SEARCH
                    </ActionButton>
                </>
            }
        >
            <OrderLookupForm course="The Dunes of Delgado PROD" date="WEDNESDAY, JULY 29 2026" />
        </AppShell>
    ),
};
