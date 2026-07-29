import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { AddCustomerAction } from "@/components/screens/operations/customer-search-chrome";
import { CustomerSearchField } from "@/components/screens/operations/customer-search-panel";

/**
 * The screen as it opens. Nothing is listed until something is typed, so the
 * canvas stays empty rather than showing recent or nearby customers.
 */
const meta = {
    title: "App Screens/11-customerSearch/Empty search",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction}>
            <CustomerSearchField />
        </AppShell>
    ),
};
