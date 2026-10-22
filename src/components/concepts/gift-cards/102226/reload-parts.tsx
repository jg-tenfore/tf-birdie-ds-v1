import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SearchIcon from "@mui/icons-material/Search";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import { findCards, reloadPresets, usd, type GiftCardRecord } from "./reload-data";

/**
 * **The parts the reload needs**, shared by all three versions.
 *
 * Three jobs, in Weston's order: *"search for a customer name or UPC code…
 * click on it, because they could have multiple… and then put the amount you
 * want to add to it."*
 */

/* ------------------------------------------------------------ the search */

export const CardSearch = ({
    query,
    onQuery,
    placeholder = "Search by name, phone or card number",
}: {
    query: string;
    onQuery: (value: string) => void;
    placeholder?: string;
}) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minHeight: touchTarget.comfortable,
            px: 2,
            bgcolor: appColors.fieldFill,
            borderBottom: "1px solid rgba(0,0,0,0.42)",
            borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
        }}
    >
        <SearchIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />
        <Box
            component="input"
            value={query}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onQuery(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            sx={{
                flex: 1,
                minWidth: 0,
                border: "none",
                outline: "none",
                bgcolor: "transparent",
                fontFamily: "inherit",
                fontSize: 18,
                color: appColors.textPrimary,
                "&::placeholder": { color: appColors.textSecondary },
            }}
        />
    </Box>
);

/* ------------------------------------------------------------- the cards */

/**
 * One card.
 *
 * Everything a counter needs to tell one of Justin's three apart: the last
 * four of the code, what is on it now, what it was worth, and when it was last
 * touched. The current screen's search returns a name and an email and expects
 * that to be enough.
 */
export const CardRow = ({ card, selected, onSelect }: { card: GiftCardRecord; selected?: boolean; onSelect?: () => void }) => (
    <Box
        onClick={onSelect}
        role={onSelect ? "radio" : undefined}
        aria-checked={selected ?? false}
        aria-label={`Card ending ${card.code.slice(-4)} — ${usd(card.balance)}`}
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minHeight: 76,
            px: 2,
            cursor: onSelect ? "pointer" : "default",
            bgcolor: selected ? "#F3F7F4" : appColors.surface,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        <Box sx={{ width: 28, display: "grid", placeItems: "center" }}>
            {selected ? (
                <Box sx={{ width: 22, height: 22, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: appColors.green }}>
                    <CheckIcon sx={{ fontSize: 15, color: "#fff" }} />
                </Box>
            ) : (
                <Box sx={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid", borderColor: appColors.textSecondary }} />
            )}
        </Box>

        <CreditCardIcon sx={{ fontSize: 26, color: appColors.textSecondary }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 18, color: appColors.textPrimary, fontFamily: "'Roboto Mono', monospace" }}>{card.code}</Typography>
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                {card.holder.first} {card.holder.last} · issued {usd(card.issued)} · last used {card.lastUsed}
            </Typography>
        </Box>

        {/* A spent card is exactly what somebody asks to reload, so it reads
            as a state rather than as a problem. */}
        <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 20, color: card.balance === 0 ? appColors.textSecondary : appColors.textPrimary }}>
                {usd(card.balance)}
            </Typography>
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{card.balance === 0 ? "empty" : "balance"}</Typography>
        </Box>
    </Box>
);

/** The results, with the one thing a name search cannot resolve called out. */
export const CardResults = ({
    query,
    selected,
    onSelect,
}: {
    query: string;
    selected?: GiftCardRecord;
    onSelect?: (card: GiftCardRecord) => void;
}) => {
    const results = findCards(query);

    if (!query.trim()) {
        return (
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary, px: 1, py: 3 }}>
                Search for the customer, or scan the card.
            </Typography>
        );
    }

    if (results.length === 0) {
        return <Typography sx={{ fontSize: 17, color: appColors.textSecondary, px: 1, py: 3 }}>No card matches “{query}”.</Typography>;
    }

    return (
        <>
            {results.length > 1 && (
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 1 }}>
                    {results.length} cards — pick the one being reloaded.
                </Typography>
            )}
            <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, overflow: "hidden" }}>
                {results.map((card) => (
                    <CardRow key={card.code} card={card} selected={selected?.code === card.code} onSelect={() => onSelect?.(card)} />
                ))}
            </Box>
        </>
    );
};

/* ------------------------------------------------------------ the amount */

/**
 * How much to add, and what the card will hold afterwards.
 *
 * The arithmetic is on screen because it is the question actually being asked:
 * *"oh, I'm at $25, can I make this to $100?"* — which is a target balance, not
 * an amount to add, and the two are easy to confuse at a till.
 */
export const ReloadAmount = ({ card, amount, onAmount }: { card: GiftCardRecord; amount: number; onAmount?: (value: number) => void }) => (
    <Box>
        <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1 }}>ADD TO THIS CARD</Typography>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
            {reloadPresets.map((preset) => {
                const active = preset === amount;

                return (
                    <Box
                        key={preset}
                        onClick={() => onAmount?.(preset)}
                        role="radio"
                        aria-checked={active}
                        aria-label={`Add ${usd(preset)}`}
                        sx={{
                            minWidth: 128,
                            minHeight: 72,
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                            borderRadius: `${appRadius.card}px`,
                            bgcolor: active ? appColors.green : appColors.surface,
                            border: "1px solid",
                            borderColor: active ? appColors.green : appColors.divider,
                        }}
                    >
                        <Typography sx={{ fontSize: 22, fontWeight: 500, color: active ? "#fff" : appColors.textPrimary }}>
                            {usd(preset)}
                        </Typography>
                    </Box>
                );
            })}
        </Box>

        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minHeight: 72,
                px: 2.5,
                bgcolor: appColors.surface,
                borderRadius: `${appRadius.card}px`,
            }}
        >
            <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>Balance now</Typography>
            <Typography sx={{ fontSize: 19, color: appColors.textPrimary }}>{usd(card.balance)}</Typography>
            <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>+</Typography>
            <Typography sx={{ fontSize: 19, color: appColors.textPrimary }}>{usd(amount)}</Typography>
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 19, color: appColors.textSecondary }}>=</Typography>
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>After this sale</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 500, color: appColors.greenDark }}>{usd(card.balance + amount)}</Typography>
        </Box>
    </Box>
);

/** The whole reload, in one block — used by every version at some size. */
export const ReloadPane = ({
    query,
    onQuery,
    card,
    onCard,
    amount,
    onAmount,
}: {
    query: string;
    onQuery: (value: string) => void;
    card?: GiftCardRecord;
    onCard: (card: GiftCardRecord) => void;
    amount: number;
    onAmount: (value: number) => void;
}) => {
    return (
        <Box sx={{ px: 3, py: 2.5 }}>
            <Box sx={{ maxWidth: 560, mb: 2 }}>
                <CardSearch query={query} onQuery={onQuery} />
            </Box>

            <Box sx={{ mb: 3 }}>
                <CardResults query={query} selected={card} onSelect={onCard} />
            </Box>

            {card && <ReloadAmount card={card} amount={amount} onAmount={onAmount} />}
        </Box>
    );
};

/** Holds the reload's own state, so a story can drop it in and tap through. */
export const useReload = () => {
    const [query, setQuery] = useState("");
    const [card, setCard] = useState<GiftCardRecord | undefined>(undefined);
    const [amount, setAmount] = useState(100);

    return {
        query,
        setQuery: (value: string) => {
            setQuery(value);
            setCard(undefined);
        },
        card,
        setCard,
        amount,
        setAmount,
    };
};
