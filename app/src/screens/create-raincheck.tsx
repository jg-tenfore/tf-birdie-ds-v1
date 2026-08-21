import { useState } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BoltIcon from "@mui/icons-material/Bolt";
import { useNavigate, useParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { RaincheckForm, type RaincheckPlayer } from "@/components/screens/tee-sheet/raincheck-form";
import { Shell } from "../pos-shell";
import { useActions, useStore } from "../store";

/**
 * Create Raincheck — the screen behind a paid booking's **Raincheck** button.
 *
 * The chips at the bottom are every position on the tee time, and the one that
 * arrived from the detail screen starts selected. Switching chips switches which
 * round is being refunded, so the price and hole count above change with it —
 * two golfers on the same time can have paid different rates.
 */
export const CreateRaincheckScreen = () => {
    const { time, index } = useParams();
    const navigate = useNavigate();
    const { teeTimes } = useStore();
    const { issueRaincheck } = useActions();

    const decoded = decodeURIComponent(time ?? "");
    const booking = teeTimes.find((t) => t.time === decoded);
    const back = `/teesheet/${encodeURIComponent(decoded)}`;

    // Which position is being refunded, as an index into the time's four slots.
    const [slot, setSlot] = useState(Number(index ?? 0));
    const [holesPlayed, setHolesPlayed] = useState(0);

    const position = booking?.positions[slot] ?? null;

    if (!booking || !position) {
        return (
            <Shell title="Raincheck" active="teesheet" actionBar={<ActionButton onClick={() => navigate(back)}>Back</ActionButton>}>
                <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: 20 }}>That booking is no longer on the sheet.</Typography>
                </Stack>
            </Shell>
        );
    }

    const players: RaincheckPlayer[] = booking.positions.flatMap((p, i) =>
        p ? [{ id: p.id, name: i === slot ? p.name : undefined }] : [],
    );

    return (
        <Shell
            title="Raincheck"
            active="teesheet"
            accountLabel=""
            showLogOut={false}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate(back)}>
                        Back
                    </ActionButton>
                    <ActionButton
                        icon={<BoltIcon />}
                        tone="primary"
                        grow={1.6}
                        onClick={() => {
                            issueRaincheck(decoded, slot, holesPlayed);
                            navigate(back);
                        }}
                    >
                        Create Raincheck
                    </ActionButton>
                </>
            }
        >
            <RaincheckForm
                reservation={position.id}
                customerEmail={position.email ?? position.name}
                roundPrice={position.price}
                totalHoles={position.holes}
                holesPlayed={holesPlayed}
                onHolesPlayed={setHolesPlayed}
                players={players}
                selectedPlayerId={position.id}
                onSelectPlayer={(id) => {
                    const next = booking.positions.findIndex((p) => p?.id === id);
                    if (next >= 0) setSlot(next);
                }}
            />
        </Shell>
    );
};
