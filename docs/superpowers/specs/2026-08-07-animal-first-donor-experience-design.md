# TOD Animal-First Donor Experience

Date: 2026-08-07
Status: approved direction
Visual system: `design.md`

## Purpose

Turn TOD into a focused animal-feeding initiative that helps a first-time visitor understand the mission, verify the work, and donate without unnecessary steps.

TOD will no longer present technology publishing as part of its public purpose. Existing article data will be preserved, but `/articles` and article detail URLs will redirect to the homepage. Article links and active publishing entry points will be removed.

## Primary user and task

The primary user is a person who cares about stray animals but does not yet know or trust TOD.

Their primary task is to confirm that the work is genuine and make a one-time or recurring contribution with minimal friction.

## Product principles

1. Animals first. Every public screen should support feeding, verification, or contribution.
2. Proof before persuasion. Genuine dated records are more important than marketing claims.
3. Guest donation first. An account is optional and offered only after payment.
4. Actuals and estimates never mix. Money raised, money spent, animals fed, and estimated capacity are separate measures.
5. Honest absence. Missing proof produces a clear empty state, never stock evidence or invented activity.
6. Preserve the approved visual system. New UI follows `design.md` without introducing a new brand language.

## Public information architecture

### Header

- Logo/home
- Feeding Updates
- Our Story
- Transparency
- Primary Donate CTA
- Quiet supporter login access outside the primary decision path

### Homepage

1. Animal-first hero with a genuine feeding image, short personal statement, and Donate ₹99 primary CTA.
2. Verified impact summary: confirmed donations, verified expenses, current balance, verified animals fed, and latest feeding date.
3. Three latest approved feeding records with date, location, quantities, cost, genuine media, and receipt evidence when available.
4. Simple process: donate, purchase food, feed animals, publish proof.
5. Founder story covering the ten-month personal effort and why TOD exists.
6. Donation choices: one-time first, recurring second, guest checkout allowed.
7. Current monthly transparency report with opening balance, donations, expenses, and closing balance.
8. Final Donate CTA.

### Impact

`/impact` becomes a dated feeding and expense ledger. It supports honest empty states and shows only approved records in public totals.

### Support

`/support` becomes a short guest checkout flow. Account creation is not required before payment.

### Mission

`/mission` becomes the founder story, the operating model, and the initiative's transparency commitments.

### Articles

- `/articles` redirects to `/`.
- `/articles/[slug]` redirects to `/`.
- Article links are removed from public header and footer navigation.
- Active article publishing entry points are removed or disabled.
- Existing article data is retained; this project does not delete it.

## Donation experience

### One-time contribution

1. Visitor selects ₹99, ₹499, ₹999, or a valid custom amount.
2. Razorpay checkout opens without requiring a TOD account.
3. The payment provider collects the minimum necessary payer information.
4. The server creates the order using an allowed server-side amount, not an untrusted arbitrary client value.
5. The server verifies the signature returned by checkout; the signed, idempotent webhook is authoritative for recording final payment status.
6. The successful transaction is stored exactly once.
7. A confirmation page shows the amount, transaction ID, status, and what happens next.
8. Optional account creation is offered after confirmation.

### Recurring contribution

- Recurring support is a deliberate alternate choice, never preselected deceptively.
- Amount, frequency, auto-debit behavior, and cancellation terms appear before checkout.
- Subscription status changes come from Razorpay webhooks.
- The supporter can cancel from the existing dashboard or a clearly linked account route.

### Payment states

- Loading: chosen amount is preserved and the control shows progress.
- Gateway unavailable: show a retry action without losing context.
- Dismissed: return to the amount selector without claiming a failed charge.
- Pending: show pending until authoritative server confirmation arrives.
- Failed: show a plain explanation and safe retry.
- Successful: display only after authoritative verification.
- Duplicate webhook: no duplicate transaction or impact totals.

## Impact and financial records

### Feeding record

Each record contains:

- Feeding date
- City and area
- Feeder or volunteer name
- Animal types
- Verified animal count
- Food type and quantity
- Actual amount spent
- Genuine photographs
- Optional receipt image
- Short factual note
- Draft, pending, approved, or rejected status
- Published date

Only approved feeding records contribute to the public verified-animal total.

### Expense record

Each expense contains:

- Date
- Category
- Amount
- Description
- Receipt image when available
- Optional linked feeding record
- Verification status

Only verified expenses contribute to public spending totals.

### Monthly transparency report

The public reconciliation is:

`opening balance + confirmed donations - verified expenses = closing balance`

Payment fees and platform costs use explicit expense categories. They are not hidden inside a generic percentage.

### Public metric definitions

