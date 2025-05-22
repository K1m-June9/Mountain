// src/components/post-list.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import type { PostWithDetails } from "@/lib/types/post"
import type { NoticeWithUser } from "@/lib/types/notice"
import type { Institution } from "@/lib/types/institution"
import { Badge } from "@/components/ui/badge"
import Pagination from "@/components/pagination"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AlertTriangle, Pin, ThumbsUp, ThumbsDown } from 'lucide-react'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import postService from "@/lib/services/post_service"
import noticeService from "@/lib/services/notice_service"
import institutionService from "@/lib/services/institution_service"

interface PostListProps {
  institutionId?: number
  showTags?: boolean
}

export default function PostList({ institutionId, showTags = false }: PostListProps) {
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get("page") || "1")
  const postsPerPage = 50 // 페이지당 게시물 수
  const { user, isAuthenticated } = useAuth()
  const isAdmin = user?.role === "admin" || false
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [notices, setNotices] = useState<NoticeWithUser[]>([])
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [pagination, setPagination] = useState({
    page: currentPage,
    limit: postsPerPage,
    total: 0,
  })

  // 기관 정보 가져오기 (institutionId가 있는 경우)
  useEffect(() => {
    const fetchInstitution = async () => {
      if (institutionId) {
        try {
          const response = await institutionService.getInstitution(institutionId)
          if (response.success && response.data) {
            setInstitution(response.data)
          }
        } catch (error) {
          console.error("Failed to fetch institution:", error)
        }
      }
    }

    fetchInstitution()
  }, [institutionId])

  // 공지사항과 게시물 가져오기
  useEffect(() => {
    const fetchPostsAndNotices = async () => {
      setLoading(true)
      try {
        // 공지사항 가져오기
        const noticesResponse = await noticeService.getNotices({
          important_only: false,
          limit: 5 // 중요 공지사항 5개만 가져오기
        })
        
        if (noticesResponse.success && noticesResponse.data) {
          setNotices(noticesResponse.data.items || [])
        }

        // 기관별 게시물 가져오기
        const params: any = {
          page: currentPage,
          limit: postsPerPage,
        }

        if (institutionId) {
          params.institution_id = institutionId
        }

        const postsResponse = await postService.getPosts(params)
        if (postsResponse.success && postsResponse.data) {
          setPosts(postsResponse.data.items || [])
          setPagination({
            page: postsResponse.data.page,
            limit: postsResponse.data.limit,
            total: postsResponse.data.total,
          })
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error)
        toast.error("게시물을 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchPostsAndNotices()
  }, [currentPage, institutionId])

  // 기관별 색상 매핑
  const institutionColors: Record<string, string> = {
    국회: "bg-blue-100 text-blue-800",
    여성가족부: "bg-pink-100 text-pink-800",
    교육부: "bg-green-100 text-green-800",
    문화체육관광부: "bg-purple-100 text-purple-800",
    고용노동부: "bg-orange-100 text-orange-800",
  }

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      toast.error("글을 작성하려면 먼저 로그인해주세요.")
      return
    }

    if (institutionId) {
      router.push(`/write?institution_id=${institutionId}`)
    } else {
      router.push("/write")
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {institution ? `${institution.name} 게시물` : "전체 게시물"}
        </h2>
        <Button onClick={handleWriteClick}>글쓰기</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">제목</TableHead>
                <TableHead>글쓴이</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead className="text-right">조회</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    <span>좋아요</span>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end">
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    <span>싫어요</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.length === 0 && posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    게시물이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {/* 공지사항 렌더링 */}
                  {notices.map((notice) => (
                    <TableRow key={`notice-${notice.id}`} className="bg-muted/30">
                      <TableCell className="font-medium">
                        <Link href={`/notices/${notice.id}`} className="hover:underline">
                          <div className="flex items-center gap-1">
                            <Badge className="mr-2 bg-primary/20 text-primary hover:bg-primary/30" variant="outline">
                              <Pin className="h-3 w-3 mr-1" />
                              공지사항
                            </Badge>
                            <span>{notice.title}</span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span>{notice.user?.nickname || "관리자"}</span>
                          {notice.user_id && <span className="text-gray-400 text-xs ml-1">({notice.user_id})</span>}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(notice.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                  ))}

                  {/* 게시물 렌더링 */}
                  {posts.map((post) => (
                    <TableRow key={`post-${post.id}`} className={post.is_hidden ? "bg-gray-100" : ""}>
                      <TableCell className="font-medium">
                        <Link href={`/posts/${post.id}`} className="hover:underline">
                          <div className="flex items-center gap-1">
                            {showTags && post.institution && (
                              <Badge 
                                className={`mr-2 ${institutionColors[post.institution.name] || "bg-gray-100 text-gray-800"}`} 
                                variant="outline"
                              >
                                {post.institution.name}
                              </Badge>
                            )}
                            {post.is_hidden && (
                              <span className="relative group">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  신고로 인해 숨김 처리된 게시물
                                </span>
                              </span>
                            )}
                            <span>{post.title}</span>
                            {post.comment_count > 0 && <span className="text-gray-500 ml-1">[{post.comment_count}]</span>}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span>{post.user?.username || "익명"}</span>
                          {post.user.nickname && <span className="text-gray-400 text-xs ml-1">({post.user.nickname})</span>}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{post.view_count}</TableCell>
                      <TableCell className="text-right">{post.like_count}</TableCell>
                      <TableCell className="text-right">{post.dislike_count || 0}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          <Pagination
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            currentPage={pagination.page}
            institution={institution || undefined}
          />
        </>
      )}
    </div>
  )
}