# Admin One-Time Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure `Support type` dropdown to `/admin/subscriptions` so an administrator can search and review individual one-time payment records alongside recurring subscriptions.

**Architecture:** Keep the existing `/api/admin/subscriptions` endpoint and recurring response intact, adding a `supportType=recurring|one-time` branch. A short-lived Appwrite JWT will prove the signed-in browser session to a new server-side guard, which also checks the PostgreSQL user role before any donor data is returned. One-time records will be read-only, reduced to a safe response shape, searched on the server, and rendered by a focused table component using the existing admin design tokens.

**Tech Stack:** Next.js App Router, React, TypeScript, Appwrite Web SDK, node-appwrite, Prisma/PostgreSQL, Tailwind CSS, Node test runner with `tsx`.

## Global Constraints

- Preserve the current admin typography, colors, spacing, table treatment, loading state, empty state, and pagination style.
- Recurring mode continues using the existing admin subscriptions API and behavior.
- Only Appwrite transaction documents with `type = one-time` may appear in one-time mode.
- Return only donor name, donor email, amount, payment status, payment reference, and payment date; never return card, UPI, bank, signature, webhook-secret, order-secret, or raw document data.
- Require verified server-side `ADMIN` authorization; client-side route protection and caller-supplied email headers are not authorization.
- Search by donor name or email is case-insensitive and applied on the server.
- Each payment remains a separate row, including multiple payments by the same donor.
- One-time mode is read-only and contains no cancel, extend, verify, refund, delete, or reclassify action.
- Page size is exactly 20. Server scanning is limited to the newest 5,000 one-time documents and the response exposes `truncated: true` when that safety ceiling is reached.
- Changing support type or search resets the page to 1.
- Ko-fi ingestion and historical data changes remain out of scope.

---

## File Structure

- Create `lib/admin/admin-api-auth.ts`: extracts the bearer token, verifies it with Appwrite, and checks the PostgreSQL role.
- Create `lib/admin/one-time-payments.ts`: owns safe transaction types, normalization, case-insensitive matching, deterministic sorting, and bounded pagination.
- Create `components/admin/OneTimePaymentsTable.tsx`: renders payment-only columns, badges, masked/revealable donor email, empty state, truncation notice, and existing pagination treatment.
- Modify `lib/appwrite/auth.tsx`: expose a short-lived authenticated request-header helper from the existing browser Appwrite account.
- Modify `app/api/admin/subscriptions/route.ts`: authorize every request, retain the recurring branch, and add the one-time branch.
- Modify `app/admin/subscriptions/page.tsx`: add support-type state/dropdown, authenticated fetching, safe last-state error handling, and one-time table selection.
- Create `tests/admin-api-auth.test.ts`: guard behavior for missing, invalid, non-admin, and admin callers.
- Create `tests/admin-one-time-payments.test.ts`: safe mapping, filtering, sorting, cap, and pagination behavior.
- Create `tests/admin-subscriptions-view.test.ts`: UI wiring and one-time table rendering assertions.

---

### Task 1: Verified Server-Side Admin Authorization

**Files:**
- Create: `lib/admin/admin-api-auth.ts`
- Modify: `lib/appwrite/auth.tsx`
- Test: `tests/admin-api-auth.test.ts`

**Interfaces:**
- Produces: `createAuthenticatedHeaders(): Promise<Record<string, string>>` for browser requests.
- Produces: `requireAdminRequest(request: Request, dependencies?: AdminAuthDependencies): Promise<AdminIdentity>` for protected API routes.
- Produces: `AdminIdentity = { id: string; email: string; role: "ADMIN" }`.

- [ ] **Step 1: Write failing authorization tests**

