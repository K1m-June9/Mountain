'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { resetPassword } from "@/lib/api/auth"
import { z } from "zod"

// 비밀번호 유효성 검사 스키마
const passwordSchema = z.object({
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"]
})

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError("유효하지 않은 비밀번호 재설정 링크입니다.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setError("유효하지 않은 비밀번호 재설정 링크입니다.")
      return
    }
    
    // 비밀번호 유효성 검사
    try {
      passwordSchema.parse({ password, confirmPassword })
    } catch (error: any) {
      const fieldErrors = error.errors?.[0]
      setError(fieldErrors?.message || "비밀번호 유효성 검사에 실패했습니다.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await resetPassword(token, password)
      if (result.success) {
        setSuccess(result.message || "비밀번호가 성공적으로 재설정되었습니다.")
        // 3초 후 로그인 페이지로 리다이렉션
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(result.message || "비밀번호 재설정 중 오류가 발생했습니다.")
      }
    } catch (error: any) {
      setError("비밀번호 재설정 중 오류가 발생했습니다.")
      console.error("Password reset error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">비밀번호 재설정</CardTitle>
          <CardDescription>새로운 비밀번호를 입력해주세요.</CardDescription>
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
              <Label htmlFor="password">새 비밀번호</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="새 비밀번호를 입력하세요" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
              />
              <p className="text-xs text-gray-500">비밀번호는 최소 6자 이상이어야 합니다.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="비밀번호를 다시 입력하세요" 
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError(null)
                }}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !token}>
              {isLoading ? "처리 중..." : "비밀번호 재설정"}
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