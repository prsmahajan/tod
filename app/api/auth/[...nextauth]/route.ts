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
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Return minimal public profile; NextAuth will put this into the JWT
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
callbacks: {
    async jwt({ token, user }) {
      // On sign-in, stash emailVerified on the token
      if (user) {
        token.uid = (user as any).id;
        token.name = user.name;

        // Fetch once at login (or join in authorize)
        const dbUser = await prisma.user.findUnique({
          where: { id: (user as any).id },
          select: { emailVerified: true },
        });
        (token as any).emailVerified = dbUser?.emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string | undefined;
        // Expose verified flag to the client
        (session as any).emailVerified = (token as any).emailVerified ?? null;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }