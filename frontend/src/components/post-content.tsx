// src/components/post-content.tsx
"use client"

import { CardContent } from "@/components/ui/card"
import type { PostWithDetails } from "@/lib/types/post"
import Image from "next/image"

interface PostContentProps {
  post: PostWithDetails
}

export default function PostContent({ post }: PostContentProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  return (
    <CardContent className="pt-6">
      {/* 이미지 렌더링 */}
      {post.images && post.images.length > 0 && (
        <div className="mb-6 space-y-4">
          {post.images.map((image) => (
            <div key={image.id} className="rounded-md overflow-hidden">
              <img 
                src={`${API_BASE_URL}${image.image_url}`} 
                alt="게시물 이미지" 
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* 텍스트 내용 */}
      <div className="prose max-w-none">
        {post.content?.split("\n").map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </CardContent>
  )
}