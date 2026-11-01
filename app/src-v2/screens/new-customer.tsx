import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { CUSTOMER_TYPES, EMAIL_DOMAINS, newCustomer } from "@/data/crm";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { useActions, useStore } from "../store";

/**
 * Add a New Customer, from `references/072926/3-coursheet/`.
 *
 * Six filled fields, six one-tap email domains, and every customer type the
 * course has configured in a four-column grid.
 *
 * The validation rule is the interesting part and it is not written on the form:
 * **a last name is required, and so is a phone number or an email — either will
 * do, but not neither.** The device only tells you after you press SAVE, by
 * badging three fields at once and floating one tooltip that explains only two of
 * them. Reproduced, because a rule you can only discover by failing is a finding.
 *
 * The domain buttons append rather than replace, so tapping @GMAIL.COM after
 * typing a full address gives you a broken one. That is what the device does.
 */

const FilledField = ({
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
    <Box
        sx={{
            position: "relative",
            bgcolor: appColors.fieldFill,
            borderBottom: invalid ? `2px solid #E53935` : `1px solid ${appColors.textSecondary}`,
            px: 2,
            pt: value ? 1 : 0,
            pb: value ? 0.75 : 0,
            minHeight: 76,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
        }}
    >
        {value ? (
            <>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{label}</Typography>
                <InputBase value={value} onChange={(e) => onChange(e.target.value)} sx={{ "& input": { fontSize: 21, p: 0 } }} />
            </>
        ) : (
            <InputBase
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={label}
                sx={{ "& input": { fontSize: 21, p: 0, "&::placeholder": { color: appColors.textSecondary, opacity: 1 } } }}
            />
        )}

        {invalid && (
            <Tooltip
                open={Boolean(error)}
                title={error ?? ""}
                placement="bottom-start"
                arrow
                slotProps={{ tooltip: { sx: { bgcolor: "#000", fontSize: 15, borderRadius: 0 } } }}
            >
                <ErrorIcon sx={{ position: "absolute", right: 12, top: "50%", mt: "-12px", fontSize: 24, color: "#E53935" }} />
            </Tooltip>
        )}
    </Box>
);

export const NewCustomerScreen = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { state } = useStore();
    const { addCustomer } = useActions();

    // A name typed into the search that found nothing is carried over, so it is
    // not retyped.
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
    const showErrors = submitted;

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

        // Hand the new id back to whatever sent us here, so the reservation it was
        // in the middle of can continue with this customer selected.
        navigate(returnTo ? `${returnTo}?customer=${created.id}` : `/customersearch/${created.id}`);
    };

    return (
        <Shell
            title="Add a New Customer"
            active="customersearch"
            topBarRight={null}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate(returnTo ?? "/customersearch")}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<CheckIcon />} tone="primary" grow={2} onClick={save}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: "#fff", minHeight: "100%", pb: 4 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, p: 2 }}>
                    <FilledField label="First Name" value={firstName} onChange={setFirstName} />
                    <FilledField
                        label="Last Name"
                        value={lastName}
                        onChange={setLastName}
                        invalid={showErrors && missingLastName}
                        error={showErrors && missingLastName ? "Last name is required." : undefined}
                    />
                    <FilledField label="Enter Customer Email" value={email} onChange={setEmail} invalid={showErrors && needsContact} />

                    <FilledField
                        label="Phone Number"
                        value={phone}
                        onChange={setPhone}
                        invalid={showErrors && needsContact}
                        // One tooltip for a rule that spans two fields, on the
                        // device as here.
                        error={showErrors && needsContact ? "Phone number or email is required." : undefined}
                    />
                    <FilledField label="Customer Birthday" value={birthday} onChange={setBirthday} />
                    <FilledField label="Enter notes for this customer" value={notes} onChange={setNotes} />
                </Box>

                {/* Appends, rather than replacing whatever is already there. */}
                <Stack direction="row" sx={{ justifyContent: "center", gap: 2, flexWrap: "wrap", px: 2, py: 1 }}>
                    {EMAIL_DOMAINS.map((domain) => (
                        <ButtonBase
                            key={domain}
                            onClick={() => setEmail((v) => v + domain)}
                            sx={{
                                px: 2.5,
                                minHeight: 52,
                                bgcolor: appColors.slate,
                                color: "#fff",
                                borderRadius: `${appRadius.button}px`,
                                fontSize: 15,
                                letterSpacing: "0.06em",
                            }}
                        >
                            {domain.toUpperCase()}
                        </ButtonBase>
                    ))}
                </Stack>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        columnGap: 2,
                        rowGap: 0.5,
                        maxWidth: 1100,
                        mx: "auto",
                        mt: 4,
                        px: 2,
                    }}
                >
                    {CUSTOMER_TYPES.map((t) => (
                        <Stack key={t} direction="row" sx={{ alignItems: "center", gap: 1 }}>
                            <Checkbox
                                checked={types.includes(t)}
                                onChange={(e) => setTypes((prev) => (e.target.checked ? [...prev, t] : prev.filter((x) => x !== t)))}
                            />
                            <Typography sx={{ fontSize: 19 }}>{t}</Typography>
                        </Stack>
                    ))}
                </Box>
            </Box>
        </Shell>
    );
};
