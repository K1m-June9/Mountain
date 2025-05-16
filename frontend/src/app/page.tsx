"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import PostList from "@/components/post-list"
import NewsFeed from "@/components/news-feed"
import InstitutionTabs from "@/components/institution-tabs"
import NoticeBanner from "@/components/notice-banner"

export default function Home({
  searchParams,
}: {
  searchParams?: { page?: string }
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-[70%] h-full overflow-y-auto border-r">
          <div className="p-4">
            <NoticeBanner />
            <InstitutionTabs />
            {/* institutionId prop으로 변경 (undefined 전달) */}
            <PostList institutionId={undefined} showTags={true} />
          </div>
        </div>
        <div className="w-full md:w-[30%] h-full overflow-y-auto">
          <div className="p-4">
            <NewsFeed />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}