'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { requestPasswordReset } from "@/lib/api/auth"
import { z } from "zod"

// 이메일 유효성 검사 스키마
const emailSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요.")
})

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 이메일 유효성 검사
    try {
      emailSchema.parse({ email })
    } catch (error: any) {
      setError(error.errors?.[0]?.message || "유효한 이메일 주소를 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await requestPasswordReset(email)
      if (result.success) {
        setSuccess(result.message || "비밀번호 재설정 링크가 이메일로 전송되었습니다.")
      } else {
        setError(result.message || "비밀번호 재설정 요청 중 오류가 발생했습니다.")
      }
    } catch (error: any) {
      setError("비밀번호 재설정 요청 중 오류가 발생했습니다.")
      console.error("Password reset error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">비밀번호 찾기</CardTitle>
          <CardDescription>가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="가입한 이메일 주소를 입력하세요" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "처리 중..." : "비밀번호 재설정 링크 받기"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}