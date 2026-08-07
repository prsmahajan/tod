export const ROOT_METADATA_COPY = {
  title: "The Open Draft (TOD) - Feed Stray Animals in India",
  description:
    "Support stray animal feeding through confirmed donations and verified feeding updates. See genuine records and contribute without creating an account.",
  openGraphTitle: "The Open Draft (TOD) - Help Feed Stray Animals",
  openGraphDescription:
    "See verified feeding updates and support consistent meals for stray animals in India.",
  imageAlt: "The Open Draft - Help Feed Stray Animals",
  keywords: [
    "todr",
    "todr.in",
    "the open draft",
    "theopendraft",
    "stray animals India",
    "feed stray dogs",
    "feed stray cats",
    "animal welfare India",
    "donate for animals",
    "help stray animals",
    "animal feeding India",
    "animal rescue",
    "volunteer for animals",
    "stray dog feeding",
    "verified animal feeding updates",
  ],
} as const;

export const DONATION_TO_PROOF_STEPS = [
  {
    title: "Choose a contribution",
    description: "Select a one-time amount or choose recurring support on the donation page.",
  },
  {
    title: "Payment is confirmed",
    description: "Only successful payment records are included in the public amount raised.",
  },
  {
    title: "Food is purchased and served",
    description: "Feeding work continues, with genuine records added when they are ready to publish.",
  },
  {
    title: "Proof is published",
    description: "Approved updates show the available date, place, animal count, note, and photograph.",
  },
] as const;

export const DONATION_CHOICES = [
  {
    name: "Seedling",
    amount: 99,
    href: "/support?plan=seedling",
    description: "A small one-time contribution toward the next feeding round.",
  },
  {
    name: "Sprout",
    amount: 499,
    href: "/support?plan=sprout",
    description: "A larger one-time contribution toward food for stray animals.",
  },
  {
    name: "Tree",
    amount: 999,
    href: "/support?plan=tree",
    description: "One-time support for keeping feeding work consistent.",
  },
] as const;
