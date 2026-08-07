import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import Chatbot from "../components/Chatbot";
import {
  AccountMenuTrigger,
  CompactHomeLink,
} from "../components/header/AccessibleHeaderControls";
import { getInertAttribute } from "../lib/accessibility/inert-region";

const readSource = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

test("inactive regions serialize inert in React 18 and active regions remove it", () => {
  const inactive = renderToStaticMarkup(
    React.createElement(
      "div",
      getInertAttribute(true),
      React.createElement("button", null, "Hidden action"),
    ),
  );
  const active = renderToStaticMarkup(
    React.createElement(
      "div",
      getInertAttribute(false),
      React.createElement("button", null, "Active action"),
    ),
  );

  assert.match(inactive, /^<div inert="true"><button>/);
  assert.equal(active.includes("inert="), false);
});

test("closed chatbot renders a genuinely inert panel and an accurate toggle", () => {
  const html = renderToStaticMarkup(React.createElement(Chatbot));
  const panelTag = html.match(/<div[^>]*id="tod-chatbot-panel"[^>]*>/)?.[0];
  const toggleTag = html.match(/<button[^>]*aria-controls="tod-chatbot-panel"[^>]*>/)?.[0];

  assert.ok(panelTag, "chatbot panel must render");
  assert.match(panelTag, / inert="true"/);
  assert.equal(panelTag.includes("aria-hidden"), false);
  assert.ok(toggleTag, "chatbot toggle must render");
  assert.match(toggleTag, /aria-expanded="false"/);
  assert.match(toggleTag, /aria-label="Open chatbot"/);
  assert.match(html, /aria-label="Chat message"/);
  assert.match(html, /aria-label="Send message"/);
});

test("compact header controls have explicit action-oriented names and menu state", () => {
  const home = renderToStaticMarkup(React.createElement(CompactHomeLink));
  const closedAccount = renderToStaticMarkup(React.createElement(AccountMenuTrigger, {
    accountName: "Asha",
    compact: true,
    expanded: false,
    initial: "A",
    menuId: "account-menu-compact",
    onToggle: () => {},
  }));
  const openAccount = renderToStaticMarkup(React.createElement(AccountMenuTrigger, {
    accountName: "Asha",
    compact: true,
    expanded: true,
    initial: "A",
    menuId: "account-menu-compact",
    onToggle: () => {},
  }));

  assert.match(home, /href="\/"/);
  assert.match(home, /aria-label="Go to homepage"/);
  assert.match(closedAccount, /aria-label="Open account menu for Asha"/);
  assert.match(closedAccount, /aria-haspopup="menu"/);
  assert.match(closedAccount, /aria-expanded="false"/);
  assert.match(closedAccount, /aria-controls="account-menu-compact"/);
  assert.match(openAccount, /aria-label="Close account menu for Asha"/);
  assert.match(openAccount, /aria-expanded="true"/);
});

test("donation mode and billing selections are exposed without relying on color", () => {
  const source = readSource("../app/support/page.tsx");

  assert.match(source, /aria-pressed=\{paymentMode === 'one-time'\}/);
  assert.match(source, /aria-pressed=\{paymentMode === 'subscribe'\}/);
  assert.match(source, /aria-pressed=\{billingCycle === 'weekly'\}/);
  assert.match(source, /aria-pressed=\{billingCycle === 'monthly'\}/);
});
