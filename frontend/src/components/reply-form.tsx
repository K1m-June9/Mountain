"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ReplyFormProps {
  commentId: string
  onSubmit: (content: string) => Promise<void>
  onCancel: () => void
}

export default function ReplyForm({ commentId, onSubmit, onCancel }: ReplyFormProps) {
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(replyText)
      setReplyText("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-4 pl-4 border-l-2 border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="답글을 작성해주세요"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="min-h-[80px]"
          disabled={isSubmitting}
        />
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            size="sm"
            disabled={!replyText.trim() || isSubmitting}
          >
            {isSubmitting ? "작성 중..." : "답글 작성"}
          </Button>
        </div>
      </form>
    </div>
  )
}