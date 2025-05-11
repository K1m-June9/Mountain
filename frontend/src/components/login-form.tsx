'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { z } from "zod"

// 로그인 폼 유효성 검사 스키마
const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  remember: z.boolean().optional()
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuth()
  const [formValues, setFormValues] = useState<LoginFormValues>({
    username: "",
    password: "",
    remember: false
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 이미 로그인한 경우 적절한 페이지로 리다이렉트
  if (isAuthenticated) {
    if (user?.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/")
    }
    return null
  }

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formValues)
      setErrors({})
      return true
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Partial<Record<keyof LoginFormValues, string>> = {}
        error.errors.forEach((err: any) => {
          const path = err.path[0] as keyof LoginFormValues
          fieldErrors[path] = err.message
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleChange = (field: keyof LoginFormValues, value: string | boolean) => {
    setFormValues(prev => ({ ...prev, [field]: value }))
    // 필드 값이 변경되면 해당 필드의 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // 일반 에러 메시지 제거
    if (generalError) {
      setGeneralError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 폼 유효성 검사
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setGeneralError(null)

    try {
      const result = await login({
        username: formValues.username,
        password: formValues.password,
        remember: formValues.remember
      })

      if (result.success) {
        // 로그인 성공 시 리다이렉션은 auth-context에서 처리됨
      } else {
        setGeneralError(result.message || "로그인에 실패했습니다.")
      }
    } catch (error: any) {
      setGeneralError("로그인 중 오류가 발생했습니다.")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">로그인</CardTitle>
        <CardDescription>계정에 로그인하여 Mountain 커뮤니티를 이용하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        {generalError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">아이디</Label>
            <Input
              id="username"
              placeholder="아이디를 입력하세요"
              value={formValues.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">비밀번호</Label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                비밀번호 찾기
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={formValues.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={formValues.remember}
              onCheckedChange={(checked) => handleChange("remember", !!checked)}
            />
            <Label htmlFor="remember" className="text-sm font-normal">
              로그인 상태 유지
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}