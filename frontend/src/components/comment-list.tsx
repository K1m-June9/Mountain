"use client"

import CommentItem from "./comment-item"
import type { CommentWithReplies, CommentWithUser } from "@/lib/types/comment"
import type { ID } from "@/lib/types/common"

interface CommentListProps {
  comments: CommentWithReplies[]
  isAuthenticated: boolean
  currentUserId?: ID
  onLike: (commentId: ID) => Promise<void>
  onDislike: (commentId: ID) => Promise<void>
  onReply: (commentId: ID, content: string) => Promise<void>
  onEdit: (commentId: ID, content: string) => Promise<void>
  onDelete: (commentId: ID) => Promise<void>
  onReport: (commentId: ID) => void
}

export default function CommentList({
  comments,
  isAuthenticated,
  currentUserId,
  onLike,
  onDislike,
  onReply,
  onEdit,
  onDelete,
  onReport
}: CommentListProps) {
  // 댓글 작성자인지 확인하는 함수 - CommentWithUser 타입으로 변경
  const isCommentAuthor = (comment: CommentWithUser) => currentUserId === comment.user_id

  // 최상위 댓글만 필터링 (parent_id가 null인 댓글)
  const topLevelComments = comments.filter((comment) => comment.parent_id === null)

  if (topLevelComments.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {topLevelComments.map((comment) => (
        <div key={String(comment.id)} className="space-y-2">
          {/* 최상위 댓글 */}
          <CommentItem
            comment={comment}
            isAuthenticated={isAuthenticated}
            isCommentAuthor={isCommentAuthor(comment)}
            onLike={onLike}
            onDislike={onDislike}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
          />

          {/* 답글 목록 - 항상 표시 (답글이 있는 경우) */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={String(reply.id)}
                  comment={reply}
                  isAuthenticated={isAuthenticated}
                  isCommentAuthor={isCommentAuthor(reply)}
                  onLike={onLike}
                  onDislike={onDislike}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReport={onReport}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}