// src/components/post-footer.tsx
"use client"

import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { Edit, Trash2 } from 'lucide-react'
import Link from "next/link"
import type { PostWithDetails } from "@/lib/types/post"

interface PostFooterProps {
  post: PostWithDetails
  isPostAuthor: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function PostFooter({ post, isPostAuthor, onEdit, onDelete }: PostFooterProps) {
  // 기관 이름 추출
  const institutionName = post.institution?.name

  return (
    <CardFooter className="flex justify-between border-t py-4">
      <div className="flex space-x-2">
        {/* PostActions 컴포넌트가 이 위치에 렌더링됩니다 */}
      </div>
      <div className="flex space-x-2">
        {/* 게시물 작성자인 경우 수정/삭제 버튼 표시 */}
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
        {institutionName && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/institution/${encodeURIComponent(institutionName)}`}>목록</Link>
          </Button>
        )}
      </div>
    </CardFooter>
  )
}