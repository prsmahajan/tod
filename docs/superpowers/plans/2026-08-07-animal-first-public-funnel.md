# Animal-First Public Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a focused animal-first public portal that removes technology articles from the visitor journey, presents only honest impact evidence, and allows guest donations without a TOD account.

**Architecture:** Preserve the existing Next.js App Router application and the visual system in `design.md`. Introduce small pure domain helpers for donation amounts and impact labelling, use the existing featured-photo API as the only first-release source of feeding evidence, and keep Razorpay webhooks authoritative for stored transactions. This phase does not invent an expense ledger; it exposes the absence honestly and leaves the full verified-expense subsystem for the next implementation plan.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, Tailwind CSS 4, Appwrite, Razorpay, Sonner, Node test runner through `tsx`.

## Global Constraints

- TOD is entirely animal-first; technology publishing is absent from public navigation and all article routes redirect to `/`.
- Existing article data is preserved and never deleted by this plan.
- Guest one-time and recurring contributions do not require a TOD account.
- Stock photographs and fictional impact stories cannot appear as TOD evidence.
- Raised totals mean confirmed successful payments; calculated meals must be labelled `Estimated Meals Funded`.
- Only featured/approved uploaded feeding photos may appear as public feeding records.
- All new public UI follows `design.md`: Manrope headings, DM Sans body, Inter navigation, semantic theme colors, four-pixel spacing base, existing breakpoints, thin borders, pill CTAs, and restrained shadow.
- Do not add a new runtime dependency. Tests use the existing `tsx` package and `node:test`.
- Preserve unrelated user changes, including `.DS_Store`.

---

### Task 1: Add Test Command and Donation/Impact Domain Rules

**Files:**
- Modify: `package.json`
- Create: `lib/donations/public-rules.ts`
- Create: `lib/impact/public-metrics.ts`
- Create: `tests/public-rules.test.ts`
- Create: `tests/public-metrics.test.ts`

**Interfaces:**
- Produces: `DONATION_AMOUNTS_INR`, `DonationPlan`, `getDonationAmount(plan, customAmount)`, and `PublicImpactMetrics`.
- Produces: `toPublicImpactMetrics(stats)` for later homepage and impact components.

- [ ] **Step 1: Add the test script**

Add to `package.json` scripts:

```json
"test": "tsx --test tests/**/*.test.ts"
```

- [ ] **Step 2: Write failing donation-rule tests**

Create `tests/public-rules.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { getDonationAmount } from "../lib/donations/public-rules";

test("returns server-owned preset amounts", () => {
  assert.equal(getDonationAmount("seedling"), 99);
  assert.equal(getDonationAmount("sprout"), 499);
  assert.equal(getDonationAmount("tree"), 999);
});

test("accepts a whole-number custom amount from 50 to 100000", () => {
  assert.equal(getDonationAmount("custom", 250), 250);
  assert.throws(() => getDonationAmount("custom", 49), /between/);
  assert.throws(() => getDonationAmount("custom", 100001), /between/);
  assert.throws(() => getDonationAmount("custom", 99.5), /whole/);
});

test("does not let a preset plan override its server amount", () => {
  assert.equal(getDonationAmount("seedling", 1), 99);
});
```

- [ ] **Step 3: Write failing public-metric tests**

Create `tests/public-metrics.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { toPublicImpactMetrics } from "../lib/impact/public-metrics";

test("labels derived meals as estimates", () => {
  const metrics = toPublicImpactMetrics({
    totalRevenue: 1500,
    totalSupporters: 5,
    activeSubscriptions: 1,
    animalsHelped: 29,
  });

  assert.deepEqual(metrics, {
    raisedInr: 1500,
    supporters: 5,
    activeSupporters: 1,
    estimatedMealsFunded: 29,
  });
});
```

- [ ] **Step 4: Run the tests and verify failure**

Run: `npm test`

Expected: FAIL because both modules are missing.

- [ ] **Step 5: Implement the minimal donation rules**

Create `lib/donations/public-rules.ts`:

```ts
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
```

- [ ] **Step 6: Implement the metric boundary**

Create `lib/impact/public-metrics.ts`:

