// app/edit/[id]/page.tsx

import { notFound } from "next/navigation"
import EditPostForm from "@/components/edit-post-form"
import Header from "@/components/header"
import Footer from "@/components/footer"
import postService from "@/lib/services/post_service"

export default async function EditPostPage({ params }: { params: { id: string } }) {
  // ID 타입 변환
  const postId = Number(params.id)
  
  // 리팩토링된 postService 사용
  const postResult = await postService.getPostById(postId)
  
  // 게시물이 없거나 오류가 발생한 경우 404 페이지로 이동
  if (!postResult.success || !postResult.data || postResult.data.is_hidden) {
    notFound()
  }

  const post = postResult.data

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <EditPostForm postId={post.id} />
      </main>
      <Footer />
    </div>
  )
}