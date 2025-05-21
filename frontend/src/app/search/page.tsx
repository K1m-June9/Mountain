"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import SearchResults from "@/components/search-results"
import NewsFeed from "@/components/news-feed"
import SearchFilters from "@/components/search-filters"
import NoticeBanner from "@/components/notice-banner"
import { Metadata } from "next"

export default function SearchPage() {
  const searchParams = useSearchParams()
  
  // 검색 파라미터 처리
  const query = searchParams.get("q") || ""
  const currentPage = Number(searchParams.get("page") || "1")
  const sortBy = searchParams.get("sort") || "recent"
  const filter = searchParams.get("filter") || "all"
  const institution = searchParams.get("institution") || "all"
  
  // 검색 결과 상태
  const [isSearching, setIsSearching] = useState(false)

  // 검색어가 변경될 때 검색 상태 업데이트
  useEffect(() => {
    setIsSearching(!!query)
  }, [query])

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
              />
            </div>
            {isSearching ? (
              <SearchResults
                query={query}
                currentPage={currentPage}
                sortBy={sortBy}
                filter={filter}
                institution={institution}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-500 mb-4">
                  검색어를 입력하여 게시물을 검색해보세요.
                </div>
              </div>
            )}
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