```ts
export interface RawPublicStats {
  totalRevenue: number;
  totalSupporters: number;
  activeSubscriptions: number;
  animalsHelped: number;
}

export interface PublicImpactMetrics {
  raisedInr: number;
  supporters: number;
  activeSupporters: number;
  estimatedMealsFunded: number;
}

export function toPublicImpactMetrics(stats: RawPublicStats): PublicImpactMetrics {
  return {
    raisedInr: stats.totalRevenue,
    supporters: stats.totalSupporters,
    activeSupporters: stats.activeSubscriptions,
    estimatedMealsFunded: stats.animalsHelped,
  };
}
```

- [ ] **Step 7: Run tests**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add package.json lib/donations/public-rules.ts lib/impact/public-metrics.ts tests/public-rules.test.ts tests/public-metrics.test.ts
git commit -m "test: define public donation and impact rules"
```

---

### Task 2: Remove Technology Publishing From the Public Journey

**Files:**
- Modify: `components/Header.tsx`
- Modify: `components/Footer.tsx`
- Replace: `app/articles/page.tsx`
- Replace: `app/articles/[slug]/page.tsx`
- Modify: `app/sitemap.ts`
- Create: `tests/public-navigation.test.ts`
- Create: `lib/public-navigation.ts`

**Interfaces:**
- Produces: `PUBLIC_NAV_LINKS`, consumed by header and footer.
- Produces: redirect-only article route modules.

- [ ] **Step 1: Write the failing navigation test**

Create `tests/public-navigation.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { PUBLIC_NAV_LINKS } from "../lib/public-navigation";