```ts
// tests/admin-api-auth.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { AdminAuthError, requireAdminRequest } from "../lib/admin/admin-api-auth";

const request = (authorization?: string) =>
  new Request("http://localhost/api/admin/subscriptions", {
    headers: authorization ? { authorization } : {},
  });

test("admin API rejects a missing bearer token", async () => {
  await assert.rejects(
    requireAdminRequest(request(), {
      verifyJwt: async () => ({ $id: "unused", email: "unused@example.com" }),
      findRoleByEmail: async () => "ADMIN",
    }),
    (error: unknown) => error instanceof AdminAuthError && error.status === 401,
  );
});

test("admin API rejects an invalid Appwrite JWT", async () => {
  await assert.rejects(
    requireAdminRequest(request("Bearer bad-token"), {
      verifyJwt: async () => { throw new Error("invalid token"); },
      findRoleByEmail: async () => "ADMIN",
    }),
    (error: unknown) => error instanceof AdminAuthError && error.status === 401,
  );
});

test("admin API rejects an authenticated non-admin", async () => {
  await assert.rejects(
    requireAdminRequest(request("Bearer valid-token"), {
      verifyJwt: async () => ({ $id: "user-1", email: "member@example.com" }),
      findRoleByEmail: async () => "SUBSCRIBER",
    }),
    (error: unknown) => error instanceof AdminAuthError && error.status === 403,
  );
});

test("admin API returns the verified ADMIN identity", async () => {
  const identity = await requireAdminRequest(request("Bearer valid-token"), {
    verifyJwt: async (jwt) => {
      assert.equal(jwt, "valid-token");
      return { $id: "admin-1", email: "admin@example.com" };
    },
    findRoleByEmail: async () => "ADMIN",
  });
  assert.deepEqual(identity, { id: "admin-1", email: "admin@example.com", role: "ADMIN" });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails because the module does not exist**

Run: `node --import tsx --test tests/admin-api-auth.test.ts`

Expected: FAIL with `Cannot find module '../lib/admin/admin-api-auth'`.

- [ ] **Step 3: Implement the injectable server guard**

```ts
// lib/admin/admin-api-auth.ts
import { Account, Client } from "node-appwrite";
import { prisma } from "@/lib/db";

type VerifiedAppwriteUser = { $id: string; email: string };
type DatabaseRole = "SUBSCRIBER" | "AUTHOR" | "EDITOR" | "ADMIN" | null;

export type AdminIdentity = { id: string; email: string; role: "ADMIN" };
export type AdminAuthDependencies = {
  verifyJwt: (jwt: string) => Promise<VerifiedAppwriteUser>;
  findRoleByEmail: (email: string) => Promise<DatabaseRole>;
};

export class AdminAuthError extends Error {
  constructor(message: string, public readonly status: 401 | 403) {
    super(message);
    this.name = "AdminAuthError";
  }
}

async function verifyJwt(jwt: string): Promise<VerifiedAppwriteUser> {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
    .setJWT(jwt);
  return new Account(client).get();
}

async function findRoleByEmail(email: string): Promise<DatabaseRole> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return user?.role ?? null;
}

const defaults: AdminAuthDependencies = { verifyJwt, findRoleByEmail };

export async function requireAdminRequest(
  request: Request,
  dependencies: AdminAuthDependencies = defaults,
): Promise<AdminIdentity> {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new AdminAuthError("Authentication required", 401);

  let user: VerifiedAppwriteUser;
  try {
    user = await dependencies.verifyJwt(match[1]);
  } catch {
    throw new AdminAuthError("Authentication required", 401);
  }

  const role = await dependencies.findRoleByEmail(user.email);
  if (role !== "ADMIN") throw new AdminAuthError("Administrator access required", 403);
  return { id: user.$id, email: user.email, role: "ADMIN" };
}
```

- [ ] **Step 4: Expose authenticated browser headers through the existing Appwrite account**

Add this exported helper beside the existing `account` in `lib/appwrite/auth.tsx`:

```ts
export async function createAuthenticatedHeaders(): Promise<Record<string, string>> {
  const token = await account.createJWT();
  return { Authorization: `Bearer ${token.jwt}` };
}
```

This uses the active Appwrite session and does not persist the JWT in local storage.

- [ ] **Step 5: Run the authorization test and TypeScript-check the two changed modules**

Run: `node --import tsx --test tests/admin-api-auth.test.ts`

Expected: 4 tests PASS.

Run: `npx tsc --noEmit --pretty false 2>&1 | rg "admin-api-auth|lib/appwrite/auth"`

Expected: no output. The repository may still report unrelated pre-existing TypeScript errors outside these files.

- [ ] **Step 6: Commit the authorization boundary**

```bash
git add lib/admin/admin-api-auth.ts lib/appwrite/auth.tsx tests/admin-api-auth.test.ts
git commit -m "fix: verify admin subscription requests"
```

---

### Task 2: Safe, Bounded One-Time Payment Query Model

**Files:**
- Create: `lib/admin/one-time-payments.ts`
- Test: `tests/admin-one-time-payments.test.ts`

**Interfaces:**
- Consumes: Appwrite transaction documents with `$id`, `$createdAt`, `type`, `userName`, `userEmail`, `amount`, `status`, and `razorpayPaymentId`.
- Produces: `OneTimePayment` with only `id`, `donorName`, `donorEmail`, `amount`, `status`, `paymentReference`, and `paidAt`.
- Produces: `buildOneTimePaymentPage(documents, { search, page, limit, truncated }): OneTimePaymentPage`.
- Produces constants `ONE_TIME_PAGE_SIZE = 20`, `ONE_TIME_SCAN_PAGE_SIZE = 100`, and `ONE_TIME_SCAN_LIMIT = 5000`.

- [ ] **Step 1: Write failing model tests**

```ts
// tests/admin-one-time-payments.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildOneTimePaymentPage,
  normalizeOneTimePayment,
  ONE_TIME_PAGE_SIZE,
  type TransactionDocument,
} from "../lib/admin/one-time-payments";

