import AddIcon from "@mui/icons-material/Add";
import BoltIcon from "@mui/icons-material/Bolt";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { TabList, TabsFilterBar } from "@/components/screens/restaurant/tabs-parts";
import { openTabs } from "@/components/screens/restaurant/tabs-story-parts";

/**
 * The tab list.
 *
 * A tinted filter band sits directly under the app bar — it is a band, not a
 * field, with no input chrome or search icon to say it is typeable. Below it,
 * full-bleed rows every one of which leads with the same antler mark, so the
 * avatar column carries no information at all.
 *
 * POP is the only red control in the app's restaurant flows; it pops the drawer.
 */
const meta = {
    title: "App Screens/6-tabs/Tab listing",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell
            title="Tabs"
            active="tabs"
            showOverflow={false}
            subBar={<TabsFilterBar />}
            actionBar={
                <>
                    <ActionButton tone="disabled">Back</ActionButton>
                    <ActionButton tone="danger" icon={<SaveAltIcon />}>
                        Pop
                    </ActionButton>
                    <ActionButton icon={<BoltIcon />}>Quick Order</ActionButton>
                    <ActionButton icon={<RestaurantIcon />}>Tables</ActionButton>
                    <ActionButton tone="primary" icon={<AddIcon />}>
                        Create a Tab
                    </ActionButton>
                </>
            }
        >
            <TabList rows={openTabs} />
        </AppShell>
    ),
};
