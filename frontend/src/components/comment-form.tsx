"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface CommentFormProps {
  isAuthenticated: boolean
  onSubmit: (content: string) => Promise<void>
}

export default function CommentForm({ isAuthenticated, onSubmit }: CommentFormProps) {
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !isAuthenticated || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(commentText)
      setCommentText("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder="댓글을 작성해주세요"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="mb-4"
            disabled={!isAuthenticated || isSubmitting}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!isAuthenticated || !commentText.trim() || isSubmitting}
            >
              {isSubmitting ? "작성 중..." : "댓글 작성"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}