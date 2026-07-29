// GENERATED FILE — do not edit by hand.
// Run `npm run generate:food` to regenerate from store/images/food.
//
// Food and beverage photography for the restaurant screens. The source images
// carry no metadata, so names, descriptions and prices are authored in
// scripts/generate-food-catalog.mjs and mapped positionally by sorted filename.
// Resolve images with `storeImage(item.path)`.

export interface FoodItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: FoodCategory;
    /** Path under /store-images, e.g. "food/abc-retina-large.jpg". */
    path: string;
}

export type FoodCategory = "Snacks" | "Grill" | "Sandwiches" | "Combos" | "Beverages" | "Hamburgers" | "Beer" | "Wine";

export const foodCategories: FoodCategory[] = ["Snacks", "Grill", "Sandwiches", "Combos", "Beverages", "Hamburgers", "Beer", "Wine"];

export const foodItems: FoodItem[] = [
    {
        id: "3-musketeers",
        name: "3 Musketeers",
        description: "Whipped chocolate nougat bar.",
        price: 3,
        category: "Snacks",
        path: "food/01163d89-d142-4418-bf11-6b36e15ce16e-retina-large-variant-1.jpeg",
    },
    {
        id: "chili-dog",
        name: "Chili Dog",
        description: "All-beef frank, house chili, steamed bun.",
        price: 7.5,
        category: "Grill",
        path: "food/08a0ddf1-0a81-4a77-8379-e8e0332b48ba-retina-large.jpg",
    },
    {
        id: "snickers",
        name: "Snickers",
        description: "Peanuts, caramel and nougat in milk chocolate.",
        price: 3,
        category: "Snacks",
        path: "food/0e41ac03-1d46-4a2c-9d8c-7fe161a909ca-retina-large-variant-1.jpeg",
    },
    {
        id: "nashville-hot-chicken-sandwich",
        name: "Nashville Hot Chicken Sandwich",
        description: "Spiced fried chicken, pickles, brioche bun.",
        price: 14.5,
        category: "Sandwiches",
        path: "food/1d281750-4653-4fb8-90d9-9d2df7b5c5d3-retina-large.jpeg",
    },
    {
        id: "turn-combo",
        name: "Turn Combo",
        description: "Sub, chips and a fountain drink — the turn-shack standard.",
        price: 16,
        category: "Combos",
        path: "food/1f75325b-a0b4-4045-b123-49cbc77676f4-retina-large.jpg",
    },
    {
        id: "hershey-s-almond",
        name: "Hershey's Almond",
        description: "Milk chocolate with whole almonds.",
        price: 3,
        category: "Snacks",
        path: "food/2392bd10-66de-4472-82d7-7a2a2ae7674b-retina-large-variant-1.jpeg",
    },
    {
        id: "bottled-water",
        name: "Bottled Water",
        description: "Chilled still water, 20 oz.",
        price: 3,
        category: "Beverages",
        path: "food/42f76d3f-aae7-46ca-ba6d-bd03a490a468-retina-large-variant-1.jpeg",
    },
    {
        id: "peanut-m-m-s",
        name: "Peanut M&M's",
        description: "Single-serve peanut chocolate candies.",
        price: 3.25,
        category: "Snacks",
        path: "food/4314f99d-92d4-46a1-92bf-62b1b8fbeafd-retina-large-variant-1.jpeg",
    },
    {
        id: "snickers-sharing",
        name: "Snickers — Sharing",
        description: "Two-bar sharing size.",
        price: 4.5,
        category: "Snacks",
        path: "food/4487dc40-d2ac-4af9-a44f-0d8d693b25a0-retina-large-variant-1.jpeg",
    },
    {
        id: "milk-chocolate-m-m-s",
        name: "Milk Chocolate M&M's",
        description: "Single-serve milk chocolate candies.",
        price: 3.25,
        category: "Snacks",
        path: "food/5955e32e-296c-4bd5-96e2-a4bc626f0012-retina-large-variant-1.jpeg",
    },
    {
        id: "clubhouse-cheeseburger",
        name: "Clubhouse Cheeseburger",
        description: "Quarter-pound patty, American cheese, lettuce and tomato.",
        price: 13,
        category: "Hamburgers",
        path: "food/59a3c5f1-7cce-4aaf-a073-8c77043c4333-retina-large.jpg",
    },
    {
        id: "tuna-sub",
        name: "Tuna Sub",
        description: "Albacore tuna salad, lettuce, tomato, red onion.",
        price: 12,
        category: "Sandwiches",
        path: "food/59f4b310-4f85-41be-8271-7c22e85bf9fc-retina-large.jpg",
    },
    {
        id: "miller-lite",
        name: "Miller Lite",
        description: "Domestic light lager, 12 oz can.",
        price: 7,
        category: "Beer",
        path: "food/5a387180-b304-404c-9556-9ab4f617d83e-retina-large-variant-1.jpeg",
    },
    {
        id: "milk-chocolate-m-m-s-sharing",
        name: "Milk Chocolate M&M's — Sharing",
        description: "10 oz sharing bag.",
        price: 5.5,
        category: "Snacks",
        path: "food/5b9c0f88-26bb-4b1a-b98a-639cf294f264-retina-large-variant-1.jpeg",
    },
    {
        id: "sapporo-premium",
        name: "Sapporo Premium",
        description: "Japanese rice lager, tall can.",
        price: 9,
        category: "Beer",
        path: "food/6a3dbee3-a438-420b-bac4-dcd1af7c4b49-retina-large.jpeg",
    },
    {
        id: "steak-sub-combo",
        name: "Steak Sub Combo",
        description: "Steak and cheese sub, SunChips and iced tea.",
        price: 18,
        category: "Combos",
        path: "food/73943dcf-a6c2-401a-a298-8e2512550e46-retina-large.jpg",
    },
    {
        id: "yes-way-ros",
        name: "Yes Way Rosé",
        description: "Provençal-style rosé, by the glass.",
        price: 12,
        category: "Wine",
        path: "food/743ddcb6-6657-4866-9fe0-5ac6d4932251-retina-large.jpeg",
    },
    {
        id: "peanut-m-m-s-sharing",
        name: "Peanut M&M's — Sharing",
        description: "10 oz sharing bag.",
        price: 5.5,
        category: "Snacks",
        path: "food/7ab74799-c62b-4020-b278-10e1136d51c6-retina-large-variant-1.jpeg",
    },
    {
        id: "chicken-tenders",
        name: "Chicken Tenders",
        description: "Four hand-breaded tenders with a dipping sauce.",
        price: 12.5,
        category: "Grill",
        path: "food/7adc0db2-b331-4cf3-97c8-87025a0a24db-retina-large.jpg",
    },
    {
        id: "19-crimes-red",
        name: "19 Crimes Red",
        description: "Australian red blend, by the glass.",
        price: 13,
        category: "Wine",
        path: "food/83226f0a-1885-49a4-85c5-06657a8374c4-retina-large.jpg",
    },
    {
        id: "crispy-chicken-sandwich",
        name: "Crispy Chicken Sandwich",
        description: "Breaded breast, lettuce, mayo, toasted bun.",
        price: 13.5,
        category: "Sandwiches",
        path: "food/867427fb-da88-49cb-b7d0-83c9492e6b76-retina-large.jpg",
    },
    {
        id: "meatball-marinara",
        name: "Meatball Marinara",
        description: "Meatballs, marinara and provolone on a toasted roll.",
        price: 12.5,
        category: "Sandwiches",
        path: "food/8e2cd8e8-8889-4628-b158-e60615f3fa2f-retina-large.jpeg",
    },
    {
        id: "roast-beef-cheddar",
        name: "Roast Beef & Cheddar",
        description: "Shaved roast beef, cheddar, onion bun.",
        price: 13,
        category: "Sandwiches",
        path: "food/925ffa4d-8ee0-420d-b232-4ec0f425cfb4-retina-large.jpg",
    },
    {
        id: "grilled-chicken-sandwich",
        name: "Grilled Chicken Sandwich",
        description: "Marinated breast, slaw, brioche bun.",
        price: 13.5,
        category: "Sandwiches",
        path: "food/972e22cd-875d-453f-8933-5939ce392b8e-retina-large.jpg",
    },
    {
        id: "lobster-roll-fries",
        name: "Lobster Roll & Fries",
        description: "Buttered split-top roll, lobster salad, fries.",
        price: 26,
        category: "Grill",
        path: "food/97575ead-a36e-432b-bef9-efb02b709809-retina-large.jpg",
    },
    {
        id: "josh-cabernet-sauvignon",
        name: "Josh Cabernet Sauvignon",
        description: "California cabernet, by the glass.",
        price: 14,
        category: "Wine",
        path: "food/986c7a47-b74a-48a9-bab6-52bdbb74ad89-retina-large.jpeg",
    },
    {
        id: "redd-s-wicked",
        name: "Redd's Wicked",
        description: "Hard fruit ale, 8% ABV.",
        price: 8,
        category: "Beer",
        path: "food/98c5ed29-a503-434a-9236-56cb0246bb2b-retina-large-variant-1.jpg",
    },
    {
        id: "corona-extra",
        name: "Corona Extra",
        description: "Mexican lager, served with lime.",
        price: 8,
        category: "Beer",
        path: "food/9a322d5b-ba44-4b10-a409-da838ac1852b-retina-large-variant-1.jpeg",
    },
    {
        id: "decoy-cabernet-sauvignon",
        name: "Decoy Cabernet Sauvignon",
        description: "Duckhorn's Decoy cabernet, by the glass.",
        price: 16,
        category: "Wine",
        path: "food/9c30d499-a262-414b-bb30-bca840c9edd1-retina-large.jpg",
    },
    {
        id: "ham-swiss-sub",
        name: "Ham & Swiss Sub",
        description: "Black forest ham, swiss, lettuce, tomato.",
        price: 12,
        category: "Sandwiches",
        path: "food/a1f36c8b-7b1c-438c-b092-e64a76924740-retina-large.jpeg",
    },
    {
        id: "bottled-coke",
        name: "Bottled Coke",
        description: "Coca-Cola, 20 oz bottle.",
        price: 3.5,
        category: "Beverages",
        path: "food/a7c6721e-055b-4af1-948e-617785846403-retina-large-variant-1.jpg",
    },
    {
        id: "southwest-chicken-wrap",
        name: "Southwest Chicken Wrap",
        description: "Grilled chicken, peppers, black beans, chipotle.",
        price: 12,
        category: "Sandwiches",
        path: "food/b446cec1-9da0-4f55-85ce-69fdc34a89ea-retina-large.jpg",
    },
    {
        id: "stella-rosa-moscato",
        name: "Stella Rosa Moscato",
        description: "Semi-sweet Italian moscato, by the glass.",
        price: 12,
        category: "Wine",
        path: "food/bafe6449-a361-417c-b9ed-9178a267999d-retina-large.jpeg",
    },
    {
        id: "dasani-water",
        name: "Dasani Water",
        description: "Purified water, 20 oz bottle.",
        price: 3,
        category: "Beverages",
        path: "food/c7246336-4a02-4ff3-b261-68e4ca33475f-retina-large.jpg",
    },
    {
        id: "kit-kat",
        name: "Kit Kat",
        description: "Crisp wafers in milk chocolate.",
        price: 3,
        category: "Snacks",
        path: "food/c88d093a-a788-48db-bd6f-6fe9f9b505ff-retina-large-variant-1.jpeg",
    },
    {
        id: "nestl-crunch",
        name: "Nestlé Crunch",
        description: "Milk chocolate with crisped rice.",
        price: 3,
        category: "Snacks",
        path: "food/c8dad47d-3d5d-4603-873d-60df60d09616-retina-large-variant-1.jpg",
    },
    {
        id: "clubhouse-blt",
        name: "Clubhouse BLT",
        description: "Thick-cut bacon, lettuce, tomato, mayo.",
        price: 11.5,
        category: "Sandwiches",
        path: "food/cf9c1042-7a78-4e4c-9058-60c75c1eb5f0-retina-large.jpg",
    },
    {
        id: "lobster-roll-basket",
        name: "Lobster Roll Basket",
        description: "Lobster roll with a side of fries.",
        price: 26,
        category: "Grill",
        path: "food/db432ac5-6b84-4f37-98ec-1e896878acb4-retina-large.jpg",
    },
    {
        id: "basket-of-fries",
        name: "Basket of Fries",
        description: "Shoestring fries, sea salt.",
        price: 6,
        category: "Grill",
        path: "food/df255965-5b5e-46e6-99aa-c6d00b1b8059-retina-large.jpg",
    },
    {
        id: "coca-cola",
        name: "Coca-Cola",
        description: "Classic Coke, 12 oz can.",
        price: 3,
        category: "Beverages",
        path: "food/e0bc0df1-d672-4f5a-87b9-4ac071c4189c-retina-large-variant-1.jpg",
    },
    {
        id: "kit-kat-king-size",
        name: "Kit Kat — King Size",
        description: "Four-finger king size bar.",
        price: 4,
        category: "Snacks",
        path: "food/ee01a7e4-2dc0-47ff-b814-e33df13d9f5c-retina-large-variant-1.jpg",
    },
];

/** Items in one category, in catalogue order. */
export const foodByCategory = (category: FoodCategory) => foodItems.filter((i) => i.category === category);

/** Look up a single item by id — used where a screen names a specific product. */
export const food = (id: string) => foodItems.find((i) => i.id === id);
