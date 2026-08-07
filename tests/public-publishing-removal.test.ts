import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLIC_HOME_ACTIONS,
  PUBLIC_NAV_LINKS,
  PUBLIC_PUBLISHING_REDIRECT_PATH,
} from "../lib/public-navigation";
import { GET as getFeed } from "../app/feed.xml/route";

test("public homepage actions direct visitors to animal impact and support", () => {
  assert.deepEqual(PUBLIC_HOME_ACTIONS, [
    { name: "See Our Impact", path: "/impact", primary: true },
    { name: "Support Feeding", path: "/support", primary: false },
  ]);
  assert.equal(PUBLIC_HOME_ACTIONS.some((action) => action.path.startsWith("/articles")), false);
});

test("legacy publishing routes return visitors to the public homepage", () => {
  assert.equal(PUBLIC_PUBLISHING_REDIRECT_PATH, "/");
  assert.equal(PUBLIC_NAV_LINKS.some((link) => link.path.startsWith("/articles")), false);
});

test("the public RSS endpoint redirects instead of publishing articles", async () => {
  await assert.rejects(getFeed(), (error: unknown) => {
    assert.match(
      (error as { digest?: string }).digest ?? "",
      /^NEXT_REDIRECT;replace;\/;307;/,
    );
    return true;
  });
});
