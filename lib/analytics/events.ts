export const PUBLIC_FUNNEL_EVENTS = [
  "evidence_viewed",
  "donate_clicked",
  "amount_selected",
  "checkout_started",
  "checkout_dismissed",
  "checkout_failed",
  "checkout_succeeded",
] as const;

export type PublicFunnelEvent = (typeof PUBLIC_FUNNEL_EVENTS)[number];
export type FunnelPlanType = "seedling" | "sprout" | "tree" | "custom";
export type CheckoutFailureCode =
  | "gateway_unavailable"
  | "order_create_failed"
  | "subscription_create_failed"
  | "checkout_open_failed"
  | "verification_failed";

interface PublicFunnelEventProperties {
  evidence_viewed: undefined;
  donate_clicked: { placement: "hero" | "final" };
  amount_selected: { planType: FunnelPlanType; amount: number };
  checkout_started: { planType: FunnelPlanType; amount: number };
  checkout_dismissed: { planType: FunnelPlanType; amount: number };
  checkout_failed: {
    planType: FunnelPlanType;
    amount: number;
    errorCode: CheckoutFailureCode;
  };
  checkout_succeeded: { planType: FunnelPlanType; amount: number };
}

type TrackArguments<Name extends PublicFunnelEvent> =
  PublicFunnelEventProperties[Name] extends undefined
    ? []
    : [properties: PublicFunnelEventProperties[Name]];

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const eventNames = new Set<string>(PUBLIC_FUNNEL_EVENTS);
const planTypes = new Set<string>(["seedling", "sprout", "tree", "custom"]);
const failureCodes = new Set<string>([
  "gateway_unavailable",
  "order_create_failed",
  "subscription_create_failed",
  "checkout_open_failed",
  "verification_failed",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlanType(value: unknown): value is FunnelPlanType {
  return typeof value === "string" && planTypes.has(value);
}

function isAmount(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0 && (value as number) <= 100_000;
}

function planAndAmount(value: unknown): { planType: FunnelPlanType; amount: number } | null {
  if (!isObject(value) || !isPlanType(value.planType) || !isAmount(value.amount)) {
    return null;
  }

  return { planType: value.planType, amount: value.amount };
}

function sanitizeProperties(
  name: PublicFunnelEvent,
  properties: unknown,
): Record<string, string | number> | null {
  if (name === "evidence_viewed") return {};

  if (name === "donate_clicked") {
    if (!isObject(properties) || (properties.placement !== "hero" && properties.placement !== "final")) {
      return null;
    }

    return { placement: properties.placement };
  }

  const selection = planAndAmount(properties);
  if (!selection) return null;

  if (name === "checkout_failed") {
    if (
      !isObject(properties)
      || typeof properties.errorCode !== "string"
      || !failureCodes.has(properties.errorCode)
    ) {
      return null;
    }

    return { ...selection, errorCode: properties.errorCode };
  }

  return selection;
}

export function trackPublicEvent<Name extends PublicFunnelEvent>(
  name: Name,
  ...args: TrackArguments<Name>
): void {
  if (!eventNames.has(name) || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  const properties = sanitizeProperties(name, args[0]);
  if (properties === null) return;

  try {
    window.gtag("event", name, properties);
  } catch {
    // Measurement must never interrupt the donation experience.
  }
}
