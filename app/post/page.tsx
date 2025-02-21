import { prisma } from "@/lib/prisma";
import PostForm from "../components/PostForm";
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: '投稿',
  description: '投稿ページ',
}

export default async function PostPage() {
  const troubles = await prisma.trouble.findMany();
  const countries = await prisma.country.findMany();

  return (
    <div>
      <PostForm troubleType={troubles} countries={countries}/>
    </div>
  );
}