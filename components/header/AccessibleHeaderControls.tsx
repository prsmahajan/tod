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
  onEscape,
  onToggle,
  triggerRef,
}: {
  accountName: string;
  avatarUrl?: string;
  compact?: boolean;
  expanded: boolean;
  initial: string;
  menuId: string;
  onEscape: () => void;
  onToggle: () => void;
  triggerRef: React.Ref<HTMLButtonElement>;
}) {
  const action = expanded ? "Close" : "Open";
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape" || !expanded) return;

    event.preventDefault();
    event.stopPropagation();
    onEscape();
  };

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className="flex items-center gap-2 focus:outline-none cursor-pointer"
      aria-label={`${action} account options for ${accountName}`}
      aria-haspopup="dialog"
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

export function AccountPopover({
  children,
  id,
  label,
  onRequestClose,
}: {
  children: React.ReactNode;
  id: string;
  label: string;
  onRequestClose: () => void;
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;

    event.preventDefault();
    event.stopPropagation();
    onRequestClose();
  };

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="false"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="absolute right-0 mt-2 w-52 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-xl py-2 z-50 backdrop-blur-xl"
    >
      {children}
    </div>
  );
}
