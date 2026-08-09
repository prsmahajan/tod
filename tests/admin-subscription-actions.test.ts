import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const routes = [
  "../app/api/admin/subscriptions/[id]/cancel/route.ts",
  "../app/api/admin/subscriptions/[id]/extend/route.ts",
];

for (const route of routes) {
  test(`${route} authorizes before touching subscription state`, async () => {
    const source = await readFile(new URL(route, import.meta.url), "utf8");

    const authPosition = source.indexOf("await requireAdminRequest(req)");
    assert.ok(authPosition >= 0, "route must verify the caller is an administrator");

    for (const mutation of ["prisma.user.update", "prisma.user.findUnique", "await params"]) {
      const position = source.indexOf(mutation);
      if (position >= 0) {
        assert.ok(position > authPosition, `${mutation} must run after authorization`);
      }
    }

    assert.match(source, /AdminAuthError/, "route must map guard failures to 401/403");
    assert.doesNotMatch(
      source,
      /TODO: Add proper Appwrite authentication check/,
      "the unauthenticated placeholder must be gone",
    );
  });
}
