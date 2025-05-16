"use client"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/hooks/use-sonner"
import { useState } from "react"
import userService from "@/lib/services/user_service"
import type { UserUpdateRequest } from "@/lib/types/user"

// 프로필 폼 스키마 정의
const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "이름은 최소 2글자 이상이어야 합니다.",
  }),
  email: z.string().email({
    message: "유효한 이메일 주소를 입력해주세요.",
  }),
  bio: z
    .string()
    .max(160, {
      message: "자기소개는 최대 160자까지 가능합니다.",
    })
    .optional(),
})

// 프로필 폼 값 타입 정의
type ProfileFormValues = z.infer<typeof profileFormSchema>

// 프로필 폼 속성 정의
interface ProfileFormProps {
  initialValues: ProfileFormValues
  onSubmit?: (values: ProfileFormValues) => Promise<void>
}

export function ProfileForm({ initialValues, onSubmit }: ProfileFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 폼 초기화
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialValues,
    mode: "onChange",
  })

  // 폼 제출 핸들러
  async function handleFormSubmit(values: ProfileFormValues) {
    setIsSubmitting(true)
    
    try {
      // 커스텀 onSubmit 핸들러가 제공된 경우 사용
      if (onSubmit) {
        await onSubmit(values)
      } else {
        // 기본 동작: 사용자 서비스를 통해 프로필 업데이트
        const updateData: UserUpdateRequest = {
          username: values.username,
          email: values.email,
          bio: values.bio
        }
        
        const result = await userService.updateUserProfile(updateData)
        
        if (!result.success) {
          throw new Error(result.error?.message || "프로필 업데이트에 실패했습니다.")
        }
      }
      
      toast.success("프로필이 업데이트되었습니다.")
    } catch (error) {
      console.error("프로필 업데이트 오류:", error)
      toast.error(error instanceof Error ? error.message : "프로필 업데이트에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="이름을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input placeholder="example@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>자기소개</FormLabel>
              <FormControl>
                <Input placeholder="간단한 자기소개를 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </form>
    </Form>
  )
}