const tx = (overrides: Partial<TransactionDocument> = {}): TransactionDocument => ({
  $id: "tx-1",
  $createdAt: "2026-08-08T10:00:00.000Z",
  type: "one-time",
  userName: "Asha Rao",
  userEmail: "asha@example.com",
  amount: 500,
  status: "success",
  razorpayPaymentId: "pay_123",
  razorpayOrderId: "order_private",
  signature: "never-return-this",
  ...overrides,
});

test("normalization returns only table-safe one-time fields", () => {
  assert.deepEqual(normalizeOneTimePayment(tx()), {
    id: "tx-1",
    donorName: "Asha Rao",
    donorEmail: "asha@example.com",
    amount: 500,
    status: "success",
    paymentReference: "pay_123",
    paidAt: "2026-08-08T10:00:00.000Z",
  });
  assert.equal(normalizeOneTimePayment(tx({ type: "subscription" })), null);
});

test("search matches donor name or email case-insensitively", () => {
  const documents = [
    tx(),
    tx({ $id: "tx-2", userName: "Kabir Singh", userEmail: "kabir@example.com" }),
  ];
  assert.deepEqual(buildOneTimePaymentPage(documents, { search: "ASHA", page: 1 }).payments.map(p => p.id), ["tx-1"]);
  assert.deepEqual(buildOneTimePaymentPage(documents, { search: "KABIR@EXAMPLE", page: 1 }).payments.map(p => p.id), ["tx-2"]);
});

test("sorting is newest first with id as deterministic tie breaker", () => {
  const documents = [
    tx({ $id: "b", $createdAt: "2026-08-09T10:00:00.000Z" }),
    tx({ $id: "c", $createdAt: "2026-08-09T10:00:00.000Z" }),
    tx({ $id: "a", $createdAt: "2026-08-08T10:00:00.000Z" }),
  ];
  assert.deepEqual(buildOneTimePaymentPage(documents, { search: "", page: 1 }).payments.map(p => p.id), ["c", "b", "a"]);
});

