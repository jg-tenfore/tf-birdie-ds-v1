import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { AddCustomerAction } from "@/components/screens/operations/customer-search-chrome";
import { CustomerResultsList, CustomerSearchField, westonResults } from "@/components/screens/operations/customer-search-panel";

/**
 * Matches for "weston". The list is fuzzy across all three fields, which is why
 * "Tony Finau" and "Randy Orton" appear — their *emails* contain the query.
 * Membership and customer-type names are appended to the display name, and the
 * first row carries a bold italic code above it.
 */
const meta = {
    title: "App Screens/11-customerSearch/Search results",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction}>
            <CustomerSearchField value="weston" />
            <CustomerResultsList results={westonResults} />
        </AppShell>
    ),
};