- Raised: successful recorded payment transactions.
- Spent: verified expense records.
- Balance: raised funds plus opening balance minus verified expenses.
- Animals fed: approved feeding-record counts.
- Estimated meals possible: optional derived estimate, always labelled as an estimate and never presented as completed impact.

## Reusable interface units

- `DonationCTA`: consistent primary donation action and amount context.
- `DonationCheckout`: one-time/recurring choice, amount selection, and gateway launch.
- `ImpactSummary`: confirmed raised, spent, balance, and verified animal count.
- `FeedingRecordCard`: factual dated evidence with genuine media.
- `ExpenseRow`: public expense details and receipt access.
- `MonthlyTransparencyReport`: month-level reconciliation.
- `FounderStory`: personal origin and identity.
- `HonestEmptyState`: plain-language absence without manufactured proof.

Each unit consumes semantic visual tokens documented in `design.md` and has one clear responsibility.

## Honest empty states

Approved wording patterns include:

- No verified feeding records published yet.
- Receipts for this month are being prepared.
- No monthly supporters yet. Be the first.
- This payment is still being confirmed.

The system must not use stock photographs, generated stories, fictional animals, calculated meals, or fake supporter activity as substitutes for evidence.

## Founder-supplied content

The interface must work before all personal assets are available. Genuine content will be added when supplied:

- Founder name and short biography
- Ten-month origin story
- Primary operating city and areas
- Genuine feeding photographs or video
- Historical spending summary
- Receipts suitable for public display

Missing items use an honest unpublished state; implementation does not invent them.

## Visual constraints

All public work follows `design.md`, including:

- Off-white, lavender, and black theme tokens
- Manrope headings, DM Sans body, and Inter navigation
- Existing mobile and desktop type scale
- Four-pixel spacing base
- Existing container widths and breakpoints
- Thin borders, restrained shadow, pill CTAs, and 8–16px card radii
- Keyboard focus visibility and minimum mobile text sizing

The redesign changes meaning and hierarchy, not brand identity.

## Accessibility and motion

- Donation controls are keyboard reachable and retain visible focus.
- Every form control has an accessible label and error relationship.
- Payment state is not conveyed by color alone.
- Genuine evidence images have factual alt text; decorative images have empty alt text.
- Touch targets are at least 44px high.
- New and existing trust-critical content remains visible without animation.
- A reduced-motion path disables or minimizes entrance, floating, and typewriter motion.

## Measurement

The funnel records privacy-conscious events without payment secrets or unnecessary personal data:

1. Homepage viewed
2. Evidence viewed
3. Donate clicked
4. Amount selected
5. Checkout started
6. Checkout pending, failed, dismissed, or successful
7. Recurring support selected

This makes it possible to distinguish traffic, trust, authentication, checkout, and payment problems.

## Testing

### Automated

- Article routes redirect to `/`.
- Allowed donation amounts are validated server-side.
- Signed payment verification accepts valid signatures and rejects invalid signatures.
- Webhook handling is idempotent.
- Successful payments are stored once.
- Only approved feeding records affect verified totals.
- Only verified expenses affect spending and balance.
- Monthly reconciliation produces the expected closing balance.
- Empty states render when no verified data exists.

### Browser

- Homepage and support flow at 390px and 1280px.
- Guest donation reaches Razorpay without TOD login.
- One-time and recurring modes are distinguishable.
- Pending, dismissed, failed, and successful payment states are understandable.
- Off-white, lavender, and black themes remain readable.
- Keyboard focus order reaches the Donate action and checkout controls.
- Reduced-motion preference is respected.

### Content verification

- No public stock imagery is presented as TOD impact.
- No unverified record contributes to public totals.
- Every financial number maps to a stored source record.
- Every completed-impact claim has a date and verification source.

## Rollout order

1. Remove article discovery and add redirects.
2. Make homepage animal-first using honest empty states where genuine assets are missing.
3. Remove account requirements from one-time checkout and harden payment verification.
4. Add verified feeding and expense records.
5. Replace the current impact page with the public ledger.
6. Add monthly reconciliation and funnel measurement.
7. Add genuine founder media and historical records as they become available.

## Out of scope

- Deleting existing article data.
- Inventing or generating impact evidence.
- Registering TOD as an NGO or providing legal/tax certification.
- Rebranding the existing visual system.
- Building volunteer scheduling, rescue dispatch, adoption, or veterinary case-management systems.

## Completion criteria

The first release is complete when a new visitor can understand TOD as an animal-feeding initiative, inspect genuine or honestly empty proof, donate without creating an account, receive authoritative payment status, and see public figures that reconcile to verified records.
