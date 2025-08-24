// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    session: ({ session, user }) => {
      if (session?.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },
}

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)
