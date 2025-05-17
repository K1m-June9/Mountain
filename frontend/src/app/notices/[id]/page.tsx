// app/notices/[id]/page.tsx
import { notFound } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsFeed from "@/components/news-feed"
import noticeService from "@/lib/services/notice_service"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { Pin, Calendar, User } from 'lucide-react'

export default async function NoticePage({
  params,
}: {
  params: { id: string }
}) {
  // params를 사용하기 전에 await 추가
  const { id } = await Promise.resolve(params)
  const noticeId = Number.parseInt(id)
  
  // 공지사항 데이터 가져오기
  const noticeResponse = await noticeService.getNoticeById(noticeId)
  
  // 공지사항이 없거나 오류가 발생한 경우 404 페이지로 이동
  if (!noticeResponse.success || !noticeResponse.data) {
    notFound()
  }
  
  const notice = noticeResponse.data

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row">
        <div className="w-full md:w-[70%] h-[calc(100vh-64px-48px)] overflow-y-auto border-r">
          <div className="p-4">
            {/* InstitutionTabs 컴포넌트 제거 */}
            
            {/* 공지사항 상세 내용 */}
            <div className="mt-6">
              <div className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold">{notice.title}</h1>
                  {notice.is_important && (
                    <Badge variant="outline" className="bg-primary/20 text-primary">
                      <Pin className="h-3 w-3 mr-1" />
                      중요 공지사항
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {notice.user.username}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(notice.created_at)}
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line">{notice.content}</div>
                </div>
              </div>
            </div>
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