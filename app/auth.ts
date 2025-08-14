// app/actions/auth.ts
"use server"

import { signIn, signOut } from "@/auth" // next-auth の server side 版を使う

// Google ログイン
export async function signInGoogle() {
  await signIn("google")
}

// Discord ログイン
export async function signInDiscord() {
  await signIn("discord")
}

// ログアウト
export async function signOutAction() {
  await signOut()
}
