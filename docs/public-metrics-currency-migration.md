# Public Metrics Currency Verification

Public contribution totals and money-derived meal estimates are intentionally hidden. Historical Appwrite transaction documents do not contain a currency field, so their amounts cannot be safely combined as INR.

No production data migration is part of this release.

Before restoring public totals, a future migration must:

1. Export historical transaction references without changing them.
2. Resolve each payment's currency from Razorpay or another authoritative provider record.
3. Record an auditable currency value for every included transaction and quarantine unresolved records.
4. Reconcile recurring and one-time transaction classifications by Razorpay payment ID.
5. Verify the resulting INR-only aggregate against a second report.
6. Restore public totals only after unresolved and mixed-currency records cannot enter the calculation.

Until those checks are complete, genuine approved feeding records remain the public evidence and the stats endpoint returns the currency-verification status without monetary values.
