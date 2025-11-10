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
        console.log('[NEXTAUTH] Authorization attempt');
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          console.log('[NEXTAUTH] Invalid credentials format');
          return null;
        }
        const { email, password } = parsed.data;

        console.log('[NEXTAUTH] Looking up user:', email);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          console.log('[NEXTAUTH] User not found');
          return null;
        }

        console.log('[NEXTAUTH] Verifying password');
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          console.log('[NEXTAUTH] Password incorrect');
          return null;
        }

        console.log('[NEXTAUTH] Authorization successful for:', email);
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
  debug: true, // Enable debug in all environments for now
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, stash emailVerified and role on the token
      if (user) {
        console.log('[NEXTAUTH] JWT callback - adding user data to token');
        token.uid = (user as any).id;
        token.name = user.name;

        // Fetch once at login (or join in authorize)
        const dbUser = await prisma.user.findUnique({
          where: { id: (user as any).id },
          select: { emailVerified: true, role: true },
        });
        console.log('[NEXTAUTH] JWT callback - user role:', dbUser?.role);
        (token as any).emailVerified = dbUser?.emailVerified ?? null;
        (token as any).role = dbUser?.role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('[NEXTAUTH] Session callback - building session with role:', (token as any).role);
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