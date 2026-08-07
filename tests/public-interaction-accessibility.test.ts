import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import Chatbot from "../components/Chatbot";
import * as HeaderControls from "../components/header/AccessibleHeaderControls";
import * as InertRegion from "../lib/accessibility/inert-region";

const readSource = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

test("inactive state is applied outside React and removed when a region becomes active", () => {
  const setInertState = (InertRegion as typeof InertRegion & {
    setInertState?: (
      element: Pick<HTMLElement, "removeAttribute" | "setAttribute">,
      inactive: boolean,
    ) => void;
  }).setInertState;
  const attributes = new Map<string, string>();
  const element = {
    removeAttribute(name: string) {
      attributes.delete(name);
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
  };

  assert.equal(typeof setInertState, "function");
  setInertState?.(element, true);
  assert.equal(attributes.has("inert"), true);
  assert.equal(attributes.get("inert"), "");
  setInertState?.(element, false);
  assert.equal(attributes.has("inert"), false);
});

test("closed chatbot is focus-safe before hydration and has an accurate toggle", () => {
  const html = renderToStaticMarkup(React.createElement(Chatbot));
  const panelTag = html.match(/<div[^>]*id="tod-chatbot-panel"[^>]*>/)?.[0];
  const toggleTag = html.match(/<button[^>]*aria-controls="tod-chatbot-panel"[^>]*>/)?.[0];

  assert.ok(panelTag, "chatbot panel must render");
  assert.equal(panelTag.includes("inert="), false);
  assert.match(panelTag, / invisible(?:\s|"|$)/);
  assert.equal(panelTag.includes("aria-hidden"), false);
  assert.ok(toggleTag, "chatbot toggle must render");
  assert.match(toggleTag, /aria-expanded="false"/);
  assert.match(toggleTag, /aria-label="Open chatbot"/);
  assert.match(html, /aria-label="Chat message"/);
  assert.match(html, /aria-label="Send message"/);
});

test("compact header controls name their actions and expose dialog state", () => {
  const { AccountMenuTrigger, CompactHomeLink } = HeaderControls;
  const home = renderToStaticMarkup(React.createElement(CompactHomeLink));
  const closedAccount = renderToStaticMarkup(React.createElement(AccountMenuTrigger, {
    accountName: "Asha",
    compact: true,
    expanded: false,
    initial: "A",
    menuId: "account-menu-compact",
    onEscape: () => {},
    onToggle: () => {},
    triggerRef: React.createRef<HTMLButtonElement>(),
  }));
  const openAccount = renderToStaticMarkup(React.createElement(AccountMenuTrigger, {
    accountName: "Asha",
    compact: true,
    expanded: true,
    initial: "A",
    menuId: "account-menu-compact",
    onEscape: () => {},
    onToggle: () => {},
    triggerRef: React.createRef<HTMLButtonElement>(),
  }));

  assert.match(home, /href="\/"/);
  assert.match(home, /aria-label="Go to homepage"/);
  assert.match(closedAccount, /aria-label="Open account options for Asha"/);
  assert.match(closedAccount, /aria-haspopup="dialog"/);
  assert.match(closedAccount, /aria-expanded="false"/);
  assert.match(closedAccount, /aria-controls="account-menu-compact"/);
  assert.match(openAccount, /aria-label="Close account options for Asha"/);
  assert.match(openAccount, /aria-expanded="true"/);
});

test("account popover is a labelled non-modal dialog that closes with Escape", () => {
  const AccountPopover = (HeaderControls as typeof HeaderControls & {
    AccountPopover?: (props: {
      children: React.ReactNode;
      id: string;
      label: string;
      onRequestClose: () => void;
    }) => React.ReactElement;
  }).AccountPopover;
  let closeCount = 0;

  assert.equal(typeof AccountPopover, "function");
  if (!AccountPopover) return;

  const popover = AccountPopover({
    children: React.createElement("button", null, "Dashboard"),
    id: "account-popover-compact",
    label: "Account options for Asha",
    onRequestClose: () => {
      closeCount += 1;
    },
  });
  const html = renderToStaticMarkup(popover);

  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="false"/);
  assert.match(html, /aria-label="Account options for Asha"/);
  assert.equal(html.includes('role="menu"'), false);

  popover.props.onKeyDown({ key: "Enter" });
  assert.equal(closeCount, 0);
  popover.props.onKeyDown({
    key: "Escape",
    preventDefault() {},
    stopPropagation() {},
  });
  assert.equal(closeCount, 1);
});

test("each expanded account trigger owns its Escape close path and exact ref", () => {
  const { AccountMenuTrigger } = HeaderControls;
  const fullTriggerRef = React.createRef<HTMLButtonElement>();
  const compactTriggerRef = React.createRef<HTMLButtonElement>();
  let fullCloseCount = 0;
  let compactCloseCount = 0;
  const createTrigger = (
    compact: boolean,
    triggerRef: React.RefObject<HTMLButtonElement | null>,
    onEscape: () => void,
  ) => AccountMenuTrigger({
    accountName: "Asha",
    compact,
    expanded: true,
    initial: "A",
    menuId: compact ? "account-popover-compact" : "account-popover-full",
    onEscape,
    onToggle: () => {},
    triggerRef,
  } as React.ComponentProps<typeof AccountMenuTrigger> & {
    onEscape: () => void;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
  });
  const fullTrigger = createTrigger(false, fullTriggerRef, () => {
    fullCloseCount += 1;
  });
  const compactTrigger = createTrigger(true, compactTriggerRef, () => {
    compactCloseCount += 1;
  });

  assert.equal(
    (fullTrigger as unknown as { ref: React.RefObject<HTMLButtonElement | null> }).ref,
    fullTriggerRef,
  );
  assert.equal(
    (compactTrigger as unknown as { ref: React.RefObject<HTMLButtonElement | null> }).ref,
    compactTriggerRef,
  );
  assert.equal(typeof fullTrigger.props.onKeyDown, "function");
  assert.equal(typeof compactTrigger.props.onKeyDown, "function");

  fullTrigger.props.onKeyDown({
    key: "Escape",
    preventDefault() {},
    stopPropagation() {},
  });
  assert.equal(fullCloseCount, 1);
  assert.equal(compactCloseCount, 0);

  compactTrigger.props.onKeyDown({
    key: "Escape",
    preventDefault() {},
    stopPropagation() {},
  });
  assert.equal(fullCloseCount, 1);
  assert.equal(compactCloseCount, 1);
});

test("donation mode and billing selections are exposed without relying on color", () => {
  const source = readSource("../app/support/page.tsx");

  assert.match(source, /aria-pressed=\{paymentMode === 'one-time'\}/);
  assert.match(source, /aria-pressed=\{paymentMode === 'subscribe'\}/);
  assert.match(source, /aria-pressed=\{billingCycle === 'weekly'\}/);
  assert.match(source, /aria-pressed=\{billingCycle === 'monthly'\}/);
  assert.match(
    source,
    /aria-pressed=\{billingCycle === 'weekly'\}[\s\S]{0,220}min-h-11/,
  );
  assert.match(
    source,
    /aria-pressed=\{billingCycle === 'monthly'\}[\s\S]{0,220}min-h-11/,
  );
});

test("custom donation input has a persistent label, limits, and linked help and error text", () => {
  const source = readSource("../app/support/page.tsx");

  assert.match(source, /<label[^>]*htmlFor="custom-amount"/);
  assert.match(source, /id="custom-amount"/);
  assert.match(source, /min=\{50\}/);
  assert.match(source, /max=\{100000\}/);
  assert.match(source, /aria-describedby="custom-amount-help custom-amount-error"/);
  assert.match(source, /id="custom-amount-error"/);
});
