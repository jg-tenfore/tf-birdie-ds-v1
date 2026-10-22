import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AddCardIcon from "@mui/icons-material/AddCard";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import { CleanCreate } from "./clean-create";
import { ReloadPane } from "./reload-parts";
import { amountOnTap, type GiftCardApi } from "./gift-card-flow";
import { usd } from "./reload-data";

/**
 * **The three answers to "where does reload live".**
 *
 * Weston asked for the feature and left the shape open: *"So the idea I was
 * thinking — and I could be convinced if you think of some other ways — is if
 * you could reload. So like there's gift card, and there's an option to reload
 * or purchase new, or something like that."*
 *
 * And then, on a second entry point: *"I definitely think from the customer
 * profile it could be accessible… there's a section that says gift cards."* →
 * *"Yeah, just do it in both places."*
 *
 * A puts the choice inside the screen, B puts it in front of the screen, and C
 * treats the card as the thing you are working on rather than the form.
 */

/* ------------------------------------------------------------- shared UI */

const CreateBody = ({ api }: { api: GiftCardApi }) => (
    <CleanCreate
        amount={api.amount}
        onAmount={() => api.setAmount(amountOnTap)}
        type={api.type}
        onType={api.cycleType}
        from={api.from}
        to={api.to}
        onFindFrom={api.findFrom}
        onFindTo={api.findTo}
        onSameAsFrom={api.sameAsFrom}
    />
);

const ReloadBody = ({ api }: { api: GiftCardApi }) => (
    <ReloadPane
        query={api.query}
        onQuery={api.setQuery}
        card={api.card}
        onCard={api.setCard}
        amount={api.reload}
        onAmount={api.setReload}
    />
);

/* ------------------------------------------------ A — the mode switch */

/**
 * **A — one screen, two modes.**
 *
 * A segmented control at the top of the cleaned screen. The lightest build:
 * nothing new to navigate, and the two jobs stay visibly related, which they
 * are — both put money on a card.
 *
 * The cost is that the switch is easy to miss, and the screen under it changes
 * completely when it moves. Somebody who tapped **Gift Card** meaning to sell
 * one will find a search box if the last person left it on Reload.
 */
export const OptionA = ({ api }: { api: GiftCardApi }) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
        <Box
            sx={{
                flexShrink: 0,
                display: "flex",
                gap: 1,
                px: 3,
                py: 1.5,
                bgcolor: appColors.surface,
                borderBottom: "1px solid",
                borderColor: appColors.divider,
            }}
        >
            {(["new", "reload"] as const).map((mode) => {
                const active = api.mode === mode;

                return (
                    <Box
                        key={mode}
                        onClick={() => api.setMode(mode)}
                        role="tab"
                        aria-selected={active}
                        aria-label={mode === "new" ? "New gift card" : "Reload a card"}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            minHeight: touchTarget.min,
                            px: 2.5,
                            cursor: "pointer",
                            borderRadius: `${appRadius.button}px`,
                            bgcolor: active ? appColors.slate : "transparent",
                            border: "1px solid",
                            borderColor: active ? appColors.slate : appColors.divider,
                        }}
                    >
                        {mode === "new" ? (
                            <CardGiftcardIcon sx={{ fontSize: 20, color: active ? "#fff" : appColors.textSecondary }} />
                        ) : (
                            <AddCardIcon sx={{ fontSize: 20, color: active ? "#fff" : appColors.textSecondary }} />
                        )}
                        <Typography sx={{ fontSize: 16, color: active ? "#fff" : appColors.textPrimary }}>
                            {mode === "new" ? "New gift card" : "Reload a card"}
                        </Typography>
                    </Box>
                );
            })}
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {api.mode === "new" ? <CreateBody api={api} /> : <ReloadBody api={api} />}
        </Box>
    </Box>
);

export const titleA = (api: GiftCardApi) => (api.mode === "new" ? "Create a Gift Card" : "Reload a Gift Card");
export const saveLabelA = (api: GiftCardApi) =>
    api.mode === "new" ? (api.amount ? `SAVE · ${usd(api.amount)}` : "SAVE") : api.card ? `ADD ${usd(api.reload)}` : "ADD FUNDS";

/* ------------------------------------------------- B — two paths first */

