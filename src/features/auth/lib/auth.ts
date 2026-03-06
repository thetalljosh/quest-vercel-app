import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { db } from "@/shared/db/client";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  profiles,
} from "@/shared/db/schema";
import authConfig from "./auth.config";

// Nodemailer depends on Node.js 'stream' so it must live here
// (Node.js runtime), NOT in auth.config.ts (Edge runtime).
const nodemailerProvider = process.env.EMAIL_SERVER
  ? [
      Nodemailer({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
      }),
    ]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [...authConfig.providers, ...nodemailerProvider],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt", maxAge: 15 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await db.insert(profiles).values({
        id: user.id,
        displayName: user.name ?? "Adventurer",
      });
    },
  },
});
