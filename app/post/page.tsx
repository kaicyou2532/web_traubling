import { prisma } from "@/lib/prisma";
import PostForm from "../components/PostForm";
import type { Metadata } from "next";

export const meta: Metadata = {
  title: "投稿ページ",
  description: "投稿ページ",
};

export default async function PostPage() {
  const troubles = await prisma.trouble.findMany();
  const countries = await prisma.country.findMany();

  return (
    <div>
      <PostForm troubleType={troubles} countries={countries}/>
    </div>
  );
}
