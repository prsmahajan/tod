import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("root layout accepts the intentional pre-hydration theme class", () => {
  const source = readFileSync(
    new URL("../app/layout.tsx", import.meta.url),
    "utf8",
  );
  const rootHtmlTag = source.match(/<html[\s\S]*?>/)?.[0];

  assert.ok(rootHtmlTag, "root html element must render");
  assert.match(rootHtmlTag, /suppressHydrationWarning/);
});
