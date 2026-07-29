import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CreditCardIcon from "@mui/icons-material/CreditCard";

import { ActionButton } from "@/components/app-chrome/app-shell";

/**
 * Chrome shared by the Customer Search stories.
 *
 * Screen context: Customer Search is the front door to the customer record. The
 * search screen itself is unusually bare — no filters, no recent list, no bottom
 * action bar. One field matches name, email and phone at once, and the app bar
 * carries a single "+" instead of the usual account / log-out cluster.
 *
 * Selecting a result replaces the whole screen with the customer record, which
 * *does* have an action bar — and that bar is where card capture and account
 * payment live, so the record doubles as the customer's payment screen.
 */

/** Replaces the app bar's whole right cluster on every Customer Search screen. */
export const AddCustomerAction = (
    <IconButton aria-label="Add customer" edge="end" sx={{ color: "#fff" }}>
        <AddIcon sx={{ fontSize: 30 }} />
    </IconButton>
);

/** The record's bottom bar — note that card capture and payment live here. */
export const RecordActionBar = (
    <>
        <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
        <ActionButton icon={<CreditCardIcon />}>SWIPE CC</ActionButton>
        <ActionButton icon={<CreditCardIcon />}>KEY CC</ActionButton>
        <ActionButton icon={<AttachMoneyIcon />}>PAY ON BALANCE</ActionButton>
        <ActionButton tone="primary" icon={<CheckIcon />}>
            SAVE
        </ActionButton>
    </>
);
