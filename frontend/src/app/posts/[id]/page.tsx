// app/posts/[id]/page.tsx
import { notFound } from "next/navigation"
import PostDetail from "@/components/post-detail"
import Header from "@/components/header"
import Footer from "@/components/footer"
import InstitutionTabs from "@/components/institution-tabs"
import NewsFeed from "@/components/news-feed"
import postService from "@/lib/services/post_service"

export default async function PostPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { page?: string }
}) {
  const postId = Number.parseInt(params.id)
  
  // 게시물 데이터 가져오기
  const postResponse = await postService.getPost(postId)
  
  // 게시물이 없거나 오류가 발생한 경우 404 페이지로 이동
  if (!postResponse.success || !postResponse.data) {
    notFound()
  }
  
  const post = postResponse.data

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row">
        <div className="w-full md:w-[70%] h-[calc(100vh-64px-48px)] overflow-y-auto border-r">
          <div className="p-4">
            <InstitutionTabs />
            <PostDetail postId={post.id.toString()} />
          </div>
        </div>
        <div className="w-full md:w-[30%] h-[calc(100vh-64px-48px)] overflow-y-auto">
          <div className="p-4">
            <NewsFeed />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}