/**
 * **B — the choice comes first.**
 *
 * Tapping **Gift Card** asks one question before anything else, which is the
 * shape Weston reached for: *"there's gift card, and there's an option to
 * reload or purchase new."*
 *
 * Each screen is then built for its own job with nothing borrowed, and neither
 * can be mistaken for the other. The cost is a tap on every sale, including
 * the common one.
 */
export const OptionB = ({ api }: { api: GiftCardApi }) => {
    if (!api.mode) return null;

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {api.mode === "new" ? <CreateBody api={api} /> : <ReloadBody api={api} />}
            </Box>
        </Box>
    );
};

/** The question B asks before either screen. */
export const ModeChooser = ({ onPick }: { onPick: (mode: "new" | "reload") => void }) => (
    <Box sx={{ height: "100%", bgcolor: appColors.canvas, px: 3, py: 4 }}>
        <Typography sx={{ fontSize: 24, color: appColors.textPrimary, mb: 3 }}>Gift cards</Typography>

        <Box sx={{ display: "flex", gap: 2, maxWidth: 820 }}>
            {(
                [
                    {
                        mode: "new" as const,
                        title: "Sell a new card",
                        hint: "Set an amount, pick who it is from and for.",
                        Icon: CardGiftcardIcon,
                    },
                    {
                        mode: "reload" as const,
                        title: "Reload a card",
                        hint: "Find a card they already hold and add to it.",
                        Icon: AddCardIcon,
                    },
                ] as const
            ).map(({ mode, title, hint, Icon }) => (
                <Box
                    key={mode}
                    onClick={() => onPick(mode)}
                    role="button"
                    aria-label={title}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 200,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 1,
                        px: 3,
                        cursor: "pointer",
                        bgcolor: appColors.surface,
                        borderRadius: `${appRadius.card}px`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                    }}
                >
                    <Icon sx={{ fontSize: 40, color: appColors.slate }} />
                    <Typography sx={{ fontSize: 22, color: appColors.textPrimary }}>{title}</Typography>
                    <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>{hint}</Typography>
                </Box>
            ))}
        </Box>
    </Box>
);

/**
 * B as the flow runs it: the question, then the screen it chose.
 *
 * The chooser is local state, so backing out to the Pro Shop and tapping
 * **Gift Card** again asks again — nobody inherits the last person's mode,
 * which is the failure Option A can have.
 */
export const OptionBFlow = ({ api }: { api: GiftCardApi }) => {
    const [picked, setPicked] = useState(false);

    if (!picked) {
        return (
            <ModeChooser
                onPick={(mode) => {
                    api.setMode(mode);
                    setPicked(true);
                }}
            />
        );
    }

    return <OptionB api={api} />;
};

export const titleB = (api: GiftCardApi) => titleA(api);
export const saveLabelB = (api: GiftCardApi) => saveLabelA(api);

/* --------------------------------------------- C — the card comes first */

/**
 * **C — reload lives on the card, not in a form.**
 *
 * Find the customer, see every card they hold, tap one, add funds. There is no
 * gift-card form in this version at all — the thing being worked on is a card
 * that already exists, so the screen is a record rather than a draft.
 *
 * It is also the version that answers the second ask without any extra work:
 * *"I definitely think from the customer profile it could be accessible…
 * there's a section that says gift cards."* → *"Yeah, just do it in both
 * places."* This **is** that section; reaching it from the customer record or
 * from the Gift Card tile lands you in the same place.
 *
 * The cost is that it only does reloads. Selling a new card is a separate
 * screen reached separately, so the two never share a canvas.
 */
export const OptionC = ({ api }: { api: GiftCardApi }) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
        <Box
            sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 3,
                py: 1.5,
                bgcolor: appColors.surface,
                borderBottom: "1px solid",
                borderColor: appColors.divider,
            }}
        >
            <PersonSearchIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, color: appColors.textSecondary }}>
                The same screen opens from a customer&rsquo;s record, under their gift cards.
            </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <ReloadBody api={api} />
        </Box>
    </Box>
);

export const titleC = () => "Reload a Gift Card";
export const saveLabelC = (api: GiftCardApi) => (api.card ? `ADD ${usd(api.reload)} TO CARD` : "ADD FUNDS");
