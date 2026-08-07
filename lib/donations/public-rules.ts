export const DONATION_AMOUNTS_INR = {
  seedling: 99,
  sprout: 499,
  tree: 999,
} as const;

export type DonationPlan = keyof typeof DONATION_AMOUNTS_INR | "custom";

export function getDonationAmount(plan: DonationPlan, customAmount?: number): number {
  if (plan !== "custom") return DONATION_AMOUNTS_INR[plan];
  if (!Number.isInteger(customAmount)) {
    throw new Error("Custom donation must be a whole rupee amount");
  }
  if (customAmount! < 50 || customAmount! > 100000) {
    throw new Error("Custom donation must be between ₹50 and ₹1,00,000");
  }
  return customAmount!;
}
