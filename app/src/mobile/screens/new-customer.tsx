import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import { useNavigate, useSearchParams } from "react-router-dom";

import { MobileActionArea, MobilePrimary } from "@/components/mobile/mobile-shell";
import { MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { CUSTOMER_TYPES, EMAIL_DOMAINS, newCustomer } from "@/data/crm";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Add a New Customer, on a phone.
 *
 * ## Three columns become one
 *
 * The terminal lays six 76px filled fields in a `repeat(3, 1fr)` grid, six
 * email-domain buttons centred in a wrapping row, and every customer type in a
 * `repeat(4, 1fr)` grid inside a 1100px column. At 402px three columns is 134px
 * a field — narrower than the words `Enter Customer Email` — so all three grids
 * collapse to one column, which is the only reliable move for a form that
 * narrows.
 *
 * Field height comes down from 76px to 64px. Six fields at 76 plus their gaps is
 * 552px of a 725px canvas before the domains or the types, which would put SAVE
 * two screens down; 64 buys back 72px without going under the 48dp floor.
 *
 * ## The domain buttons scroll rather than wrap
 *
 * Six buttons at ~110px wrap to three rows here, and three rows of chrome
 * between the email field and the phone field reads as a section break that
 * isn't one. They become one horizontally scrolling row directly under the
 * email field they act on.
 *
 * **They still append rather than replace**, so tapping @GMAIL.COM after typing
 * a full address gives you a broken one. That is what the device does, and it
 * is a finding rather than a bug to fix here.
 *
 * ## The customer types become rows, not a grid
 *
 * A 20px checkbox in a four-column grid is a 100px target. One column of 48dp
 * rows with the whole row live is the same list at a size a thumb can hit.
 *
 * ## The validation rule is kept exactly, including its bad behaviour
 *
 * **A last name is required, and a phone number or an email — either will do,
 * but not neither.** The rule is not written on the form; the device only tells
 * you after SAVE, by badging three fields at once and floating one message that
 * explains two of them. Reproduced, because a rule you can only discover by
 * failing is the finding.
 *
 * The one concession to the phone: the terminal floats that message in an MUI
 * `Tooltip`, which needs hover-or-tap-and-hold to read. Here the message is
 * printed under the field it belongs to, because a tooltip on a touch device
 * that has no hover is a message nobody reads.
 */

const Field = ({
    label,
    value,
    onChange,
    invalid,
    error,
}: {
    label: string;
    value: string;
    onChange: (next: string) => void;
    invalid?: boolean;
    error?: string;
}) => (
    <Box>
        <Box
            sx={{
                position: "relative",
                bgcolor: appColors.fieldFill,
                borderBottom: invalid ? `2px solid ${appColors.red}` : `1px solid ${appColors.textSecondary}`,
                px: 1.5,
                pt: value ? 0.75 : 0,
                minHeight: 64,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
            }}
        >
            {value && <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>{label}</Typography>}
            <Box
                component="input"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                placeholder={label}
                aria-label={label}
                aria-invalid={invalid || undefined}
                sx={{
                    width: "100%",
                    minHeight: value ? 32 : 48,
                    pr: invalid ? 4 : 0,
                    border: "none",
                    outline: "none",
                    bgcolor: "transparent",
                    fontFamily: "inherit",
                    // 16px is the size below which a mobile browser zooms on focus.
                    fontSize: 16,
                    color: appColors.textPrimary,
                }}
            />
            {invalid && <ErrorIcon sx={{ position: "absolute", right: 12, top: "50%", mt: "-12px", fontSize: 22, color: appColors.red }} />}
        </Box>
        {error && <Typography sx={{ px: 1.5, pt: 0.5, fontSize: 13, color: appColors.red }}>{error}</Typography>}
    </Box>
);

export const MobileNewCustomerScreen = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { state } = useStore();
    const { addCustomer } = useActions();

    // A name typed into the search that found nothing is carried over, so it is
    // not retyped — the same contract the terminal's form has.
    const typed = (params.get("name") ?? "").trim();
    const returnTo = params.get("return");

    const [firstName, setFirstName] = useState(typed.split(" ")[0] ?? "");
    const [lastName, setLastName] = useState(typed.split(" ").slice(1).join(" "));
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [birthday, setBirthday] = useState("");
    const [notes, setNotes] = useState("");
    const [types, setTypes] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);

    const needsContact = !email.trim() && !phone.trim();
    const missingLastName = !lastName.trim();

    const save = () => {
        setSubmitted(true);
        if (missingLastName || needsContact) return;

        const created = newCustomer(
            {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                birthday: birthday.trim() || undefined,
                notes: notes.trim() || undefined,
                types,
            },
            state.customers.length,
        );
        addCustomer(created);

        // Hand the new id back to whatever sent us here, so the flow it was in
        // the middle of can continue with this customer selected.
        navigate(returnTo ? `${returnTo}?customer=${created.id}` : `/customersearch/${created.id}`);
    };

    return (
        <MobileShell
            title="Add a New Customer"
            active="customersearch"
            leading="close"
            onLeading={() => navigate(returnTo ?? "/customersearch")}
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />} onClick={save}>
                        Save
                    </MobilePrimary>
                </MobileActionArea>
            }
        >
            <Stack sx={{ p: 1.5, gap: 1.5 }}>
                <Field label="First Name" value={firstName} onChange={setFirstName} />
                <Field
                    label="Last Name"
                    value={lastName}
                    onChange={setLastName}
                    invalid={submitted && missingLastName}
                    error={submitted && missingLastName ? "Last name is required." : undefined}
                />
                <Field label="Enter Customer Email" value={email} onChange={setEmail} invalid={submitted && needsContact} />
            </Stack>

            {/* Appends rather than replacing whatever is already there — the
                device's behaviour, kept. */}
            <Stack
                direction="row"
                sx={{ gap: 1, px: 1.5, pb: 1.5, overflowX: "auto", flexShrink: 0, "&::-webkit-scrollbar": { display: "none" } }}
            >
                {EMAIL_DOMAINS.map((domain) => (
                    <ButtonBase
                        key={domain}
                        onClick={() => setEmail((v) => v + domain)}
                        sx={{
                            flexShrink: 0,
                            px: 1.75,
                            minHeight: 44,
                            bgcolor: appColors.slate,
                            color: "#fff",
                            borderRadius: `${appRadius.button}px`,
                            fontSize: 13,
                            letterSpacing: "0.04em",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {domain.toUpperCase()}
                    </ButtonBase>
                ))}
            </Stack>

            <Stack sx={{ px: 1.5, pb: 1.5, gap: 1.5 }}>
                <Field
                    label="Phone Number"
                    value={phone}
                    onChange={setPhone}
                    invalid={submitted && needsContact}
                    // One message for a rule that spans two fields, on the device
                    // as here — printed rather than floated, because a touch
                    // device has no hover to reveal a tooltip with.
                    error={submitted && needsContact ? "Phone number or email is required." : undefined}
                />
                <Field label="Customer Birthday" value={birthday} onChange={setBirthday} />
                <Field label="Enter notes for this customer" value={notes} onChange={setNotes} />
            </Stack>

            <MobileSectionHeading>Customer Types</MobileSectionHeading>
            {CUSTOMER_TYPES.map((t) => {
                const checked = types.includes(t);
                return (
                    <ButtonBase
                        key={t}
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                        sx={{
                            width: "100%",
                            px: 1.5,
                            minHeight: 48,
                            gap: 1.5,
                            justifyContent: "flex-start",
                            bgcolor: appColors.surface,
                            borderBottom: `1px solid ${appColors.divider}`,
                        }}
                    >
                        {checked ? (
                            <CheckBoxIcon sx={{ fontSize: 22, color: appColors.textPrimary }} />
                        ) : (
                            <CheckBoxOutlineBlankIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />
                        )}
                        <Typography sx={{ fontSize: 16 }}>{t}</Typography>
                    </ButtonBase>
                );
            })}

            <Box sx={{ height: 16 }} />
        </MobileShell>
    );
};
