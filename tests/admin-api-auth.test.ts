import assert from "node:assert/strict";
import test from "node:test";
import { AdminAuthError, requireAdminRequest } from "../lib/admin/admin-api-auth";

const request = (authorization?: string) =>
  new Request("http://localhost/api/admin/subscriptions", {
    headers: authorization ? { authorization } : {},
  });

test("admin API rejects a missing bearer token", async () => {
  await assert.rejects(
    requireAdminRequest(request(), {
      verifyJwt: async () => ({ $id: "unused", email: "unused@example.com" }),
      findRoleByEmail: async () => "ADMIN",
    }),
    (error: unknown) => error instanceof AdminAuthError && error.status === 401,
  );
});

test("admin API rejects an invalid Appwrite JWT", async () => {
  await assert.rejects(
    requireAdminRequest(request("Bearer bad-token"), {
      verifyJwt: async () => { throw new Error("invalid token"); },
      findRoleByEmail: async () => "ADMIN",
    }),
    (error: unknown) => error instanceof AdminAuthError && error.status === 401,
  );
});

test("admin API rejects an authenticated non-admin", async () => {
  await assert.rejects(
    requireAdminRequest(request("Bearer valid-token"), {
      verifyJwt: async () => ({ $id: "user-1", email: "member@example.com" }),
      findRoleByEmail: async () => "SUBSCRIBER",
    }),
    (error: unknown) => error instanceof AdminAuthError && error.status === 403,
  );
});

test("admin API returns the verified ADMIN identity", async () => {
  const identity = await requireAdminRequest(request("Bearer valid-token"), {
    verifyJwt: async (jwt) => {
      assert.equal(jwt, "valid-token");
      return { $id: "admin-1", email: "admin@example.com" };
    },
    findRoleByEmail: async () => "ADMIN",
  });
  assert.deepEqual(identity, { id: "admin-1", email: "admin@example.com", role: "ADMIN" });
});
