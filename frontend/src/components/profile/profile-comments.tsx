"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CommentWithUser } from "@/lib/types/comment"
import { ID } from "@/lib/types/common"
import commentService from "@/lib/services/comment_service"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare } from 'lucide-react'
import Link from "next/link"
import { formatDate } from "@/lib/utils/date"
import { getErrorMessage } from "@/lib/api/utils"

interface ProfileCommentsProps {
  userId: ID
}

interface UserComment extends CommentWithUser {
  post_title: string;
}

export default function ProfileComments({ userId }: ProfileCommentsProps) {
  const [comments, setComments] = useState<UserComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const result = await commentService.getUserComments(userId, page);
        
        if (!result.success || !result.data) {
          console.error("Failed to fetch comments:", result.error ? getErrorMessage(result.error) : "Unknown error");
          setHasMore(false);
          setIsLoading(false);
          return;
        }
        
        const fetchedComments = result.data.items;
        
        // 백엔드에서 post_title을 제공하지 않으므로 임시로 설정
        const commentsWithPostTitle = fetchedComments.map(comment => ({
          ...comment,
          post_title: `게시물 #${comment.post_id}` // 임시 제목
        }));
        
        if (fetchedComments.length === 0) {
          setHasMore(false);
        } else {
          setComments((prev) => (page === 1 ? commentsWithPostTitle : [...prev, ...commentsWithPostTitle]));
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [userId, page]);

  const loadMore = () => {
    setPage((prev) => prev + 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>작성한 댓글</CardTitle>
        <CardDescription>내가 작성한 댓글 목록입니다.</CardDescription>
      </CardHeader>

      <CardContent>
        {comments.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">작성한 댓글이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-md p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <Link href={`/posts/${comment.post_id}`} className="font-medium hover:underline">
                      {comment.post_title}
                    </Link>
                    <p className="mt-1 text-sm">{comment.content}</p>
                    <div className="mt-2 text-xs text-muted-foreground">{formatDate(comment.created_at)}</div>
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