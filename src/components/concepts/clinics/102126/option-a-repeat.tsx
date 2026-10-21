import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PersonIcon from "@mui/icons-material/Person";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { ClinicStepper } from "../102026/clinic-stepper";
import { openSessions, usd, type CatalogClinic } from "./clinic-catalog";
import { BookingSummary, ClinicHeader, GuestForm, SessionTable, StepSection, guestName, type Guest } from "./clinic-parts";

/**
 * **Option A — one at a time, remembered.**
 *
 * This is what the device does today, made fast. Weston, on how the shipping
 * flow handles a second person:
 *
 * > *"I think you can only do one at a time right now… you only do one during
 * > the flow, but you can add multiple to the cart and then pay for them. Like,
 * > technically if I finish this, I added that to the cart, I can click clinics
 * > again."*
 *
 * And on what would make that bearable:
 *
 * > *"Or we build it in a way where it's just like once you add it, if you hit
 * > clinics again, it just saves all of your info. Like you selected these,
 * > you're just changing the customer. Or in your case where… I register for
 * > girls and then there's chipping — I click on chipping, my info is already
 * > there because I added to the cart. I just have to select the dates."*
 *
 * So nothing about the data model changes: **one booking is one person**, and
 * a second person is a second trip through the same two steps. What changes is
 * that the second trip starts where the first one ended — the guest is already
 * filled in, and the dates come back pre-ticked when it is the same clinic.
 *
 * Two steps, as Weston approved: **1 Dates**, then **2 Guest**.
 *
 * - **Cheap to build.** No new validation: one person, one place per date.
 * - **Cheap to undo.** If party booking turns out to be the right answer, this
 *   is still the path a single registration takes.
 * - **The cost:** registering a family of four is four trips. The recall takes
 *   the typing out of it, not the trips.
 *
 * Option B is the other answer: ask for the whole party before the dates.
 */

/** The band that says the flow remembered someone, and offers to forget them. */
const RecallBanner = ({ guest, onClear }: { guest: Guest; onClear?: () => void }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minHeight: 56,
            px: 2,
            mb: 2,
            bgcolor: "#EAF3EC",
            borderLeft: "4px solid",
            borderColor: appColors.green,
            borderRadius: `${appRadius.button}px`,
        }}
    >
        <PersonIcon sx={{ fontSize: 22, color: appColors.greenDark }} />
        <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16, color: appColors.textPrimary }}>
            Carried over from the last booking — <strong>{guestName(guest)}</strong>
        </Typography>
        <Typography
            onClick={onClear}
            role={onClear ? "button" : undefined}
            sx={{
                fontSize: 14,
                letterSpacing: "0.06em",
                color: appColors.greenDark,
                cursor: onClear ? "pointer" : "default",
                px: 1,
            }}
        >
            SOMEONE ELSE
        </Typography>
    </Box>
);

export const ClinicBookingA = ({
    clinic,
    selected = [],
    step = 0,
    guest,
    onToggle,
    onSelectAll,
    onStep,
    onClearGuest,
}: {
    clinic: CatalogClinic;
    selected?: string[];
    /** 0 = the dates, 1 = the guest. */
    step?: number;
    /** Who the last booking was for, if there was one. */
    guest?: Guest;
    onToggle?: (label: string) => void;
    onSelectAll?: () => void;
    onStep?: (index: number) => void;
    onClearGuest?: () => void;
}) => {
    const chosen = clinic.sessions.filter((session) => selected.includes(session.label));
    const total = chosen.length * clinic.price;

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            <ClinicStepper
                steps={[
                    { label: "Dates", hint: chosen.length ? `${chosen.length} chosen · ${usd(total)}` : "None chosen yet" },
                    { label: "Guest", hint: guest ? guestName(guest) : "Who is being booked" },
                ]}
                current={step}
                onStep={onStep}
            />

            {step === 0 ? (
                <>
                    {/* The clinic stays named above the dates, and goes away on
                        the guest step — it has nothing to say once the dates
                        are chosen. */}
                    <ClinicHeader clinic={clinic} />
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <SessionTable clinic={clinic} selected={selected} onToggle={onToggle} onSelectAll={onSelectAll} />
                    </Box>
                </>
            ) : (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, py: 2.5 }}>
                    <StepSection label="BOOKING">
                        <BookingSummary clinic={clinic} chosen={chosen} />
                    </StepSection>

                    <StepSection label="WHO IS IT FOR">
                        {guest && <RecallBanner guest={guest} onClear={onClearGuest} />}
                        <GuestForm guest={guest} />
                    </StepSection>
                </Box>
            )}
        </Box>
    );
};

/** What SELECT ALL OPEN reaches for a single registration. */
export const openLabelsA = (clinic: CatalogClinic): string[] => openSessions(clinic).map((session) => session.label);

export default ClinicBookingA;
