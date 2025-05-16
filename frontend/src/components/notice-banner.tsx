"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Pin, AlertCircle } from 'lucide-react'
import { formatDate } from "@/lib/utils/date"
import noticeService from "@/lib/services/notice_service"
import type { NoticeWithUser } from "@/lib/types/notice"

export default function NoticeBanner() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [notices, setNotices] = useState<NoticeWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 공지사항 데이터 가져오기
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true)
        // skip 대신 0을 사용하고 limit은 10으로 설정
        const response = await noticeService.getImportantNotices({ skip: 0, limit: 10 })
        
        if (response.success && response.data) {
          setNotices(response.data.items)
        } else {
          setError("공지사항을 불러오는데 실패했습니다.")
        }
      } catch (err) {
        setError("공지사항을 불러오는데 오류가 발생했습니다.")
        console.error("공지사항 로딩 오류:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotices()
  }, [])

  // 표시할 공지사항 수 결정
  const displayNotices = isExpanded ? notices : notices.slice(0, 2)

  // 로딩 중이거나 공지사항이 없는 경우 처리
  if (isLoading) {
    return (
      <div className="mb-6 animate-pulse">
        <div className="h-6 bg-muted rounded mb-2"></div>
        <div className="space-y-2">
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6">
        <Card className="bg-destructive/10">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (notices.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-primary" />
          <h3 className="font-medium">웹사이트 공지사항</h3>
        </div>
        {notices.length > 2 && (
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 px-2">
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                <span>접기</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                <span>더보기</span>
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {displayNotices.map((notice) => (
          <Card key={notice.id} className="bg-muted/50 hover:bg-muted transition-colors">
            <CardContent className="p-3">
              <Link href={`/notices/${notice.id}`} className="block">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{notice.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notice.user.username} • {formatDate(notice.created_at)}
                    </p>
                  </div>
                  {/* view_count 속성 제거 */}
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}