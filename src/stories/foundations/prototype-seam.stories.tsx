import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card, DocPage, DocSection, Token } from "../shared/doc-shell";

/**
 * How the prototype and this system stay one thing.
 *
 * Written down because it is a rule, not a habit, and the next person to add a
 * screen will otherwise reinvent it — probably by giving a component a `useStore`
 * call, which is the one move that breaks everything else on this page.
 */
const meta = {
    title: "Foundations/Prototype Seam",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Mono = ({ children }: { children: React.ReactNode }) => (
    <Box
        component="pre"
        sx={{
            m: 0,
            p: 2,
            bgcolor: "action.hover",
            borderRadius: 1,
            fontSize: 13,
            lineHeight: 1.7,
            overflowX: "auto",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
    >
        {children}
    </Box>
);

const layers = [
    {
        name: "Data",
        where: "src/data/",
        holds: "Domain types and the seeded world: the tee sheet's 40 times, the 100-record customer database, the food and merchandise catalogues, the floor plans.",
        why: "Lives here, not in the prototype, so a story can import the same records the running app uses. Data that only exists in the app means every story hand-writes a fixture, and the two drift within a week.",
    },
    {
        name: "Components",
        where: "src/components/",
        holds: "Everything that renders. Chrome, the kit, and one component per screen region — the tee sheet's four views, the gift-card table, the floor-plan renderer, the dialogs.",
        why: "Takes props, returns markup, knows nothing about the store. That is what lets the same component appear in a story with a fixture and in the prototype with live state.",
    },
    {
        name: "Adapters",
        where: "app/src/screens/*-views.tsx",
        holds: "Translation. Store shapes in, component props out.",
        why: "The seam. All the awkward per-view knowledge lives here — why a reservation is purple in List and navy in Grid, why Multi's sibling courses run on their own intervals — instead of leaking into either side.",
    },
    {
        name: "Screens",
        where: "app/src/screens/",
        holds: "Routes. Read the store, call adapters, compose components, pass callbacks.",
        why: "The only layer allowed to know both worlds.",
    },
];

const rules = [
    {
        rule: "A component in src/ never calls useStore.",
        because: "The moment it does, it can only render inside the app, and its story has to fake a provider. Pass data down instead.",
    },
    {
        rule: "Interaction arrives as an optional callback.",
        because:
            "onOpenTime, onSelect, onSave. Undefined means inert, which is what a story wants; supplied means live, which is what the prototype wants. One component, both jobs.",
    },
    {
        rule: "Fixtures are defaults, not separate exports.",
        because:
            "A default parameter lets a story render the component bare while the prototype passes real rows. Two parallel component variants is how they fall out of sync.",
    },
    {
        rule: "Seeded generators, never Math.random.",
        because:
            "The smoke suite asserts against these records and screenshots get compared across commits. A world that reshuffles on reload makes both worthless.",
    },
    {
        rule: "Reproduce the shipping app's defects, and say so in a comment.",
        because:
            "NAY WITH CARD, Csutomer Balance, a table that runs off the right edge. Silently correcting them makes the replica disagree with the device it exists to represent, and these are exactly what a redesign should be arguing about.",
    },
];

/**
 * The four layers, the five rules, and the one worked example.
 */
export const Docs: Story = {
    render: () => (
        <DocPage
            title="Prototype Seam"
            intro="The prototype is where flows get discovered. This system is where they get documented. They share components and data, and the translation between them lives in exactly one place."
        >
            <DocSection
                title="Four layers"
                note="Each one is allowed to know about the layer below it and nothing above. Screens are the only place both worlds meet."
            >
                <Stack spacing={2}>
                    {layers.map((layer, index) => (
                        <Card key={layer.name}>
                            <Stack spacing={1}>
                                <Stack direction="row" sx={{ alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
                                    <Typography variant="h6">
                                        {index + 1}. {layer.name}
                                    </Typography>
                                    <Token>{layer.where}</Token>
                                </Stack>
                                <Typography variant="body2">{layer.holds}</Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {layer.why}
                                </Typography>
                            </Stack>
                        </Card>
                    ))}
                </Stack>
            </DocSection>

            <DocSection
                title="The worked example"
                note="The tee sheet's four views. One set of components renders the Storybook stories and drives a live 40-time sheet with no branching between the two."
            >
                <Mono>{`// src/components/screens/tee-sheet/tee-sheet-views.tsx
//   Fixtures as defaults, interaction as an optional callback.
export const TeeSheetListView = ({
    rows = listRows,
    onOpenTime,          // undefined in a story, supplied by the app
}: { rows?: SheetRow[]; onOpenTime?: (time: string) => void }) => ...

// app/src/screens/tee-sheet-views.tsx
//   The seam. Every per-view quirk lives here, not in the component.
export const toListRows = (times: TeeTimeBooking[]): SheetRow[] => ...
export const toGridCards = (times: TeeTimeBooking[]): GridCard[] => ...

// app/src/screens/tee-sheet.tsx
//   The screen knows both worlds, and only passes things down.
<SheetBody
    view={view}
    times={teeTimes}
    onOpenTime={(time) => navigate(\`/teesheet/\${encodeURIComponent(time)}\`)}
/>`}</Mono>
            </DocSection>

            <DocSection title="Five rules" note="Each one exists because breaking it has already cost time on this project.">
                <Stack spacing={2}>
                    {rules.map((r) => (
                        <Card key={r.rule}>
                            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                                {r.rule}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                {r.because}
                            </Typography>
                        </Card>
                    ))}
                </Stack>
            </DocSection>

            <DocSection
                title="Which direction the work flows"
                note="Both, but not at the same time — and knowing which direction you are in tells you where the change belongs."
            >
                <Stack spacing={2}>
                    <Card>
                        <Typography variant="subtitle1">Reference → system → prototype</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                            Transcribing a screen from the shipping app. Build the component in <Token>src/</Token> with a fixture and a
                            story first, then have a screen compose it. The story is the record of what the device does; the prototype is
                            the proof it holds together.
                        </Typography>
                    </Card>
                    <Card>
                        <Typography variant="subtitle1">Prototype → system</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                            Something learned by operating the thing — a flow with a dead end, a state nobody had drawn, a screen that needs
                            a control it does not have. That belongs back in <Token>src/</Token> as a component and a story, so the next
                            conversation about it starts from a drawing rather than from memory.
                        </Typography>
                    </Card>
                </Stack>
            </DocSection>
        </DocPage>
    ),
};
