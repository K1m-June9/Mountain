// src/components/login-form.tsx
"use client"

import type React from "react"
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
import { toast } from "sonner"
import type { LoginRequest } from "@/lib/types/auth"

export default function LoginForm() {
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 이미 로그인한 경우 적절한 페이지로 리다이렉트
  if (isAuthenticated) {
    // user.role을 확인하여 관리자인지 확인
    if (user?.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/")
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError("아이디를 입력해주세요.")
      return
    }

    if (!password) {
      setError("비밀번호를 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      // LoginRequest 타입에 맞게 객체 생성
      const loginData: LoginRequest = {
        username,
        password
      }

      // auth-context.tsx에서 remember 값을 처리하도록 수정 필요
      // 현재는 타입 단언을 사용하여 임시 해결
      const result = await login({
        ...loginData,
        remember // 타입에는 없지만 실제 구현에서 사용됨
      } as any)
      
      if (result.success) {
        toast.success("로그인에 성공했습니다.")
        // 관리자인 경우 관리자 페이지로, 일반 사용자인 경우 홈으로 리다이렉트
        if (result.user?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        setError(result.message || "로그인에 실패했습니다.")
        toast.error(result.message || "로그인에 실패했습니다.")
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.")
      toast.error("로그인 중 오류가 발생했습니다.")
      console.error("Login error:", err)
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">아이디</Label>
            <Input
              id="username"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" checked={remember} onCheckedChange={(checked) => setRemember(!!checked)} />
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