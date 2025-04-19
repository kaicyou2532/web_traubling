// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [Google, Discord],
  session: { strategy: "database" },
  callbacks: {
    session: ({ session, user }) => {
      session.user.id = user.id
      return session
    },
  },
}

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)
