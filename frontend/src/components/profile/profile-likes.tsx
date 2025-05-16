"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Post, PostWithDetails } from "@/lib/types/post"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ThumbsUp } from 'lucide-react'
import Link from "next/link"
import { formatDate } from "@/lib/utils/date"
import postService from "@/lib/services/post_service"
import { getErrorMessage } from "@/lib/api/utils"
import type { ID, PaginationParams } from "@/lib/types/common"

interface ProfileLikesProps {
  userId: ID
}

export default function ProfileLikes({ userId }: ProfileLikesProps) {
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 10 // 한 페이지에 표시할 게시물 수

  useEffect(() => {
    const fetchLikedPosts = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // PaginationParams 타입에 맞게 수정 (skip/limit 사용)
        const params: PaginationParams = {
          skip: (page - 1) * pageSize,
          limit: pageSize
        };
        
        const result = await postService.getLikedPostsByUser(userId, params);
        
        if (result.success && result.data) {
          const fetchedPosts = result.data.items;
          
          if (fetchedPosts.length === 0) {
            setHasMore(false);
          } else {
            setLikedPosts((prev) => (page === 1 ? fetchedPosts : [...prev, ...fetchedPosts]));
            // 더 불러올 데이터가 있는지 확인 (total과 현재까지 로드된 항목 수 비교)
            const totalLoaded = (page * pageSize);
            setHasMore(totalLoaded < result.data.total);
          }
        } else {
          setError(getErrorMessage(result.error) || "게시물을 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("Failed to fetch liked posts:", error);
        setError("게시물을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedPosts();
  }, [userId, page, pageSize]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  // 기관별 색상 매핑을 상수로 분리
  const INSTITUTION_COLORS: Record<string, string> = {
    국회: "bg-blue-100 text-blue-800",
    여성가족부: "bg-pink-100 text-pink-800",
    교육부: "bg-green-100 text-green-800",
    문화체육관광부: "bg-purple-100 text-purple-800",
    고용노동부: "bg-orange-100 text-orange-800",
    // 기본값은 렌더링 시 처리
  };

  // 기관 이름을 가져오는 함수 (institution_id를 기반으로)
  const getInstitutionName = (institutionId?: ID): string => {
    // 실제 구현에서는 기관 ID를 기관 이름으로 매핑하는 로직이 필요합니다.
    // 여기서는 간단히 ID를 문자열로 반환합니다.
    return institutionId ? `기관 ${institutionId}` : '기관 없음';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>좋아요한 게시물</CardTitle>
        <CardDescription>내가 좋아요한 게시물 목록입니다.</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="text-center py-4 text-destructive">{error}</div>
        )}
        
        {likedPosts.length === 0 && !isLoading && !error ? (
          <div className="text-center py-8 text-muted-foreground">좋아요한 게시물이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {likedPosts.map((post) => (
              <div key={post.id} className="border rounded-md p-4 hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <ThumbsUp className="h-4 w-4 text-blue-500 mt-1" />
                    <div>
                      <Link href={`/posts/${post.id}`} className="font-medium hover:underline">
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={INSTITUTION_COLORS[getInstitutionName(post.institution_id)] || "bg-gray-100 text-gray-800"} 
                          variant="outline"
                        >
                          {getInstitutionName(post.institution_id)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {/* user_id를 사용하거나, 사용자 정보를 별도로 가져와야 함 */}
                          사용자 {post.user_id} • {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="mr-2">조회 {post.view_count}</span>
                    {/* like_count와 comment_count는 Post 타입에 없음, 필요하다면 별도로 가져와야 함 */}
                    <span className="mr-2">추천 {/* post.like_count */}</span>
                    <span>댓글 {/* post.comment_count */}</span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {hasMore && !isLoading && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadMore}>
                  더 보기
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}