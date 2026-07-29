import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import BackupOutlinedIcon from "@mui/icons-material/BackupOutlined";
import BarcodeReaderIcon from "@mui/icons-material/BarcodeReader";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { ActionButton } from "@/components/app-chrome/app-shell";

/**
 * Chrome shared by the Inventory stories.
 *
 * Screen context: Inventory Counts are physical stock counts against the product
 * catalogue. This is the one Operations screen whose app bar carries icon
 * actions instead of the account cluster — "+" to start a count, "⋮" for the
 * overflow. Inside a count the bar changes again, to a barcode scanner trigger
 * and REFRESH.
 */

/** App bar for the count list: new-count and overflow. */
export const ListTopActions = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton aria-label="New count" sx={{ color: "#fff" }}>
            <AddIcon sx={{ fontSize: 32 }} />
        </IconButton>
        <IconButton aria-label="More" edge="end" sx={{ color: "#fff" }}>
            <MoreVertIcon />
        </IconButton>
    </Box>
);

/** App bar inside a count. The scanner only appears on an open count. */
export const RefreshAction = ({ withScanner }: { withScanner?: boolean }) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        {withScanner && (
            <IconButton aria-label="Scan barcode" sx={{ color: "#fff" }}>
                <BarcodeReaderIcon sx={{ fontSize: 30 }} />
            </IconButton>
        )}
        <Typography sx={{ fontSize: 13, letterSpacing: "0.06em", color: "#fff", pr: 1 }}>REFRESH</Typography>
    </Stack>
);

/** Back / Save, shared by the new-count form and an open count. */
export const CountActionBar = (
    <>
        <ActionButton grow={1} icon={<ChevronLeftIcon />}>
            Back
        </ActionButton>
        <ActionButton grow={1} tone="primary" icon={<BackupOutlinedIcon />}>
            Save
        </ActionButton>
    </>
);
