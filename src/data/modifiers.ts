/**
 * Modifier groups, from `references/072926/6-tabs/`.
 *
 * The item detail screen puts these behind a horizontally scrolling tab strip:
 * one tab per group, a five-column grid of options under it, and any number of
 * them selectable at once. Nothing is exclusive — TO GO and MEDIUM WELL and NO BUN
 * can all be on the same burger — which is why they are checkboxes rather than
 * radios despite looking like radios.
 *
 * The group names and the whole Burger Test option list are the operator's own,
 * misspellings included: "Alergies", "MOZARELLA". They are the labels a cook
 * reads off a ticket, so correcting them here would make the prototype disagree
 * with the kitchen.
 *
 * Only some options carry a price. An unpriced modifier still has to appear on the
 * line, because "NO BUN" changes the plate even though it changes no money.
 */

export interface Modifier {
    name: string;
    /** Added to the line's unit price. Absent means free. */
    price?: number;
}

export interface ModifierGroup {
    name: string;
    options: Modifier[];
}

const free = (...names: string[]): Modifier[] => names.map((name) => ({ name }));

export const modifierGroups: ModifierGroup[] = [
    {
        name: "Alergies",
        options: free("Peanut Alergy", "Gluten", "Dairy", "Shellfish", "Tree Nut", "Soy", "Egg"),
    },
    {
        // Verbatim, in the device's own order — which is not alphabetical and not
        // grouped by kind, so a cook hunts for MEDIUM WELL among the toppings.
        name: "Burger Test",
        options: [
            { name: "ADD BACON", price: 1 },
            { name: "ADD CHICKEN", price: 2 },
            { name: "ADD STEAK", price: 4 },
            ...free("APPLE SLICES"),
            { name: "EXTRA CHEESE", price: 1 },
            ...free("FRIES", "MEDIUM WELL", "MOZARELLA", "NO LETTUCE", "TO GO", "WELL DONE"),
            { name: "ADD EGG", price: 1.5 },
            ...free("KETCHUP", "LETTUCE WRAP", "TOTS"),
            { name: "MAC N CHEESE PATTY", price: 3 },
            { name: "SWEET POTATO FRIES", price: 1.5 },
            ...free("DEEP FRIED"),
            { name: "BURNT ENDS", price: 4 },
            { name: "BRISKET", price: 5 },
            { name: "DOUBLE MEAT", price: 5 },
            ...free("MUSTARD", "NO BUN", "PICKLES"),
            { name: "TRIPLE MEAT", price: 9 },
            { name: "PRETZEL BUN", price: 1 },
            { name: "ONION RINGS", price: 2 },
            ...free("ADD ONIONS"),
            { name: "BLUE CHEESE", price: 1 },
        ],
    },
    {
        name: "Burger mods",
        options: [
            ...free("Rare", "Medium Rare", "Medium", "Medium Well", "Well Done"),
            { name: "Impossible Patty", price: 3 },
            ...free("Butter Bun", "Dry Bun"),
        ],
    },
    {
        name: "Sides",
        options: [
            { name: "Fries", price: 3 },
            { name: "Tots", price: 3.5 },
            { name: "Sweet Potato Fries", price: 4 },
            { name: "Onion Rings", price: 4.5 },
            { name: "Side Salad", price: 4 },
            { name: "Slaw", price: 2.5 },
            ...free("No Side"),
        ],
    },
    {
        name: "Sandwich Toppings",
        options: [
            ...free("Lettuce", "Tomato", "Red Onion", "Pickles", "Jalapeños", "Banana Peppers"),
            { name: "Avocado", price: 2 },
            { name: "Fried Egg", price: 1.5 },
        ],
    },
    {
        name: "Cheeses",
        options: [
            ...free("American", "Cheddar", "Swiss", "Provolone"),
            { name: "Blue Cheese", price: 1 },
            { name: "Pepper Jack", price: 1 },
            { name: "Mozarella", price: 1 },
        ],
    },
    {
        name: "Temp",
        options: free("Rare", "Medium Rare", "Medium", "Medium Well", "Well Done", "Butterflied"),
    },
    {
        name: "Specials",
        options: [
            { name: "Make it a Combo", price: 5 },
            { name: "Double Up", price: 6 },
            ...free("Chef's Choice", "Kids Portion", "Half Portion"),
        ],
    },
    {
        name: "Taco Time Test",
        options: [...free("Soft Shell", "Hard Shell", "No Cilantro"), { name: "Extra Salsa", price: 0.75 }, { name: "Queso", price: 1.5 }],
    },
    {
        name: "Other",
        options: free("Rush", "Allergy Alert", "Hold", "Split Plate", "To Go Box"),
    },
];

/** What a set of modifier names adds to a line's unit price. */
export const modifierSurcharge = (names: string[]): number => {
    const priced = new Map<string, number>();
    for (const group of modifierGroups) {
        for (const option of group.options) if (option.price) priced.set(option.name, option.price);
    }
    return names.reduce((sum, name) => sum + (priced.get(name) ?? 0), 0);
};

/**
 * How modifiers read on an order line.
 *
 * The device runs them together with no separators and hangs each price straight
 * off the name it belongs to — `Medium Rare Fries Mozarella +$1.00 Peanut Alergy`.
 * Which price belongs to which modifier is genuinely ambiguous, and worth leaving
 * that way rather than inventing a punctuation the kitchen has never seen.
 */
export const modifierLine = (names: string[]): string => {
    const priced = new Map<string, number>();
    for (const group of modifierGroups) {
        for (const option of group.options) if (option.price) priced.set(option.name, option.price);
    }
    return names.map((name) => (priced.has(name) ? `${name} +$${priced.get(name)!.toFixed(2)}` : name)).join(" ");
};
