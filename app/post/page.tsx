import { prisma } from "@/lib/prisma";
import PostForm from "../components/PostForm";
import type { Metadata } from 'next'
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: '投稿',
  description: '投稿ページ',
}

// 動的レンダリングを強制（認証が必要なため）
export const dynamic = 'force-dynamic';

export default async function PostPage() {

  const session = await auth()

  if (!session) {
    notFound()
  }

  const troubles = await prisma.trouble.findMany({
    orderBy: {
      id: 'asc'
    }
  });
  const countries = await prisma.country.findMany({
    orderBy: {
      id: 'asc'
    }
  });
  const cities = await prisma.city.findMany({
    orderBy: {
      id: 'asc'
    }
  });

  return (
    <div>
      <PostForm troubleType={troubles} countries={countries} cities={cities} />
    </div>
  );
}
