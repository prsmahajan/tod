import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

test("inactive header navigation variants cannot receive keyboard focus", () => {
  const source = readSource("../components/Header.tsx");

  assert.match(source, /inert=\{scrolled \? true : undefined\}/);
  assert.match(source, /inert=\{!scrolled \? true : undefined\}/);
  assert.match(source, /aria-expanded=\{isMenuOpen\}/);
  assert.match(source, /aria-controls="mobile-navigation"/);
  assert.match(source, /id="mobile-navigation"[\s\S]*?inert=\{!isMenuOpen \? true : undefined\}/);
});

test("closed chatbot content cannot receive focus and icon controls are named", () => {
  const source = readSource("../components/Chatbot.tsx");

  assert.match(source, /aria-expanded=\{isOpen\}/);
  assert.match(source, /aria-controls="tod-chatbot-panel"/);
  assert.match(source, /id="tod-chatbot-panel"[\s\S]*?inert=\{!isOpen \? true : undefined\}/);
  assert.match(source, /aria-label="Send message"/);
});

test("donation mode and billing selections are exposed without relying on color", () => {
  const source = readSource("../app/support/page.tsx");

  assert.match(source, /aria-pressed=\{paymentMode === 'one-time'\}/);
  assert.match(source, /aria-pressed=\{paymentMode === 'subscribe'\}/);
  assert.match(source, /aria-pressed=\{billingCycle === 'weekly'\}/);
  assert.match(source, /aria-pressed=\{billingCycle === 'monthly'\}/);
});
