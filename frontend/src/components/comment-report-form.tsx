"use client"

import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-sonner"
import reportService from "@/lib/services/report_service"
import type { ReportCreateRequest } from "@/lib/types/report"
import type { ID } from "@/lib/types/common"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// 신고 이유 옵션
const REPORT_REASONS = [
  { value: "inappropriate", label: "부적절한 내용" },
  { value: "harassment", label: "괴롭힘 또는 혐오 발언" },
  { value: "spam", label: "스팸 또는 광고" },
  { value: "false_info", label: "허위 정보" },
  { value: "other", label: "기타" },
]

interface CommentReportFormProps {
  commentId: ID
  postId: ID
  commentAuthor: string
  commentContent: string
  onClose?: () => void
}

export default function CommentReportForm({
  commentId,
  postId,
  commentAuthor,
  commentContent,
  onClose,
}: CommentReportFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const toast = useToast()

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!reason) {
      toast.error("신고 이유를 선택해주세요.")
      return
    }

    setIsLoading(true)
    
    try {
      const reportData: ReportCreateRequest = {
        reason,
        description: description.trim() || undefined,
      }

      const result = await reportService.reportComment(commentId, reportData)
      
      if (result.success) {
        toast.success("신고가 접수되었습니다.")
        setOpen(false)
        // 폼 초기화
        setReason("")
        setDescription("")
        // 부모 컴포넌트에 알림
        onClose?.()
      } else {
        toast.error(result.error?.message || "신고 처리 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error reporting comment:", error)
      toast.error("신고 처리 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    // 닫을 때 폼 초기화
    if (!newOpen) {
      setReason("")
      setDescription("")
    }
    setOpen(newOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          신고
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글 신고</AlertDialogTitle>
            <AlertDialogDescription>
              다음 댓글을 신고합니다:
              <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                <p className="font-semibold">{commentAuthor}</p>
                <p className="mt-1 line-clamp-3">{commentContent}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="reason">신고 이유 <span className="text-destructive">*</span></Label>
              <Select
                value={reason}
                onValueChange={setReason}
                required
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="신고 이유를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">추가 설명 (선택사항)</Label>
              <Textarea
                id="description"
                placeholder="신고 이유에 대한 추가 설명을 입력하세요"
                value={description}
                onChange={handleDescriptionChange}
                rows={3}
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel type="button">취소</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="submit" disabled={isLoading || !reason}>
                {isLoading ? "신고 중..." : "신고"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}