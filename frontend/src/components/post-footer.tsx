// src/components/post-footer.tsx
"use client"

import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { Edit, Trash2, ThumbsUp, ThumbsDown, Share2, Flag } from 'lucide-react'
import type { PostWithDetails } from "@/lib/types/post"

interface PostFooterProps {
  post: PostWithDetails
  isPostAuthor: boolean
  isAuthenticated: boolean
  onEdit: () => void
  onDelete: () => void
  onLike: () => void
  onDislike: () => void
  onReport: () => void
}

export default function PostFooter({ 
  post, 
  isPostAuthor, 
  isAuthenticated,
  onEdit, 
  onDelete,
  onLike,
  onDislike,
  onReport
}: PostFooterProps) {
  return (
    <CardFooter className="flex justify-between border-t py-4">
      {/* 좋아요/싫어요/공유/신고 버튼 (왼쪽) */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onLike}
          className={`flex items-center gap-1 ${post.liked_by_me ? "bg-blue-50 text-blue-600" : ""}`}
          disabled={!isAuthenticated}
        >
          <ThumbsUp className={`h-4 w-4 ${post.liked_by_me ? "fill-blue-500" : ""}`} />
          <span>좋아요 {post.like_count}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDislike}
          className={`flex items-center gap-1 ${post.disliked_by_me ? "bg-red-50 text-red-600" : ""}`}
          disabled={!isAuthenticated}
        >
          <ThumbsDown className={`h-4 w-4 ${post.disliked_by_me ? "fill-red-500" : ""}`} />
          <span>싫어요 {post.dislike_count || 0}</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <Share2 className="h-4 w-4" />
          <span>공유</span>
        </Button>
        {isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={onReport}
          >
            <Flag className="h-4 w-4" />
            <span>신고</span>
          </Button>
        )}
      </div>

      {/* 수정/삭제 버튼 (오른쪽) */}
      <div className="flex space-x-2">
        {isPostAuthor && (
          <>
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={onEdit}>
              <Edit className="h-4 w-4" />
              <span>수정</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-red-500"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span>삭제</span>
            </Button>
          </>
        )}
      </div>
    </CardFooter>
  )
}