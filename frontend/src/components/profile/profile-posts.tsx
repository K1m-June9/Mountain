// src/components/profile/profile-posts.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PostWithDetails } from "@/lib/types/post"
import type { PaginationParams, ID } from "@/lib/types/common"
import postService from "@/lib/services/post_service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from 'lucide-react'
import Link from "next/link"
import { formatDate } from "@/lib/utils/date"
import { getErrorMessage } from "@/lib/api/utils" // 에러 처리를 위한 유틸리티 import

interface ProfilePostsProps {
  userId: ID
}

export default function ProfilePosts({ userId }: ProfilePostsProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 10 // 한 페이지에 표시할 게시물 수

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // 수정된 postService의 getPosts 메서드를 사용하여 특정 사용자의 게시물 조회
        // page 속성을 사용하도록 변경
        const result = await postService.getPosts({
          user_id: userId,
          page: page,
          limit: pageSize
        });
        
        if (result.success && result.data) {
          const fetchedPosts = result.data.items;
          
          if (fetchedPosts.length === 0) {
            setHasMore(false);
          } else {
            setPosts((prev) => (page === 1 ? fetchedPosts : [...prev, ...fetchedPosts]));
            // 더 불러올 데이터가 있는지 확인
            setHasMore(fetchedPosts.length === pageSize);
          }
        } else {
          setError(getErrorMessage(result.error) || "게시물을 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setError("게시물을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
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

  // 게시물 항목을 별도 컴포넌트로 추출하여 가독성 향상
  const PostItem = ({ post }: { post: PostWithDetails }) => (
    <div className="border rounded-md p-4 hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <Link href={`/posts/${post.id}`} className="font-medium hover:underline">
            {post.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            {post.institution && (
              <Badge 
                className={INSTITUTION_COLORS[post.institution.name] || "bg-gray-100 text-gray-800"} 
                variant="outline"
              >
                {post.institution.name}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {post.user.username} • {formatDate(post.created_at)}
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="mr-2">조회 {post.view_count}</span>
          <span className="mr-2">추천 {post.like_count}</span>
          <span>댓글 {post.comment_count}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>작성한 게시물</CardTitle>
        <CardDescription>내가 작성한 게시물 목록입니다.</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="text-center py-4 text-destructive">{error}</div>
        )}
        
        {posts.length === 0 && !isLoading && !error ? (
          <div className="text-center py-8 text-muted-foreground">작성한 게시물이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostItem key={post.id} post={post} />
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