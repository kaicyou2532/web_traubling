// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import type { NextAuthConfig } from "next-auth"

const providers = []

// Google プロバイダーを条件付きで追加
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  )
}

// Discord プロバイダーを条件付きで追加
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    })
  )
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "database" }, // データベースセッション戦略を維持
  callbacks: {
    session: ({ session, user }) => {
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)
