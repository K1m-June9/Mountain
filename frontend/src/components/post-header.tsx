// src/components/post-header.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import type { PostWithDetails } from "@/lib/types/post"

interface PostHeaderProps {
  post: PostWithDetails
  institutionColors: Record<string, string>
}

export default function PostHeader({ post, institutionColors }: PostHeaderProps) {
  // 기관 이름 추출
  const institutionName = post.institution?.name

  return (
    <CardHeader className="border-b">
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {institutionName && (
              <Badge
                className={institutionColors[institutionName] || "bg-gray-100 text-gray-800"}
                variant="outline"
              >
                {institutionName}
              </Badge>
            )}
            <h2 className="text-2xl font-bold">{post.title}</h2>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>조회 {post.view_count}</span>
            <span className="flex items-center">
              <ThumbsUp className="h-3 w-3 mr-1" />
              {post.like_count}
            </span>
            <span className="flex items-center">
              <ThumbsDown className="h-3 w-3 mr-1" />
              {post.dislike_count || 0}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback>{(post.user?.username || "U")[0]}</AvatarFallback>
            </Avatar>
            <span>{post.user?.username || "익명"}</span>
            {post.user_id && <span className="ml-1 text-xs">({post.user_id})</span>}
          </div>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>
      </div>
    </CardHeader>
  )
}