test("pagination is fixed at 20 and reports the scan ceiling", () => {
  const documents = Array.from({ length: 21 }, (_, index) => tx({ $id: `tx-${index}` }));
  const result = buildOneTimePaymentPage(documents, { search: "", page: 2, truncated: true });
  assert.equal(ONE_TIME_PAGE_SIZE, 20);
  assert.equal(result.payments.length, 1);
  assert.deepEqual(result.pagination, { page: 2, limit: 20, total: 21, totalPages: 2, truncated: true });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails because the module does not exist**

Run: `node --import tsx --test tests/admin-one-time-payments.test.ts`

Expected: FAIL with `Cannot find module '../lib/admin/one-time-payments'`.

- [ ] **Step 3: Implement safe normalization, search, sorting, and pagination**

```ts
// lib/admin/one-time-payments.ts
export const ONE_TIME_PAGE_SIZE = 20;
export const ONE_TIME_SCAN_PAGE_SIZE = 100;
export const ONE_TIME_SCAN_LIMIT = 5000;

export type TransactionDocument = {
  $id: string;
  $createdAt: string;
  type?: unknown;
  userName?: unknown;
  userEmail?: unknown;
  amount?: unknown;
  status?: unknown;
  razorpayPaymentId?: unknown;
  [key: string]: unknown;
};

export type OneTimePayment = {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  status: string;
  paymentReference: string;
  paidAt: string;
};

export type OneTimePaymentPage = {
  payments: OneTimePayment[];
  pagination: { page: number; limit: 20; total: number; totalPages: number; truncated: boolean };
};

const stringValue = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

export function normalizeOneTimePayment(document: TransactionDocument): OneTimePayment | null {
  if (document.type !== "one-time") return null;
  return {
    id: document.$id,
    donorName: stringValue(document.userName, "Unnamed supporter"),
    donorEmail: stringValue(document.userEmail, "Email unavailable"),
    amount: typeof document.amount === "number" && Number.isFinite(document.amount) ? document.amount : 0,
    status: stringValue(document.status, "unknown").toLowerCase(),
    paymentReference: stringValue(document.razorpayPaymentId, "Unavailable"),
    paidAt: document.$createdAt,
  };
}

export function buildOneTimePaymentPage(
  documents: TransactionDocument[],
  options: { search: string; page: number; truncated?: boolean },
): OneTimePaymentPage {
  const search = options.search.trim().toLocaleLowerCase("en");
  const page = Number.isInteger(options.page) && options.page > 0 ? options.page : 1;
  const matches = documents
    .map(normalizeOneTimePayment)
    .filter((payment): payment is OneTimePayment => payment !== null)
    .filter(payment => !search || payment.donorName.toLocaleLowerCase("en").includes(search) || payment.donorEmail.toLocaleLowerCase("en").includes(search))
    .sort((left, right) => right.paidAt.localeCompare(left.paidAt) || right.id.localeCompare(left.id));
  const totalPages = Math.max(1, Math.ceil(matches.length / ONE_TIME_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ONE_TIME_PAGE_SIZE;
  return {
    payments: matches.slice(start, start + ONE_TIME_PAGE_SIZE),
    pagination: {
      page: safePage,
      limit: ONE_TIME_PAGE_SIZE,
      total: matches.length,
      totalPages,
      truncated: options.truncated === true,
    },
  };
}
```

- [ ] **Step 4: Run the model tests**

Run: `node --import tsx --test tests/admin-one-time-payments.test.ts`

Expected: 4 tests PASS.

- [ ] **Step 5: Commit the safe payment model**

```bash
git add lib/admin/one-time-payments.ts tests/admin-one-time-payments.test.ts
git commit -m "feat: model safe one-time payment rows"
```

---

### Task 3: Protected One-Time Payments API Branch

**Files:**
- Modify: `app/api/admin/subscriptions/route.ts`
- Modify: `tests/admin-api-auth.test.ts`
- Test: `tests/admin-one-time-payments.test.ts`

**Interfaces:**
- Consumes: `requireAdminRequest(request)` from Task 1.
- Consumes: `buildOneTimePaymentPage`, `ONE_TIME_SCAN_PAGE_SIZE`, and `ONE_TIME_SCAN_LIMIT` from Task 2.
- Produces: `GET /api/admin/subscriptions?supportType=one-time&search=<text>&page=<n>` returning `{ payments, pagination }`.
- Preserves: recurring response `{ subscriptions, stats, pagination }` when `supportType` is absent or `recurring`.

- [ ] **Step 1: Add a failing source-contract test for route authorization and safe branching**

Append to `tests/admin-one-time-payments.test.ts`:

```ts
import { readFile } from "node:fs/promises";

test("admin subscriptions route authenticates before selecting either data branch", async () => {
  const source = await readFile(new URL("../app/api/admin/subscriptions/route.ts", import.meta.url), "utf8");
  const authPosition = source.indexOf("await requireAdminRequest(req)");
  const branchPosition = source.indexOf('supportType === "one-time"');
  assert.ok(authPosition >= 0, "route must verify the request");
  assert.ok(branchPosition > authPosition, "authorization must occur before donor-data branching");
  assert.ok(!source.includes("x-user-email"), "caller-supplied email headers must not authorize this route");
});
```

- [ ] **Step 2: Run the focused test and confirm the new assertion fails**

Run: `node --import tsx --test tests/admin-one-time-payments.test.ts`

Expected: FAIL with `route must verify the request`.

- [ ] **Step 3: Add request parsing and authorization at the start of `GET`**

Add imports:

```ts
import { AdminAuthError, requireAdminRequest } from "@/lib/admin/admin-api-auth";
import {
  buildOneTimePaymentPage,
  ONE_TIME_SCAN_LIMIT,
  ONE_TIME_SCAN_PAGE_SIZE,
  type TransactionDocument,
} from "@/lib/admin/one-time-payments";
```

At the beginning of `GET`, before any database call:

```ts
await requireAdminRequest(req);

const { searchParams } = new URL(req.url);
const supportType = searchParams.get("supportType") === "one-time" ? "one-time" : "recurring";
const filter = searchParams.get("filter") || "all";
const search = (searchParams.get("search") || "").slice(0, 200);
const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
```

Remove the existing duplicate `searchParams`, `filter`, `search`, and `page` declarations.

- [ ] **Step 4: Add a bounded Appwrite scan and return before recurring queries**

Insert immediately after request parsing:

```ts
if (supportType === "one-time") {
  const documents: TransactionDocument[] = [];
  let cursor: string | undefined;
  let truncated = false;

  while (documents.length < ONE_TIME_SCAN_LIMIT) {
    const remaining = ONE_TIME_SCAN_LIMIT - documents.length;
    const queries = [
      Query.equal("type", "one-time"),
      Query.orderDesc("$createdAt"),
      Query.limit(Math.min(ONE_TIME_SCAN_PAGE_SIZE, remaining)),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      queries,
    );
    documents.push(...(result.documents as unknown as TransactionDocument[]));
    if (result.documents.length < Math.min(ONE_TIME_SCAN_PAGE_SIZE, remaining)) break;
    cursor = result.documents.at(-1)?.$id;
    if (!cursor) break;
    if (documents.length === ONE_TIME_SCAN_LIMIT) truncated = result.total > documents.length;
  }

  return NextResponse.json(buildOneTimePaymentPage(documents, { search, page, truncated }));
}
```

This does not serialize raw Appwrite documents; only the Task 2 allow-list reaches the browser.

- [ ] **Step 5: Return clear authorization statuses without leaking internals**

Change the route catch block to handle the guard first:

```ts
} catch (error) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Subscriptions fetch error:", error);
  return NextResponse.json({ error: "Failed to fetch support records" }, { status: 500 });
}
```

- [ ] **Step 6: Run the authorization and payment model tests**

Run: `node --import tsx --test tests/admin-api-auth.test.ts tests/admin-one-time-payments.test.ts`

Expected: all tests PASS.

Run: `npx tsc --noEmit --pretty false 2>&1 | rg "app/api/admin/subscriptions|lib/admin"`

Expected: no output. Unrelated repository TypeScript failures may remain.

- [ ] **Step 7: Commit the protected API branch**

```bash
git add app/api/admin/subscriptions/route.ts tests/admin-one-time-payments.test.ts
git commit -m "feat: serve protected one-time payments"
```

---

### Task 4: One-Time Payment Table in the Existing Admin Design

**Files:**
- Create: `components/admin/OneTimePaymentsTable.tsx`
- Create: `tests/admin-subscriptions-view.test.ts`

**Interfaces:**
- Consumes: `OneTimePayment` from Task 2.
- Produces: `OneTimePaymentsTable({ payments, page, totalPages, truncated, onPageChange })`.
- Guarantees: payment-specific columns only; no subscription-management callback or action column.

- [ ] **Step 1: Write failing render and safety tests**

```ts
// tests/admin-subscriptions-view.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OneTimePaymentsTable } from "../components/admin/OneTimePaymentsTable";

test("one-time table renders individual payment fields without subscription actions", () => {
  const html = renderToStaticMarkup(
    React.createElement(OneTimePaymentsTable, {
      payments: [{
        id: "tx-1",
        donorName: "Asha Rao",
        donorEmail: "asha@example.com",
        amount: 500,
        status: "success",
        paymentReference: "pay_123",
        paidAt: "2026-08-08T10:00:00.000Z",
      }],
      page: 1,
      totalPages: 1,
      truncated: false,
      onPageChange: () => undefined,
    }),
  );
  for (const label of ["Donor", "Amount", "Status", "Payment reference", "Payment date", "Asha Rao", "pay_123"]) {
    assert.match(html, new RegExp(label, "i"));
  }
  assert.doesNotMatch(html, /cancel|extend|verify/i);
});

test("one-time table distinguishes failed payments and renders an honest empty state", () => {
  const failed = renderToStaticMarkup(React.createElement(OneTimePaymentsTable, {
    payments: [{ id: "tx-2", donorName: "Kabir", donorEmail: "kabir@example.com", amount: 250, status: "failed", paymentReference: "pay_456", paidAt: "2026-08-07T10:00:00.000Z" }],
    page: 1, totalPages: 1, truncated: false, onPageChange: () => undefined,
  }));
  assert.match(failed, /text-red-500/);

  const empty = renderToStaticMarkup(React.createElement(OneTimePaymentsTable, {
    payments: [], page: 1, totalPages: 1, truncated: false, onPageChange: () => undefined,
  }));
  assert.match(empty, /No one-time payments found/);
});
```

- [ ] **Step 2: Run the focused test and confirm it fails because the component does not exist**

Run: `node --import tsx --test tests/admin-subscriptions-view.test.ts`

Expected: FAIL with `Cannot find module '../components/admin/OneTimePaymentsTable'`.

- [ ] **Step 3: Implement the focused table component**

Create `components/admin/OneTimePaymentsTable.tsx` with this public shape and helpers:

```tsx
"use client";

import type { OneTimePayment } from "@/lib/admin/one-time-payments";

type Props = {
  payments: OneTimePayment[];
  page: number;
  totalPages: number;
  truncated: boolean;
  onPageChange: (page: number) => void;
};

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-500/10 text-green-600",
  failed: "bg-red-500/10 text-red-500",
  pending: "bg-yellow-500/10 text-yellow-600",
};

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", minimumFractionDigits: 0,
}).format(amount);

const formatDate = (date: string) => new Date(date).toLocaleDateString("en-IN", {
  year: "numeric", month: "short", day: "numeric",
});

export function OneTimePaymentsTable({ payments, page, totalPages, truncated, onPageChange }: Props) {
  if (payments.length === 0) {
    return <div className="text-center py-12 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg"><p className="text-[var(--color-text-secondary)]">No one-time payments found</p></div>;
  }
  return (
    <>
      {truncated && <p className="mb-3 text-sm text-yellow-600">Showing search results from the newest 5,000 one-time payments.</p>}
      <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]"><tr>
              {['Donor', 'Amount', 'Status', 'Payment reference', 'Payment date'].map(label => <th key={label} className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{label}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {payments.map(payment => <tr key={payment.id} className="hover:bg-[var(--color-bg)] transition-colors">
                <td className="px-6 py-4"><p className="font-medium text-[var(--color-text-primary)]">{payment.donorName}</p><p className="text-sm text-[var(--color-text-secondary)]">{payment.donorEmail}</p></td>
                <td className="px-6 py-4 text-[var(--color-text-primary)]">{formatCurrency(payment.amount)}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status] || "bg-gray-500/10 text-gray-500"}`}>{payment.status}</span></td>
                <td className="px-6 py-4 font-mono text-sm text-[var(--color-text-secondary)]">{payment.paymentReference}</td>
                <td className="px-6 py-4 text-[var(--color-text-secondary)]">{formatDate(payment.paidAt)}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && <div className="flex items-center justify-center gap-2 mt-6">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded text-sm disabled:opacity-50 cursor-pointer">Previous</button>
        <span className="text-sm text-[var(--color-text-secondary)]">Page {page} of {totalPages}</span>
        <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded text-sm disabled:opacity-50 cursor-pointer">Next</button>
      </div>}
    </>
  );
}
```

- [ ] **Step 4: Run the component tests**

Run: `node --import tsx --test tests/admin-subscriptions-view.test.ts`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit the payment table**

```bash
git add components/admin/OneTimePaymentsTable.tsx tests/admin-subscriptions-view.test.ts
git commit -m "feat: render one-time payment table"
```

---

### Task 5: Support-Type Dropdown and Authenticated Screen Fetching

**Files:**
- Modify: `app/admin/subscriptions/page.tsx`
- Modify: `tests/admin-subscriptions-view.test.ts`

**Interfaces:**
- Consumes: `createAuthenticatedHeaders()` from Task 1.
- Consumes: `OneTimePayment` and `OneTimePaymentsTable` from Tasks 2 and 4.
- Sends: `supportType`, `filter`, `search`, and `page` to the existing endpoint with an Appwrite bearer token.
- Preserves: last successfully rendered records when a later request fails.

- [ ] **Step 1: Add failing screen-wiring assertions**

Append to `tests/admin-subscriptions-view.test.ts`:

```ts
import { readFile } from "node:fs/promises";

