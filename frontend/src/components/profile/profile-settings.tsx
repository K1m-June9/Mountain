"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldAlert } from 'lucide-react'
import { type User } from "@/lib/types/user"
import authService from "@/lib/services/auth_service"

interface ProfileSettingsProps {
  user: User
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // 입력 시 해당 필드의 오류 메시지 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = "현재 비밀번호를 입력해주세요."
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요."
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "비밀번호는 최소 8자 이상이어야 합니다."
    }
    
    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "비밀번호 확인을 입력해주세요."
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "새 비밀번호와 확인 비밀번호가 일치하지 않습니다."
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // 새로 추가한 비밀번호 변경 메서드 사용
      const response = await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })
      
      if (response.success) {
        toast.success("비밀번호가 성공적으로 변경되었습니다.")
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        })
      } else {
        // 오류 메시지 처리
        if (response.error?.message === "Incorrect current password") {
          setErrors((prev) => ({ 
            ...prev, 
            currentPassword: "현재 비밀번호가 올바르지 않습니다." 
          }))
          toast.error("현재 비밀번호가 올바르지 않습니다.")
        } else {
          toast.error(response.error?.message || "비밀번호 변경에 실패했습니다.")
        }
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error)
      toast.error("비밀번호 변경 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          보안 설정
        </CardTitle>
        <CardDescription>
          계정 비밀번호를 변경하여 보안을 강화하세요.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="currentPassword">현재 비밀번호</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleInputChange}
            placeholder="현재 비밀번호를 입력하세요"
            disabled={isLoading}
            className={errors.currentPassword ? "border-destructive" : ""}
          />
          {errors.currentPassword && (
            <p className="text-sm text-destructive">{errors.currentPassword}</p>
          )}
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="newPassword">새 비밀번호</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="새 비밀번호를 입력하세요"
            disabled={isLoading}
            className={errors.newPassword ? "border-destructive" : ""}
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            비밀번호는 최소 8자 이상이어야 합니다.
          </p>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="confirmNewPassword">새 비밀번호 확인</Label>
          <Input
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            value={formData.confirmNewPassword}
            onChange={handleInputChange}
            placeholder="새 비밀번호를 다시 입력하세요"
            disabled={isLoading}
            className={errors.confirmNewPassword ? "border-destructive" : ""}
          />
          {errors.confirmNewPassword && (
            <p className="text-sm text-destructive">{errors.confirmNewPassword}</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleChangePassword} 
          disabled={isLoading}
          className="ml-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            "비밀번호 변경"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}