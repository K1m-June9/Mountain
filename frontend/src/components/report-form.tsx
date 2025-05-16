"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import reportService from "@/lib/services/report_service"
import type { ReportCreateRequest } from "@/lib/types/report"
import type { ID } from "@/lib/types/common"
import { toast } from "sonner"

interface ReportFormProps {
  postId: ID
  postTitle: string
  onClose: () => void
}

export default function ReportForm({ postId, postTitle, onClose }: ReportFormProps) {
  const [reason, setReason] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const reportReasons = [
    { value: "hate_speech", label: "혐오 발언" },
    { value: "spam", label: "스팸" },
    { value: "harassment", label: "괴롭힘" },
    { value: "inappropriate", label: "부적절한 내용" },
    { value: "other", label: "기타" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!reason) {
      setError("신고 사유를 선택해주세요.")
      return
    }

    setIsSubmitting(true)

    // 신고 데이터 생성
    const reportData: ReportCreateRequest = {
      reason,
      description: description || undefined,
    }

    try {
      const response = await reportService.reportPost(postId, reportData)
      
      if (response.success) {
        setSuccess(true)
        toast.success("신고가 접수되었습니다.")

        // 3초 후 폼 닫기
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        // API 에러 처리
        setError(response.error?.message || "신고 접수 중 오류가 발생했습니다.")
        toast.error("신고 접수에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to submit report:", error)
      setError("신고 접수 중 오류가 발생했습니다.")
      toast.error("신고 접수에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>게시물 신고</CardTitle>
        <CardDescription>이 게시물이 커뮤니티 가이드라인을 위반한다고 생각하시면 신고해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <Alert className="mb-4 border-green-500 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>신고가 접수되었습니다. 검토 후 적절한 조치가 취해질 것입니다.</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">신고 대상 게시물</h3>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{postTitle}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">신고 사유</h3>
              <RadioGroup value={reason} onValueChange={setReason}>
                {reportReasons.map((item) => (
                  <div key={item.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={item.value} id={`reason-${item.value}`} />
                    <Label htmlFor={`reason-${item.value}`}>{item.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">추가 설명 (선택사항)</h3>
              <Textarea
                placeholder="신고 사유에 대한 추가 설명을 입력해주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting || success}>
          취소
        </Button>
        {!success && (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "신고 중..." : "신고하기"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}