'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { z } from "zod"

// 회원가입 폼 유효성 검사 스키마
const registerSchema = z.object({
  username: z.string().min(4, "아이디는 최소 4자 이상이어야 합니다.").max(20, "아이디는 최대 20자까지 가능합니다.").regex(/^[a-zA-Z0-9]+$/, "영문, 숫자만 사용 가능합니다."),
  nickname: z.string().min(2, "닉네임은 최소 2자 이상이어야 합니다.").max(20, "닉네임은 최대 20자까지 가능합니다."),
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"]
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const router = useRouter()
  const { register, isAuthenticated, checkUsernameAvailability } = useAuth()
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    username: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [usernameMessage, setUsernameMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  // 이미 로그인한 경우 홈으로 리다이렉트
  if (isAuthenticated) {
    router.push("/")
    return null
  }

  const validateForm = (): boolean => {
    try {
      registerSchema.parse(formValues)
      setErrors({})
      return true
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Partial<Record<keyof RegisterFormValues, string>> = {}
        error.errors.forEach((err: any) => {
          const path = err.path[0] as keyof RegisterFormValues
          fieldErrors[path] = err.message
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleChange = (field: keyof RegisterFormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }))
    // 필드 값이 변경되면 해당 필드의 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // 일반 에러 메시지 제거
    if (generalError) {
      setGeneralError(null)
    }
    // 아이디 필드가 변경되면 중복 확인 메시지 초기화
    if (field === "username") {
      setUsernameMessage(null)
    }
  }

  // 아이디 중복 확인
  const handleCheckUsername = async () => {
    if (!formValues.username.trim()) {
      setUsernameMessage({ type: "error", message: "아이디를 입력해주세요." })
      return
    }

    // 아이디 형식 검사
    try {
      z.string().min(4).max(20).regex(/^[a-zA-Z0-9]+$/).parse(formValues.username)
    } catch (error: any) {
      setUsernameMessage({ type: "error", message: "아이디는 4~20자의 영문, 숫자만 사용 가능합니다." })
      return
    }

    setIsCheckingUsername(true)
    try {
      const result = await checkUsernameAvailability(formValues.username)
      if (result.available) {
        setUsernameMessage({ type: "success", message: result.message || "사용 가능한 아이디입니다." })
      } else {
        setUsernameMessage({ type: "error", message: result.message || "사용할 수 없는 아이디입니다." })
      }
    } catch (error: any) {
      setUsernameMessage({ type: "error", message: "중복 확인 중 오류가 발생했습니다." })
    } finally {
      setIsCheckingUsername(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 폼 유효성 검사
    if (!validateForm()) {
      return
    }

    // 아이디 중복 확인 여부 검사
    if (!usernameMessage || usernameMessage.type !== "success") {
      setGeneralError("아이디 중복 확인을 해주세요.")
      return
    }

    setIsLoading(true)
    setGeneralError(null)

    try {
      const result = await register({
        username: formValues.username,
        nickname: formValues.nickname,
        email: formValues.email,
        password: formValues.password
      })

      if (result.success) {
        // 회원가입 성공 시 홈으로 리다이렉션
        router.push("/")
      } else {
        setGeneralError(result.message || "회원가입에 실패했습니다.")
      }
    } catch (error: any) {
      setGeneralError("회원가입 중 오류가 발생했습니다.")
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">회원가입</CardTitle>
        <CardDescription>Mountain 커뮤니티에 가입하여 다양한 기능을 이용하세요.</CardDescription>
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
            <Label htmlFor="username">아이디 *</Label>
            <div className="flex gap-2">
              <Input
                id="username"
                placeholder="아이디를 입력하세요"
                value={formValues.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className={errors.username ? "border-red-500" : ""}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCheckUsername} 
                disabled={isCheckingUsername}
              >
                {isCheckingUsername ? "확인 중..." : "중복 확인"}
              </Button>
            </div>
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username}</p>
            )}
            {usernameMessage && (
              <p className={`text-sm ${usernameMessage.type === "success" ? "text-green-600" : "text-red-600"} mt-1`}>
                {usernameMessage.type === "success" ? (
                  <CheckCircle2 className="inline-block h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="inline-block h-3 w-3 mr-1" />
                )}
                {usernameMessage.message}
              </p>
            )}
            <p className="text-xs text-gray-500">영문, 숫자만 사용 가능하며 4~20자 사이여야 합니다.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임 *</Label>
            <Input
              id="nickname"
              placeholder="닉네임을 입력하세요"
              value={formValues.nickname}
              onChange={(e) => handleChange("nickname", e.target.value)}
              className={errors.nickname ? "border-red-500" : ""}
            />
            {errors.nickname && (
              <p className="text-sm text-red-500 mt-1">{errors.nickname}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일 *</Label>
            <Input
              id="email"
              type="email"
              placeholder="이메일 주소를 입력하세요"
              value={formValues.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호 *</Label>
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
            <p className="text-xs text-gray-500">비밀번호는 최소 6자 이상이어야 합니다.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formValues.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "회원가입 중..." : "회원가입"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}