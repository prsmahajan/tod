import assert from "node:assert/strict";
import test from "node:test";
import { PUBLIC_NAV_LINKS } from "../lib/public-navigation";

test("public navigation is animal-first", () => {
  assert.deepEqual(PUBLIC_NAV_LINKS, [
    { name: "Feeding Updates", path: "/impact", primary: false },
    { name: "Our Story", path: "/mission", primary: false },
    { name: "Transparency", path: "/impact#transparency", primary: false },
    { name: "Donate", path: "/support", primary: true },
  ]);
  assert.equal(PUBLIC_NAV_LINKS.some((link) => link.path.startsWith("/articles")), false);
});
