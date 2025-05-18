// src/components/post-actions.tsx
"use client"

import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Share2, Flag } from 'lucide-react'
import type { PostWithDetails } from "@/lib/types/post"

interface PostActionsProps {
  post: PostWithDetails
  isAuthenticated: boolean
  onLike: () => void
  onDislike: () => void
  onReport: () => void
}

export default function PostActions({
  post,
  isAuthenticated,
  onLike,
  onDislike,
  onReport,
}: PostActionsProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onLike}
        className="flex items-center gap-1"
        disabled={!isAuthenticated}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>좋아요 {post.like_count}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDislike}
        className="flex items-center gap-1"
        disabled={!isAuthenticated}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>싫어요 {post.dislike_count || 0}</span>
      </Button>
      <Button variant="outline" size="sm" className="flex items-center gap-1">
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
  )
}