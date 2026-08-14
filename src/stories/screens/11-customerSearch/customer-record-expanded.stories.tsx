import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { AddCustomerAction, RecordActionBar } from "@/components/screens/operations/customer-search-chrome";
import {
    CustomerRecordFields,
    CustomerSection,
    CustomerTypeList,
    GeneralInfoList,
    GiftCardsTable,
    MembershipRow,
    PunchCardsTable,
    TeeTimeHistoryTable,
    customerTypes,
    teeTimeHistory,
    westonFarnsworth,
    westonGeneralInfo,
} from "@/components/screens/operations/customer-search-panel";

/**
 * The same record with every section open, exactly as the device draws it —
 * empty Gift Cards header, five sections, no rainchecks anywhere.
 *
 * Each expands in place into a white card under its navy bar, so the page simply
 * gets longer; opening one never closes its siblings. Scroll to see all five.
 *
 * The bars are now tap targets — see **Customer profile** for the composed
 * version with real data, a Rain Checks section, and a balance on each closed
 * bar. This story stays as the as-is reference.
 */
const meta = {
    title: "App Screens/11-customerSearch/Customer record — sections expanded",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction} actionBar={RecordActionBar}>
            <Box sx={{ pb: 2 }}>
                <CustomerRecordFields customer={westonFarnsworth} />

                <CustomerSection title="Memberships">
                    <MembershipRow name="30 Day booking window" expires="08/12/2026" />
                </CustomerSection>

                <CustomerSection title="Customer Types">
                    <CustomerTypeList types={customerTypes} />
                </CustomerSection>

                <CustomerSection title="Gift Cards">
                    <GiftCardsTable />
                </CustomerSection>

                <CustomerSection title="Tee Time History">
                    <TeeTimeHistoryTable rows={teeTimeHistory} />
                </CustomerSection>

                <CustomerSection title="Punch Cards">
                    <PunchCardsTable />
                </CustomerSection>

                <GeneralInfoList rows={westonGeneralInfo} />
            </Box>
        </AppShell>
    ),
};
