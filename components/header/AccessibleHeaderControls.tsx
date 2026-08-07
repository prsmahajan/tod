import React from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

export function CompactHomeLink() {
  return (
    <Link href="/" aria-label="Go to homepage">
      <Icon name="logo" className="h-8 w-8 text-[var(--color-text-primary)]" />
    </Link>
  );
}

export function AccountMenuTrigger({
  accountName,
  avatarUrl,
  compact = false,
  expanded,
  initial,
  menuId,
  onToggle,
}: {
  accountName: string;
  avatarUrl?: string;
  compact?: boolean;
  expanded: boolean;
  initial: string;
  menuId: string;
  onToggle: () => void;
}) {
  const action = expanded ? "Close" : "Open";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 focus:outline-none cursor-pointer"
      aria-label={`${action} account menu for ${accountName}`}
      aria-haspopup="menu"
      aria-expanded={expanded}
      aria-controls={menuId}
    >
      <span className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] flex items-center justify-center font-medium text-sm overflow-hidden border-2 border-[var(--color-border)]`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : initial}
      </span>
      {!compact && (
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {accountName}
        </span>
      )}
    </button>
  );
}
