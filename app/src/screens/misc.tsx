import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";

/**
 * The placeholder screen.
 *
 * Everything that used to live here has its own file now. What is left is the
 * one honest stub: a destination that is reachable and themed but not wired,
 * which is better than a blank route or a fake screen that implies it works.
 */
export const StubScreen = ({ title, active, note }: { title: string; active: Parameters<typeof Shell>[0]["active"]; note: string }) => {
    const navigate = useNavigate();
    return (
        <Shell title={title} active={active} actionBar={<ActionButton onClick={() => navigate("/proshop")}>Back to register</ActionButton>}>
            <Box sx={{ p: 3 }}>
                <Typography sx={{ fontSize: 26 }}>{title}</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mb: 2 }}>{note}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ color: appColors.textSecondary, maxWidth: 620 }}>
                    This destination is reachable and themed, but its interactions are not wired yet. The documented states for it live in
                    Storybook.
                </Typography>
            </Box>
        </Shell>
    );
};
