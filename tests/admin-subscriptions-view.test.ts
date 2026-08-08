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