test("subscriptions screen wires support type, authenticated requests, and page reset", async () => {
  const source = await readFile(new URL("../app/admin/subscriptions/page.tsx", import.meta.url), "utf8");
  assert.match(source, /Support type/);
  assert.match(source, /Recurring subscriptions/);
  assert.match(source, /One-time payments/);
  assert.match(source, /createAuthenticatedHeaders\(\)/);
  assert.match(source, /supportType=\$\{supportType\}/);
  assert.match(source, /setPage\(1\)/);
  assert.match(source, /supportType === "one-time"/);
  assert.match(source, /<OneTimePaymentsTable/);
});
```

- [ ] **Step 2: Run the focused test and confirm the wiring assertion fails**

Run: `node --import tsx --test tests/admin-subscriptions-view.test.ts`

Expected: FAIL because `Support type` is absent.

- [ ] **Step 3: Add support-type and one-time response state**

Add imports:

```tsx
import { createAuthenticatedHeaders } from "@/lib/appwrite/auth";
import { OneTimePaymentsTable } from "@/components/admin/OneTimePaymentsTable";
import type { OneTimePayment } from "@/lib/admin/one-time-payments";
```

Add state beside existing subscription state:

```tsx
const [supportType, setSupportType] = useState<"recurring" | "one-time">("recurring");
const [oneTimePayments, setOneTimePayments] = useState<OneTimePayment[]>([]);
const [resultsTruncated, setResultsTruncated] = useState(false);
```

- [ ] **Step 4: Authenticate fetches and select the safe response shape**

Replace the fetch body inside `fetchSubscriptions` with:

```tsx
const headers = await createAuthenticatedHeaders();
const res = await fetch(
  `/api/admin/subscriptions?supportType=${supportType}&filter=${filter}&search=${encodeURIComponent(searchQuery)}&page=${page}`,
  { headers },
);
if (!res.ok) {
  const body = await res.json().catch(() => ({}));
  throw new Error(body.error || "Failed to fetch support records");
}
const data = await res.json();
if (supportType === "one-time") {
  setOneTimePayments(data.payments || []);
  setResultsTruncated(data.pagination?.truncated === true);
} else {
  setSubscriptions(data.subscriptions || []);
  setStats(data.stats || null);
}
setTotalPages(data.pagination?.totalPages || 1);
if (data.pagination?.page && data.pagination.page !== page) setPage(data.pagination.page);
```

Include `supportType` in the callback dependency list. Do not clear `subscriptions`, `oneTimePayments`, or `stats` before fetching, so a failed request leaves the last safe state available under the error toast.

- [ ] **Step 5: Add the dropdown and reset pagination on both dropdown and search changes**

Insert before the existing status tabs:

```tsx
<label className="flex flex-col gap-1">
  <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Support type</span>
  <select
    value={supportType}
    onChange={(event) => {
      setSupportType(event.target.value as "recurring" | "one-time");
      setPage(1);
      setSelectedSubscription(null);
    }}
    className="px-4 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none cursor-pointer"
  >
    <option value="recurring">Recurring subscriptions</option>
    <option value="one-time">One-time payments</option>
  </select>
