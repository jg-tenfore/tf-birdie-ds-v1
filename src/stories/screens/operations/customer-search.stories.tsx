import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import {
    CustomerRecordFields,
    CustomerResultsList,
    CustomerSearchField,
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
    westonResults,
} from "@/components/screens/operations/customer-search-panel";

/**
 * **Customer Search** — the front door to the customer record.
 *
 * The search screen itself is unusually bare: no filters, no recent list, no
 * bottom action bar. One field matches against name, email and phone at once,
 * and the app bar carries a single "+" for creating a customer instead of the
 * usual account / log-out cluster.
 *
 * Selecting a result replaces the whole screen with the customer record, which
 * *does* have an action bar — and that bar is where card capture and account
 * payment live, so the record doubles as the customer's payment screen.
 */
const meta = {
    title: "App Screens/Operations/Customer Search",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const AddCustomerAction = (
    <IconButton aria-label="Add customer" edge="end" sx={{ color: "#fff" }}>
        <AddIcon sx={{ fontSize: 30 }} />
    </IconButton>
);

const RecordActionBar = (
    <>
        <ActionButton>
            <ChevronLeftIcon sx={{ position: "absolute", left: 20 }} />
            BACK
        </ActionButton>
        <ActionButton>
            <CreditCardIcon sx={{ position: "absolute", left: 20 }} />
            SWIPE CC
        </ActionButton>
        <ActionButton>
            <CreditCardIcon sx={{ position: "absolute", left: 20 }} />
            KEY CC
        </ActionButton>
        <ActionButton>
            <AttachMoneyIcon sx={{ position: "absolute", left: 20 }} />
            PAY ON BALANCE
        </ActionButton>
        <ActionButton tone="primary">
            <CheckIcon sx={{ position: "absolute", left: 20 }} />
            SAVE
        </ActionButton>
    </>
);

/**
 * The screen as it opens. Nothing is listed until something is typed, so the
 * canvas stays empty rather than showing recent or nearby customers.
 */
export const EmptySearch: Story = {
    name: "Empty search",
    render: () => (
        <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction}>
            <CustomerSearchField />
        </AppShell>
    ),
};

/**
 * Matches for "weston". The list is fuzzy across all three fields, which is why
 * "Tony Finau" and "Randy Orton" appear — their *emails* contain the query.
 * Membership and customer-type names are appended to the display name, and the
 * first row carries a bold italic code above it.
 */
export const SearchResults: Story = {
    name: "Search results",
    render: () => (
        <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction}>
            <CustomerSearchField value="weston" />
            <CustomerResultsList results={westonResults} />
        </AppShell>
    ),
};

/**
 * The customer record, at the top of its scroll. Contact and address fields
 * first, then five collapsed section bars, then General Info. Empty fields show
 * their label in place of a value — Customer Birthday and Zip Code here.
 */
export const CustomerRecord: Story = {
    name: "Customer record",
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

/**
 * The same record with every section open. Each expands in place into a white
 * card under its navy bar, so the page simply gets longer — there is no tabbing
 * and no accordion that closes its siblings. Scroll to see all five.
 */
export const CustomerRecordExpanded: Story = {
    name: "Customer record — sections expanded",
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
