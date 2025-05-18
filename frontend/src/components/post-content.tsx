// src/components/post-content.tsx
"use client"

import { CardContent } from "@/components/ui/card"
import type { PostWithDetails } from "@/lib/types/post"

interface PostContentProps {
  post: PostWithDetails
}

export default function PostContent({ post }: PostContentProps) {
  return (
    <CardContent className="pt-6">
      <div className="prose max-w-none">
        {post.content?.split("\n").map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </CardContent>
  )
}