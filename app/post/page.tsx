"use client";  // 追加することで Client Component に変換

import PostForm from "../components/PostForm";

export default function PostPage() {
  const handleSubmit = (data: any) => {
    console.log("Form submitted:", data);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Post a Travel Trouble</h2>
      <PostForm onSubmit={handleSubmit} />
    </div>
  );
}
