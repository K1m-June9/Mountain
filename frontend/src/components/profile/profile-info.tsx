"use client"

import type React from "react"
import { useState } from "react"
import { User, UserUpdateRequest } from "@/lib/types/user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from "sonner"
import userService from "@/lib/services/user_service"
import { getErrorMessage } from "@/lib/api/utils"

interface ProfileInfoProps {
  user: User
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const [nickname, setNickname] = useState(user.nickname || "")
  const [bio, setBio] = useState(user.bio || "")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      // UserUpdateRequest 타입에 맞게 업데이트 데이터 생성
      const updateData: UserUpdateRequest = {
        nickname,
        bio
      };
      
      const result = await userService.updateUserProfile(updateData);
      
      if (result.success) {
        setSuccess("프로필이 성공적으로 업데이트되었습니다.")
        toast.success("프로필이 업데이트되었습니다.")
      } else {
        setError(getErrorMessage(result.error) || "프로필 업데이트에 실패했습니다.")
        toast.error("프로필 업데이트에 실패했습니다.")
      }
    } catch (err) {
      console.error("Profile update error:", err)
      setError("프로필 업데이트 중 오류가 발생했습니다.")
      toast.error("프로필 업데이트 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
        <CardDescription>프로필 정보를 수정할 수 있습니다.</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">아이디</Label>
            <Input id="username" value={user.username} disabled />
            <p className="text-sm text-muted-foreground">아이디는 변경할 수 없습니다.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" value={user.email} disabled />
            <p className="text-sm text-muted-foreground">이메일은 변경할 수 없습니다.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">자기소개</Label>
            <Textarea
              id="bio"
              placeholder="자기소개를 입력하세요"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "업데이트 중..." : "프로필 업데이트"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}