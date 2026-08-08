"use client";

import React from "react";
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

const COLUMNS = ["Donor", "Amount", "Status", "Payment reference", "Payment date"];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function OneTimePaymentsTable({ payments, page, totalPages, truncated, onPageChange }: Props) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
        <p className="text-[var(--color-text-secondary)]">No one-time payments found</p>
      </div>
    );
  }

  return (
    <>
      {truncated && (
        <p className="mb-3 text-sm text-yellow-600">
          Showing search results from the newest 5,000 one-time payments.
        </p>
      )}
      <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
              <tr>
                {COLUMNS.map((label) => (
                  <th
                    key={label}
                    className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[var(--color-text-primary)]">{payment.donorName}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{payment.donorEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-primary)]">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[payment.status] || "bg-gray-500/10 text-gray-500"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-[var(--color-text-secondary)]">
                    {payment.paymentReference}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">{formatDate(payment.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded text-sm disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--color-text-secondary)]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded text-sm disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
