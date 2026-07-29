import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ReplayIcon from "@mui/icons-material/Replay";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { CourtSheetGrid, buildCourtColumns } from "@/components/screens/pro-shop/court-sheet-grid";
import { DateNavBar } from "@/components/screens/pro-shop/date-nav-bar";

/**
 * **Court Sheet** — the booking sheet for non-golf facilities: tennis,
 * pickleball, basketball and the pool.
 *
 * Unlike the Tee Sheet it has no order panel and no account controls in the app
 * bar; it is a read-and-book surface only. Slots are 20 minutes and every cell
 * repeats its own start time, because the sheet has no shared time gutter.
 * Facilities are whatever the club named them, so the header row mixes
 * conventions ("Basketball" and "Basket Ball 2" are separate courts).
 *
 * The bottom bar ends with a pager rather than a tender button — more
 * facilities than fit on one screen page across.
 *
 * Reproduced from `references/072926/3-coursheet/`.
 */
const meta = {
    title: "App Screens/Pro Shop/Court Sheet",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The sheet as it opens: page 1 of the facility list, every 20-minute slot from
 * 6:00 AM open. Both pager arrows are greyed because there is only one page.
 */
export const CourtSheet: Story = {
    name: "Court sheet",
    render: () => (
        <AppShell
            title="Court Sheet"
            active="courtsheet"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            subBar={<DateNavBar date="Tuesday, May 12 2026" ratios={[1, 5, 3, 1]} />}
            actionBar={
                <>
                    <ActionButton icon={<StorefrontIcon />} grow={16}>
                        Pro Shop
                    </ActionButton>
                    <ActionButton icon={<CalendarMonthIcon />} grow={16}>
                        Tee Sheet
                    </ActionButton>
                    <ActionButton icon={<ReplayIcon />} grow={16}>
                        Refresh
                    </ActionButton>
                    <ActionButton tone="disabled" grow={5}>
                        <ChevronLeftIcon />
                    </ActionButton>
                    <ActionButton grow={8}>1</ActionButton>
                    <ActionButton tone="disabled" grow={5}>
                        <ChevronRightIcon />
                    </ActionButton>
                </>
            }
        >
            <CourtSheetGrid columns={buildCourtColumns(18)} />
        </AppShell>
    ),
};