</label>
```

Wrap the existing status tabs in `{supportType === "recurring" && (...)}`. Change the search handler to:

```tsx
onChange={(event) => {
  setSearchQuery(event.target.value);
  setPage(1);
}}
```

- [ ] **Step 6: Show subscription-only controls and content only in recurring mode**

Wrap the header’s `Verify All` button, recurring stats cards, recurring table, and subscription detail modal in `supportType === "recurring"` checks. Keep the Razorpay Dashboard link visible in both modes because payment references may need read-only reconciliation there.

Replace the current table selection with this top-level branch after the common loading state:

```tsx
{loading ? (
  <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[var(--color-text-primary)]/30 border-t-[var(--color-text-primary)] rounded-full animate-spin" /></div>
) : supportType === "one-time" ? (
  <OneTimePaymentsTable
    payments={oneTimePayments}
    page={page}
    totalPages={totalPages}
    truncated={resultsTruncated}
    onPageChange={setPage}
  />
) : (
  /* existing recurring table, pagination, empty state, and modal */
)}
```

Change the recurring empty message only inside its existing branch to remain `No subscriptions found`.

- [ ] **Step 7: Run UI and model tests**

Run: `node --import tsx --test tests/admin-subscriptions-view.test.ts tests/admin-one-time-payments.test.ts tests/admin-api-auth.test.ts`

Expected: all tests PASS.

Run: `npx tsc --noEmit --pretty false 2>&1 | rg "app/admin/subscriptions|components/admin/OneTimePaymentsTable|lib/admin|lib/appwrite/auth"`

Expected: no output. Unrelated repository TypeScript failures may remain.

- [ ] **Step 8: Commit the dropdown and screen integration**

```bash
git add app/admin/subscriptions/page.tsx tests/admin-subscriptions-view.test.ts
git commit -m "feat: switch admin support record views"
```

---

### Task 6: Regression, Security, and Visual Verification

**Files:**
- Modify only if a verification step reveals a defect in a file from Tasks 1-5.

**Interfaces:**
- Verifies the complete feature contract; produces no new public interface.

- [ ] **Step 1: Run the complete automated test suite**

Run: `node --import tsx --test tests/**/*.test.ts`

Expected: every test PASS, including the new admin tests and the existing recurring/payment tests.

- [ ] **Step 2: Confirm sensitive fields cannot cross the API mapping boundary**

Run: `rg -n "razorpayOrderId|signature|card|upi|bank|webhook" lib/admin/one-time-payments.ts components/admin/OneTimePaymentsTable.tsx`

Expected: no output.

Run: `rg -n "x-user-email|AdminAuthWrapper client-side protection" app/api/admin/subscriptions/route.ts`

Expected: no output.

- [ ] **Step 3: Run the production build and classify existing failures honestly**

Run: `npm run build`

Expected: the application compiles through the changed admin files. If the known unrelated `RESEND_API_KEY` build-time failure remains, record it verbatim and confirm no error names a file changed by this plan.

- [ ] **Step 4: Verify the screen in the browser at desktop and narrow widths**

Run: `npm run dev`

Open `/admin/subscriptions` while signed in as an `ADMIN` and verify:

1. Default view remains recurring subscriptions with its existing stats, tabs, table, pagination, and actions.
2. `Support type` → `One-time payments` loads individual Appwrite payments.
3. Searching a mixed-case donor name and email returns only matching rows and resets to page 1.
4. Success is green, failure is red, and unknown/pending statuses remain legible.
5. One-time mode has no verify, cancel, extend, refund, delete, or reclassify control.
6. Switching back to recurring restores the recurring view.
7. At narrow width, the table scrolls horizontally without breaking the page.
8. Signing in as a non-admin or calling the endpoint without a bearer token returns 403 or 401 and no donor records.

- [ ] **Step 5: Review the final diff for scope and data safety**

Run: `git diff --check HEAD~4..HEAD`

Expected: no whitespace errors.

Run: `git diff --stat HEAD~4..HEAD`

Expected: changes are limited to the files listed in Tasks 1-5 plus their tests.

- [ ] **Step 6: Commit verification fixes only if Step 1-5 required changes**

```bash
git add app/admin/subscriptions/page.tsx app/api/admin/subscriptions/route.ts components/admin/OneTimePaymentsTable.tsx lib/admin/admin-api-auth.ts lib/admin/one-time-payments.ts lib/appwrite/auth.tsx tests/admin-api-auth.test.ts tests/admin-one-time-payments.test.ts tests/admin-subscriptions-view.test.ts
git commit -m "test: verify admin one-time payments"
```

