import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("global styles provide a complete reduced-motion alternative", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(
    css,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*html,\s*\*\s*\{\s*scroll-behavior:\s*auto\s*!important;\s*\}\s*\*,\s*\*::before,\s*\*::after\s*\{\s*animation-duration:\s*0\.01ms\s*!important;\s*animation-iteration-count:\s*1\s*!important;\s*transition-duration:\s*0\.01ms\s*!important;\s*\}\s*\}/,
    "missing the complete prefers-reduced-motion override",
  );
});
