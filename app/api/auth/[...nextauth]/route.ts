// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return null;
        }

        // Check if this is magic link authentication
        if (password === "__MAGIC_LINK__") {
          // For magic link, we trust that the token was already validated in the verify route
          // Just return the user
          return { id: user.id, email: user.email, name: user.name };
        }

        // Regular password authentication
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          return null;
        }

        // Return minimal public profile; NextAuth will put this into the JWT
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Remove domain restriction since we're not using subdomains for admin anymore
        // domain: process.env.NODE_ENV === 'production' ? '.theopendraft.com' : undefined,
      },
    },
  },
  debug: process.env.NODE_ENV === 'development', // Only enable debug in development
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, stash emailVerified and role on the token
      if (user) {
        token.uid = (user as any).id;
        token.name = user.name;

        // Fetch once at login (or join in authorize)
        const dbUser = await prisma.user.findUnique({
          where: { id: (user as any).id },
          select: { emailVerified: true, role: true },
        });
        (token as any).emailVerified = dbUser?.emailVerified ?? null;
        (token as any).role = dbUser?.role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string | undefined;
        // Expose verified flag and role to the client
        (session as any).emailVerified = (token as any).emailVerified ?? null;
        (session as any).user = {
          ...session.user,
          role: (token as any).role ?? 'USER',
        };
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }