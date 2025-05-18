"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, MessageSquare, Flag, Edit, Trash2, Check, X, CornerDownRight, AlertTriangle } from 'lucide-react'
import ReplyForm from "./reply-form"
import type { CommentWithUser } from "@/lib/types/comment"
import type { ID } from "@/lib/types/common"

interface CommentItemProps {
  comment: CommentWithUser
  isAuthenticated: boolean
  isCommentAuthor: boolean
  onLike: (commentId: ID) => Promise<void>
  onDislike: (commentId: ID) => Promise<void>
  onReply: (commentId: ID, content: string) => Promise<void>
  onEdit: (commentId: ID, content: string) => Promise<void>
  onDelete: (commentId: ID) => Promise<void>
  onReport: (commentId: ID) => void
}

export default function CommentItem({
  comment,
  isAuthenticated,
  isCommentAuthor,
  onLike,
  onDislike,
  onReply,
  onEdit,
  onDelete,
  onReport
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)

  // 댓글이 답글인지 확인 (parent_id가 있는 경우)
  const isReply = comment.parent_id !== null

  // 답글 작성 시작
  const handleStartReply = () => {
    setIsReplying(true)
  }

  // 답글 작성 취소
  const handleCancelReply = () => {
    setIsReplying(false)
  }

  // 답글 제출
  const handleSubmitReply = async (content: string) => {
    await onReply(comment.id, content)
    setIsReplying(false)
  }

  // 댓글 수정 시작
  const handleStartEdit = () => {
    setIsEditing(true)
    setEditText(comment.content)
  }

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  // 댓글 수정 제출
  const handleSubmitEdit = async () => {
    if (!editText.trim()) return
    await onEdit(comment.id, editText)
    setIsEditing(false)
  }

  return (
    <Card className={comment.is_hidden ? "bg-gray-50" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {isReply && <CornerDownRight className="h-4 w-4 mr-2 text-muted-foreground" />}
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback>{(comment.user?.nickname || "U")[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{comment.user?.nickname || "익명"}</span>
            {comment.user_id && <span className="ml-1 text-xs text-muted-foreground">({comment.user_id})</span>}
          </div>
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
          </div>
        </div>

        {comment.is_hidden ? (
          <div className="p-2 bg-gray-100 rounded text-muted-foreground italic">
            <AlertTriangle className="h-4 w-4 inline-block mr-2" />
            신고로 인해 숨김 처리된 댓글입니다.
          </div>
        ) : isEditing ? (
          // 댓글 수정 폼
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                <span>취소</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitEdit}
                className="flex items-center gap-1"
                disabled={!editText.trim()}
              >
                <Check className="h-3 w-3" />
                <span>저장</span>
              </Button>
            </div>
          </div>
        ) : (
          <p>{comment.content}</p>
        )}

        {/* 댓글 액션 버튼 (수정 중이 아닐 때만 표시) */}
        {!isEditing && (
          <div className="flex justify-end mt-2 gap-2">
            {/* 좋아요/싫어요 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => onLike(comment.id)}
              disabled={!isAuthenticated}
            >
              <ThumbsUp className="h-3 w-3" />
              <span className="text-xs">{comment.like_count || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => onDislike(comment.id)}
              disabled={!isAuthenticated}
            >
              <ThumbsDown className="h-3 w-3" />
              <span className="text-xs">{comment.dislike_count || 0}</span>
            </Button>

            {isAuthenticated && !comment.is_hidden && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-muted-foreground"
                  onClick={handleStartReply}
                >
                  <MessageSquare className="h-3 w-3" />
                  <span className="text-xs">답글</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-muted-foreground"
                  onClick={() => onReport(comment.id)}
                >
                  <Flag className="h-3 w-3" />
                  <span className="text-xs">신고</span>
                </Button>

                {isCommentAuthor && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-blue-500"
                      onClick={handleStartEdit}
                    >
                      <Edit className="h-3 w-3" />
                      <span className="text-xs">수정</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-red-500"
                      onClick={() => onDelete(comment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="text-xs">삭제</span>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* 답글 작성 폼 */}
        {isReplying && (
          <ReplyForm
            commentId={String(comment.id)}
            onSubmit={handleSubmitReply}
            onCancel={handleCancelReply}
          />
        )}
      </CardContent>
    </Card>
  )
}