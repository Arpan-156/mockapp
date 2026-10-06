import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // @ts-ignore
        if (user.isLocked) {
          throw new Error("Your account has been locked by the administrator.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Single device login: invalidate all previous sessions by setting forceLogoutAt to now
        await prisma.user.update({
          where: { id: user.id },
          data: { forceLogoutAt: new Date() }
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isLocked: true, forceLogoutAt: true }
        } as any);

        if (!dbUser) {
          throw new Error("User not found");
        }

        if ((dbUser as any).isLocked) {
          // Returning empty session to force client side logout
          return { ...session, error: "LockedOut", user: undefined } as any;
        }

        if ((dbUser as any).forceLogoutAt && token.iat) {
          const forceTime = Math.floor(new Date((dbUser as any).forceLogoutAt).getTime() / 1000);
          if (forceTime > (token.iat as number)) {
            return { ...session, error: "SessionExpired", user: undefined } as any;
          }
        }

        if (session.user) {
          session.user.role = (dbUser as any).role;
          session.user.id = token.id as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key",
};

