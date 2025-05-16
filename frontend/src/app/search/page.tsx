// app/search/page.tsx

import Header from "@/components/header"
import Footer from "@/components/footer"
import SearchResults from "@/components/search-results"
import NewsFeed from "@/components/news-feed"
import SearchFilters from "@/components/search-filters"
import NoticeBanner from "@/components/notice-banner"
import { Metadata } from "next"

// 메타데이터 추가
export const metadata: Metadata = {
  title: '검색 결과 | Mountain',
  description: '검색 결과 페이지',
}

interface SearchPageProps {
  searchParams?: {
    q?: string
    page?: string
    sort?: string
    filter?: string
    institution?: string
    searchIn?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  // 검색 파라미터 처리
  const query = searchParams?.q || ""
  const currentPage = Number(searchParams?.page || "1")
  const sortBy = searchParams?.sort || "recent"
  const filter = searchParams?.filter || "all"
  const institution = searchParams?.institution || "all"
  const searchIn = searchParams?.searchIn || "all"

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row">
        <div className="w-full md:w-[70%] h-[calc(100vh-64px-48px)] overflow-y-auto border-r">
          <div className="p-4">
            <NoticeBanner />
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {query ? `"${query}" 검색 결과` : "전체 게시물"}
              </h1>
              <SearchFilters
                query={query}
                sortBy={sortBy}
                filter={filter}
                institution={institution}
                searchIn={searchIn}
              />
            </div>
            <SearchResults
              query={query}
              currentPage={currentPage}
              sortBy={sortBy}
              filter={filter}
              institution={institution}
              searchIn={searchIn}
            />
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