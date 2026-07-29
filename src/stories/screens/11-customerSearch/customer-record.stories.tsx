import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { AddCustomerAction, RecordActionBar } from "@/components/screens/operations/customer-search-chrome";
import {
    CustomerRecordFields,
    CustomerSection,
    GeneralInfoList,
    westonFarnsworth,
    westonGeneralInfo,
} from "@/components/screens/operations/customer-search-panel";

/**
 * The customer record, at the top of its scroll. Contact and address fields
 * first, then five collapsed section bars, then General Info. Empty fields show
 * their label in place of a value — Customer Birthday and Zip Code here.
 */
const meta = {
    title: "App Screens/11-customerSearch/Customer record",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction} actionBar={RecordActionBar}>
            <Box sx={{ pb: 2 }}>
                <CustomerRecordFields customer={westonFarnsworth} />
                {["Memberships", "Customer Types", "Gift Cards", "Tee Time History", "Punch Cards"].map((title) => (
                    <CustomerSection key={title} title={title} />
                ))}
                <GeneralInfoList rows={westonGeneralInfo} />
            </Box>
        </AppShell>
    ),
};
