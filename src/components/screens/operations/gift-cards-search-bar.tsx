import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * The Gift Cards sub-bar: one filled text field plus a slate SEARCH button.
 *
 * Transcribed from `references/072926/14-giftcards/`. The field is a Material
 * *filled* input, so its label starts as large placeholder text sitting on the
 * baseline and shrinks to a caption above the value once something is typed —
 * both states are in the reference set, which is why `value` switches the whole
 * internal layout rather than just the text.
 */
export const GiftCardSearchBar = ({ value }: { value?: string }) => (
    <Box
        sx={{
            flexShrink: 0,
            bgcolor: "#FAFAFA",
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1,
            py: 1,
        }}
    >
        <Stack
            sx={{
                flex: 1,
                minWidth: 0,
                height: 52,
                bgcolor: "#E2E2E2",
                borderBottom: "1px solid",
                borderColor: "#767676",
                px: 1.75,
                justifyContent: "center",
            }}
        >
            {value ? (
                <>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, lineHeight: 1.3 }}>Gift Card Search</Typography>
                    <Typography sx={{ fontSize: 18, color: appColors.textPrimary, lineHeight: 1.3 }}>{value}</Typography>
                </>
            ) : (
                <Typography sx={{ fontSize: 18, color: "#6B6B6B" }}>Gift Card Search</Typography>
            )}
        </Stack>

        <Button
            disableElevation
            sx={{
                width: 200,
                minHeight: 44,
                flexShrink: 0,
                borderRadius: `${appRadius.button}px`,
                bgcolor: appColors.slate,
                color: "#fff",
                fontSize: 15,
                letterSpacing: "0.09em",
                "&:hover": { bgcolor: appColors.slateDark },
            }}
        >
            Search
        </Button>
    </Box>
);

export default GiftCardSearchBar;
