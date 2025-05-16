// app/write/page.tsx

import { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsFeed from "@/components/news-feed"
import WritePostForm from "@/components/write-post-form"

export const metadata: Metadata = {
  title: "게시물 작성 | Mountain",
  description: "새로운 게시물을 작성하세요",
}

/**
 * 게시물 작성 페이지
 * 
 * 사용자가 새 게시물을 작성할 수 있는 페이지입니다.
 * 왼쪽에는 게시물 작성 폼, 오른쪽에는 뉴스 피드가 표시됩니다.
 */
export default function WritePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row">
        <div className="w-full md:w-[70%] h-[calc(100vh-64px-48px)] overflow-y-auto border-r">
          <div className="p-4 md:p-6">
            <WritePostForm />
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