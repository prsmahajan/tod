# Admin One-Time Payments Design

## Goal

Let an administrator switch the existing subscriptions screen between recurring subscriptions and individual one-time payment records, then find a donor by name or email.

## Approved Experience

- Add a `Support type` dropdown to `/admin/subscriptions`.
- The dropdown has two choices:
  - `Recurring subscriptions`
  - `One-time payments`
- Keep the existing search control beside the dropdown.
- Search matches donor name or email in the selected view.
- Each one-time payment appears as its own row. Multiple payments from the same donor remain separate.
- The one-time table shows donor, amount, payment status, payment reference, and payment date.
- Successful and failed records are clearly distinguishable.
- Subscription-only actions such as cancel, extend, and verify are not shown in one-time mode.
- Preserve the current admin typography, colors, spacing, table treatment, loading state, empty state, and pagination style.

## Data and Safety

- Recurring mode continues using the existing admin subscriptions API and behavior.
- One-time mode reads the private Appwrite `transactions` collection through an admin server endpoint.
- The endpoint requires verified server-side admin authorization; the client-side admin wrapper alone is not sufficient protection for donor records.
- Only records with `type = one-time` are returned.
- The browser must not receive card, UPI, bank, signature, or webhook-secret data.
- The endpoint returns only the fields required by the table.
- Name/email search is applied server-side and pagination remains bounded.
- The feature is read-only. It does not change, refund, delete, or reclassify payment records.

## Error Handling

- Loading the selected view shows the existing loading treatment.
- No matching payments shows a plain empty state rather than an error.
- A storage or network failure shows an admin-facing error and keeps the last safe UI state.
- Changing support type or search resets pagination to the first page.

## Testing

- The one-time endpoint returns only one-time records and only permitted fields.
- Search matches donor names and emails without exposing unrelated records.
- Pagination is bounded and deterministic.
- The dropdown switches data sources and resets the page.
- One-time mode renders payment-specific columns and hides subscription actions.
- Existing recurring-subscription behavior remains unchanged.

## Out of Scope

- Combining several payments into one donor total.
- Refund or payment-management controls.
- Redesigning the admin subscriptions page.
- Changing historical payment data.
- Adding Ko-fi records, because Ko-fi is not currently connected to this storage pipeline.
