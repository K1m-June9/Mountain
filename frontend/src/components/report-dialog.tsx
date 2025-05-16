"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Flag } from 'lucide-react'
import { type ReportReason, reportReasonLabels } from "@/lib/types/report"
import { useAuth } from "@/contexts/auth-context"
import { ID } from "@/lib/types/common"
import reportService from "@/lib/services/report_service"

interface ReportDialogProps {
  postId: ID
  postTitle: string
}

export default function ReportDialog({ postId, postTitle }: ReportDialogProps) {
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!isAuthenticated || !user) {
      setError("신고하려면 로그인이 필요합니다.")
      return
    }

    if (!reason) {
      setError("신고 사유를 선택해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      // reportService를 직접 호출
      const result = await reportService.reportPost(postId, {
        reason,
        description
      })

      if (result.success) {
        setSuccess("신고가 접수되었습니다. 검토 후 조치하겠습니다.")
        setReason(null)
        setDescription("")

        // 3초 후 모달 닫기
        setTimeout(() => {
          setOpen(false)
          setSuccess(null)
        }, 3000)
      } else {
        // ApiError 객체에서 message를 추출하여 문자열로 설정
        setError(result.error?.message || "신고 처리 중 오류가 발생했습니다.")
      }
    } catch (err) {
      console.error("신고 처리 중 오류:", err)
      setError("신고 처리 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Flag className="h-4 w-4" />
          <span>신고</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>게시물 신고</DialogTitle>
          <DialogDescription>
            부적절한 게시물을 신고합니다. 신고 사유를 선택하고 추가 설명을 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-2 border-green-500 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="py-4">
          <h4 className="text-sm font-medium mb-2">신고 대상 게시물</h4>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{postTitle}</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">신고 사유</Label>
              <RadioGroup value={reason || ""} onValueChange={(value) => setReason(value as ReportReason)}>
                {Object.entries(reportReasonLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`reason-${key}`} />
                    <Label htmlFor={`reason-${key}`}>{label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">추가 설명 (선택사항)</Label>
              <Textarea
                id="description"
                placeholder="신고 사유에 대한 추가 설명을 입력해주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "처리 중..." : "신고하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}