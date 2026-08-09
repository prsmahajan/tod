import { prisma } from "@/lib/db";

type VerifiedAppwriteUser = { $id: string; email: string };
type DatabaseRole = "SUBSCRIBER" | "AUTHOR" | "EDITOR" | "ADMIN" | null;

export type AdminIdentity = { id: string; email: string; role: "ADMIN" };
export type AdminAuthDependencies = {
  verifyJwt: (jwt: string) => Promise<VerifiedAppwriteUser>;
  findRoleByEmail: (email: string) => Promise<DatabaseRole>;
};

export class AdminAuthError extends Error {
  constructor(message: string, public readonly status: 401 | 403) {
    super(message);
    this.name = "AdminAuthError";
  }
}

// Verified with a direct Appwrite REST call rather than node-appwrite: the
// SDK's bundled fetch stack fails ("invalid onError method") on current Node.
async function verifyJwt(jwt: string): Promise<VerifiedAppwriteUser> {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const response = await fetch(`${endpoint}/account`, {
    headers: {
      "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
      "X-Appwrite-JWT": jwt,
      "X-Appwrite-Response-Format": "1.7.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Appwrite rejected the session token (${response.status})`);
  }

  const account = (await response.json()) as { $id?: unknown; email?: unknown };
  if (typeof account.$id !== "string" || typeof account.email !== "string" || !account.email) {
    throw new Error("Appwrite returned an unusable account payload");
  }
  return { $id: account.$id, email: account.email };
}

async function findRoleByEmail(email: string): Promise<DatabaseRole> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return user?.role ?? null;
}

const defaults: AdminAuthDependencies = { verifyJwt, findRoleByEmail };

export async function requireAdminRequest(
  request: Request,
  dependencies: AdminAuthDependencies = defaults,
): Promise<AdminIdentity> {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    console.error("[admin-auth] no bearer token on request");
    throw new AdminAuthError("Authentication required", 401);
  }

  let user: VerifiedAppwriteUser;
  try {
    user = await dependencies.verifyJwt(match[1]);
  } catch (error) {
    console.error("[admin-auth] JWT verification failed:", error);
    throw new AdminAuthError("Authentication required", 401);
  }

  const role = await dependencies.findRoleByEmail(user.email);
  if (role !== "ADMIN") {
    console.error(`[admin-auth] role ${role ?? "none"} is not ADMIN for ${user.email}`);
    throw new AdminAuthError("Administrator access required", 403);
  }
  return { id: user.$id, email: user.email, role: "ADMIN" };
}