test("public navigation is animal-first", () => {
  assert.deepEqual(PUBLIC_NAV_LINKS, [
    { name: "Feeding Updates", path: "/impact", primary: false },
    { name: "Our Story", path: "/mission", primary: false },
    { name: "Transparency", path: "/impact#transparency", primary: false },
    { name: "Donate", path: "/support", primary: true },
  ]);
  assert.equal(PUBLIC_NAV_LINKS.some((link) => link.path.startsWith("/articles")), false);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- tests/public-navigation.test.ts`

Expected: FAIL because `lib/public-navigation.ts` is missing.

- [ ] **Step 3: Create the shared navigation definition**

Create `lib/public-navigation.ts`:

```ts
export const PUBLIC_NAV_LINKS = [
  { name: "Feeding Updates", path: "/impact", primary: false },
  { name: "Our Story", path: "/mission", primary: false },
  { name: "Transparency", path: "/impact#transparency", primary: false },
  { name: "Donate", path: "/support", primary: true },
] as const;
```

- [ ] **Step 4: Use the shared links in header and footer**

Remove the local `NAV_LINKS` arrays from `components/Header.tsx` and `components/Footer.tsx`. Import `PUBLIC_NAV_LINKS`. Render the final Donate link with the existing primary pill style and the other links with existing navigation typography.

- [ ] **Step 5: Replace article routes with redirects**

Replace both article page modules with the appropriate zero-content server route. For `app/articles/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function ArticlesRedirect() {
  redirect("/");
}
```

For `app/articles/[slug]/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function ArticleRedirect() {
  redirect("/");
}
```

- [ ] **Step 6: Remove article URLs from the sitemap**

Update `app/sitemap.ts` so it emits public animal-first routes only and does not query or expose post slugs.

- [ ] **Step 7: Run tests and type checking**

Run: `npm test`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: exit 0.

- [ ] **Step 8: Commit**

```bash
git add lib/public-navigation.ts tests/public-navigation.test.ts components/Header.tsx components/Footer.tsx app/articles/page.tsx app/articles/[slug]/page.tsx app/sitemap.ts
git commit -m "feat: make public navigation animal-first"
```

---

### Task 3: Make Razorpay Checkout Safe for Guest Donors

**Files:**
- Modify: `app/api/razorpay/create-order/route.ts`
- Modify: `app/api/razorpay/create-subscription/route.ts`
- Modify: `app/api/razorpay/verify-payment/route.ts`
- Modify: `app/support/page.tsx`
- Create: `app/support/success/page.tsx`
- Create: `tests/payment-signature.test.ts`
- Create: `lib/razorpay/verify-signature.ts`

**Interfaces:**
- Consumes: `getDonationAmount(plan, customAmount)` from Task 1.
- Produces: `verifyPaymentSignature(orderId, paymentId, signature, secret): boolean`.
- Produces: guest-safe checkout and `/support/success` confirmation page.

- [ ] **Step 1: Write failing signature tests**

Create `tests/payment-signature.test.ts`:

```ts
import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { verifyPaymentSignature } from "../lib/razorpay/verify-signature";

test("accepts a valid Razorpay signature", () => {
  const secret = "test_secret";
  const expected = crypto.createHmac("sha256", secret).update("order_1|pay_1").digest("hex");
  assert.equal(verifyPaymentSignature("order_1", "pay_1", expected, secret), true);
});

test("rejects an invalid Razorpay signature", () => {
  assert.equal(verifyPaymentSignature("order_1", "pay_1", "0".repeat(64), "test_secret"), false);
});
```

- [ ] **Step 2: Run the signature tests and verify failure**

Run: `npm test -- tests/payment-signature.test.ts`

Expected: FAIL because the helper is missing.

- [ ] **Step 3: Implement timing-safe verification**

Create `lib/razorpay/verify-signature.ts`:

```ts
import crypto from "node:crypto";

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): boolean {
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}
```

- [ ] **Step 4: Make order amounts server-owned**

Change `app/api/razorpay/create-order/route.ts` to accept:

```ts
interface CreateOrderBody {
  planType: "seedling" | "sprout" | "tree" | "custom";
  customAmount?: number;
  notes?: Record<string, string>;
}
```

Resolve the charge with `getDonationAmount(planType, customAmount)`. Ignore any legacy client-supplied `amount`. Return status 400 for validation errors.

- [ ] **Step 5: Use the shared signature verifier**

Replace direct string equality in `app/api/razorpay/verify-payment/route.ts` with `verifyPaymentSignature`. Keep the webhook authoritative for database transaction recording.

- [ ] **Step 6: Remove the TOD-auth gate from support**

In `app/support/page.tsx`:

- Keep `useAuth` only to prefill checkout for an existing signed-in supporter; remove every auth gate and auth-loading dependency from payment initiation.
- Send `planType` rather than an arbitrary preset amount to the order endpoint.
- Use optional user details only when a signed-in user is already available; do not require them.
- Remove the bottom “Please sign in” card.
- Keep one-time donation selected by default.
- Keep recurring support explicit and unselected until the user chooses it.
- Redirect a verified checkout return to `/support/success?payment_id=...&order_id=...`.

- [ ] **Step 7: Make subscription creation guest-safe**

Allow empty customer fields in `app/api/razorpay/create-subscription/route.ts`. Store `userId: "anonymous"` in notes when no account exists. Keep Razorpay responsible for required checkout contact collection.

- [ ] **Step 8: Create the confirmation page**

Create `app/support/success/page.tsx` as a server page that reads `payment_id` and `order_id`, displays a calm success message, shows both identifiers, links to `/impact`, and does not claim a specific feeding outcome.

- [ ] **Step 9: Run verification**

Run: `npm test`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: exit 0.

Run: `npm run build`

Expected: production build succeeds.

- [ ] **Step 10: Commit**

```bash
git add app/api/razorpay/create-order/route.ts app/api/razorpay/create-subscription/route.ts app/api/razorpay/verify-payment/route.ts app/support/page.tsx app/support/success/page.tsx lib/razorpay/verify-signature.ts tests/payment-signature.test.ts
git commit -m "feat: allow safe guest donations"
```

---

### Task 4: Replace the Homepage With an Animal-First Story

**Files:**
- Replace: `app/page.tsx`
- Create: `components/home/AnimalFirstHero.tsx`
- Create: `components/home/LatestFeedingRecords.tsx`
- Create: `components/home/FounderStory.tsx`
- Create: `components/home/DonationChoices.tsx`
- Modify: `components/CommunityStats.tsx`

**Interfaces:**
- Consumes: `/api/public/stats` and `/api/photos/featured`.
- Consumes: `toPublicImpactMetrics` from Task 1.
- Produces: an animal-first homepage with no technology or waitlist content.

- [ ] **Step 1: Update CommunityStats to honest labels**

Map API values through `toPublicImpactMetrics`. Replace `Meals Served` with `Estimated Meals Funded`. Keep the existing design tokens and card measurements.

- [ ] **Step 2: Create AnimalFirstHero**

Use this content hierarchy:

```tsx
<h1>Help Feed Stray Animals</h1>
<p>
  For ten months, this work has been funded personally. TOD now makes every contribution
  and verified feeding update visible so more animals can receive consistent meals.
</p>
```

Primary action: `Donate ₹99` linking to `/support`.

Secondary action: `See Feeding Updates` linking to `/impact`.

Do not insert a stock or generated hero photograph. If no verified featured photo is available, use a bordered text panel stating that genuine feeding updates are shown below.

- [ ] **Step 3: Create LatestFeedingRecords**

Fetch `/api/photos/featured`, display at most three records, and show:

- `feedDate`
- `location` when present
- `animalCount` when present
- `description`
- uploaded `imageUrl`
- contributor name as “Shared by …”

When the API returns no records, render `No verified feeding records published yet.` with a link to `/impact`.

- [ ] **Step 4: Create FounderStory**

Use the confirmed fact only: the founder personally funded feeding for ten months. Do not invent a name, spending total, number of animals, or neighborhood. Render a text-first section that can later accept genuine media.

- [ ] **Step 5: Create DonationChoices**

Show one-time amounts ₹99, ₹499, and ₹999 using the existing support-card visual language. Each action links to `/support?plan=seedling`, `/support?plan=sprout`, or `/support?plan=tree`. Include a quiet link for monthly support.

- [ ] **Step 6: Compose the new homepage**

Order:

1. AnimalFirstHero
2. CommunityStats
3. LatestFeedingRecords
4. Four-step donation-to-proof explanation
5. FounderStory
6. DonationChoices
7. Transparency preview linking to `/impact#transparency`
8. Footer

Remove the typewriter hook, technology education copy, Read Articles actions, waitlist actions, decorative star illustration, and unsupported 85/10/5 allocation claims.

- [ ] **Step 7: Run verification**

Run: `npm test`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: exit 0.

Run: `npm run build`

Expected: production build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx components/home components/CommunityStats.tsx
git commit -m "feat: rebuild homepage around verified animal feeding"
```

---

### Task 5: Replace Stock Impact Content With Genuine Records

**Files:**
- Replace: `app/impact/page.tsx`
- Create: `components/impact/FeedingRecordCard.tsx`
- Create: `components/impact/TransparencyStatus.tsx`
- Modify: `app/impact/layout.tsx`

**Interfaces:**
- Consumes: `/api/public/stats`, `/api/photos/featured`, and `CommunityStats`.
- Produces: genuine evidence-only impact page and `#transparency` anchor.

- [ ] **Step 1: Create FeedingRecordCard**

Accept the existing `FeaturedPhoto` shape:

```ts
interface FeaturedPhoto {
  id: string;
  imageUrl: string;
  description: string;
  userName: string;
  location?: string;
  feedDate: string;
  animalCount?: number;
}
```

Render the factual fields without adding a fictional story or outcome.

- [ ] **Step 2: Create TransparencyStatus**

Create the `id="transparency"` section. State clearly that the first release shows confirmed donations and featured feeding records, while verified expense reconciliation is being prepared. Do not claim “every rupee tracked” until that ledger exists.

- [ ] **Step 3: Replace the impact page**

Keep:

- Hero heading using the documented typography.
- Honest CommunityStats labels.
- SupportersWall if its data loads.
- Genuine featured uploads.

Remove:

- All Unsplash URLs.
- The infinite stock-photo marquee.
- Feeding, Shelter, Care, and Awareness stock cards.
- Raja and Misty stories.
- Multi-city day-in-the-life claims.
- “Radical Transparency” claims not backed by a public ledger.
- The broken `#/mission` link.

- [ ] **Step 4: Update metadata**

Set the impact page description to `Verified feeding updates and confirmed community support for stray animals.` Do not mention real-time expense tracking.

- [ ] **Step 5: Run verification**

Run: `rg -n "unsplash|Raja|Misty|Radical Transparency|#/mission" app/impact components/impact`

Expected: no matches.

Run: `npm test && npx tsc --noEmit && npm run build`

Expected: all succeed.

- [ ] **Step 6: Commit**

```bash
git add app/impact/page.tsx app/impact/layout.tsx components/impact
git commit -m "feat: show genuine feeding evidence on impact page"
```

---

### Task 6: Remove Waitlist Distractions and Add Funnel Measurement

**Files:**
- Modify: `components/PublicLayoutWrapper.tsx`
- Modify: `components/GoogleAnalytics.tsx`
- Create: `lib/analytics/events.ts`
- Modify: `app/support/page.tsx`
- Modify: `components/home/AnimalFirstHero.tsx`
- Create: `tests/analytics-events.test.ts`

**Interfaces:**
- Produces: `trackPublicEvent(name, properties?)` with an allowlisted event-name union.
- Removes: global `ExitIntentPopup` from the public layout.

- [ ] **Step 1: Write failing analytics event tests**

Create `tests/analytics-events.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { PUBLIC_FUNNEL_EVENTS } from "../lib/analytics/events";

test("defines the animal-first donation funnel", () => {
  assert.deepEqual(PUBLIC_FUNNEL_EVENTS, [
    "evidence_viewed",
    "donate_clicked",
    "amount_selected",
    "checkout_started",
    "checkout_dismissed",
    "checkout_failed",
    "checkout_succeeded",
  ]);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- tests/analytics-events.test.ts`

Expected: FAIL because the module is missing.

- [ ] **Step 3: Implement a privacy-conscious event wrapper**

Create `lib/analytics/events.ts` with the exact allowlist above. Export a client-safe `trackPublicEvent` that calls `window.gtag("event", name, properties)` only when available. Do not include email, phone, payment identifiers, names, or free-form user text.

- [ ] **Step 4: Instrument the funnel**

- Hero and final Donate actions: `donate_clicked` with `{ placement: "hero" | "final" }`.
- Feeding record section once visible: `evidence_viewed`.
- Plan selection: `amount_selected` with `{ planType, amount }`.
- Before Razorpay opens: `checkout_started`.
- Razorpay modal dismissal: `checkout_dismissed`.
- Checkout or verification exception: `checkout_failed` with a controlled error code, not raw error text.
- Verified return: `checkout_succeeded` with `{ planType, amount }`, not transaction ID.

- [ ] **Step 5: Remove the global waitlist popup**

Delete the `ExitIntentPopup` import and render from `components/PublicLayoutWrapper.tsx`. Preserve the source component and waitlist data; this task only removes it from the active public experience.

- [ ] **Step 6: Run verification**

Run: `npm test && npx tsc --noEmit && npm run build`

Expected: all succeed.

Run: `rg -n "ExitIntentPopup|Join the Waitlist|join waitlist" app/page.tsx components/PublicLayoutWrapper.tsx components/home app/support`

Expected: no active public matches.

- [ ] **Step 7: Commit**

```bash
git add components/PublicLayoutWrapper.tsx components/GoogleAnalytics.tsx lib/analytics/events.ts app/support/page.tsx components/home/AnimalFirstHero.tsx tests/analytics-events.test.ts
git commit -m "feat: measure the guest donation funnel"
```

---

### Task 7: Accessibility, Responsive, and Final Regression Pass

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes all public components from Tasks 2–6.
- Produces a build-ready first release with reduced motion and verified routes.

- [ ] **Step 1: Add reduced-motion behavior**

Add to `app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  html,
  * {
    scroll-behavior: auto !important;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Run the full automated suite**

Run: `npm test`

Expected: all tests PASS.

Run: `npx tsc --noEmit`

Expected: exit 0.

Run: `npm run build`

Expected: production build succeeds without route or type errors.

- [ ] **Step 3: Verify public copy and assets mechanically**

Run:

```bash
rg -n "Learn Technology|Read Articles|Join the Waitlist|unsplash|Raja|Misty|Meals Served|85%|Radical Transparency" app/page.tsx app/impact app/support components/Header.tsx components/Footer.tsx components/home components/impact
```

Expected: no matches except an explicitly documented migration comment, which should be removed before commit.

- [ ] **Step 4: Verify browser behavior at desktop and mobile widths**

At 1280 × 720 and 390 × 844, verify:

- Donate is the dominant action.
- No horizontal overflow exists.
- Heading and body sizes match `design.md`.
- Genuine-record empty states are readable.
- Header collapses at `md` as before.
- Support checkout does not show a TOD sign-in requirement.
- All controls have visible keyboard focus.
- Off-white, lavender, and black themes remain legible.

- [ ] **Step 5: Verify route behavior**

Check:

- `/articles` redirects to `/`.
- `/articles/any-existing-slug` redirects to `/`.
- `/support` allows checkout initiation while signed out.
- `/support/success` handles missing query identifiers without crashing and asks the donor to contact support if confirmation data is missing.
- `/impact#transparency` reaches the honest transparency section.

- [ ] **Step 6: Review the diff for unrelated changes**

Run: `git status --short` and `git diff --check`.

Expected: `.DS_Store` remains untouched; no unrelated admin or CMS changes appear.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css
git commit -m "fix: complete animal-first public funnel"
```

## Next Plan

After this first release is working, create a separate plan for verified expense records, receipt media, monthly reconciliation, admin approval workflows, and historical feeding imports. That subsystem requires Appwrite collection changes and should not block the immediate conversion fixes in this plan.
