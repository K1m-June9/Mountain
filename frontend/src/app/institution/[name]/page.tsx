// app/institution/[name]/page.tsx

import { notFound } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PostList from "@/components/post-list"
import NewsFeed from "@/components/news-feed"
import InstitutionTabs from "@/components/institution-tabs"
import NoticeBanner from "@/components/notice-banner"
import institutionService from "@/lib/services/institution_service"
import type { InstitutionName } from "@/components/news-feed"

// 서버 컴포넌트에서 기관 정보 가져오기
async function getInstitutionById(id: string) {
  try {
    const response = await institutionService.getInstitution(parseInt(id))
    if (response.success && response.data) {
      return response.data
    }
    return null
  } catch (error) {
    console.error("Failed to fetch institution:", error)
    return null
  }
}

export default async function InstitutionPage({
  params,
  searchParams,
}: {
  params: { name: string }
  searchParams?: { page?: string }
}) {
  const resolvedParams = await params;
  const institutionId = resolvedParams.name;
  
  // 기관 정보 가져오기
  const institution = await getInstitutionById(institutionId)
  
  // 유효한 기관인지 확인
  if (!institution) {
    notFound()
  }

  // 기관 이름을 InstitutionName 타입으로 변환 (NewsFeed 컴포넌트용)
  // 참고: 실제 기관 이름이 InstitutionName 타입과 일치하지 않을 수 있으므로 타입 단언 사용
  const institutionNameForNewsFeed = institution.name as InstitutionName

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row">
        <div className="w-full md:w-[70%] h-[calc(100vh-64px-48px)] overflow-y-auto border-r">
          <div className="p-4">
            <NoticeBanner />
            <InstitutionTabs activeInstitution={institution} />
            <PostList institutionId={institution.id} showTags={false} />
          </div>
        </div>
        <div className="w-full md:w-[30%] h-[calc(100vh-64px-48px)] overflow-y-auto">
          <div className="p-4">
            <NewsFeed institution={institutionNameForNewsFeed} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}