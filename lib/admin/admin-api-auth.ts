import { Account, Client } from "node-appwrite";
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

async function verifyJwt(jwt: string): Promise<VerifiedAppwriteUser> {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
    .setJWT(jwt);
  return new Account(client).get();
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
  if (!match) throw new AdminAuthError("Authentication required", 401);

  let user: VerifiedAppwriteUser;
  try {
    user = await dependencies.verifyJwt(match[1]);
  } catch {
    throw new AdminAuthError("Authentication required", 401);
  }

  const role = await dependencies.findRoleByEmail(user.email);
  if (role !== "ADMIN") throw new AdminAuthError("Administrator access required", 403);
  return { id: user.$id, email: user.email, role: "ADMIN" };
}
