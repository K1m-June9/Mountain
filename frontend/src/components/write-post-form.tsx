// src/components/write-post-form.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import postService from "@/lib/services/post_service"
import institutionService from "@/lib/services/institution_service"
import type { Institution } from "@/lib/types/institution"
import type { PostCreateRequest } from "@/lib/types/post"
import { toast } from "sonner"

export default function WritePostForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [institutionId, setInstitutionId] = useState<string>(searchParams.get("institution_id") || "")
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 기관 목록 가져오기
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await institutionService.getInstitutions()
        if (response.success && response.data) {
          setInstitutions(response.data.items)
        } else {
          console.error("Failed to fetch institutions:", response.error)
          toast.error("기관 목록을 불러오는데 실패했습니다.")
        }
      } catch (error) {
        console.error("Error fetching institutions:", error)
        toast.error("기관 목록을 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstitutions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 입력값 검증
    if (!title.trim()) {
      setError("제목을 입력해주세요.")
      return
    }

    if (!content.trim()) {
      setError("내용을 입력해주세요.")
      return
    }

    if (!institutionId) {
      setError("기관을 선택해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      // 게시물 생성 API 호출
      const postData: PostCreateRequest = {
        title,
        content,
        institution_id: parseInt(institutionId),
      }

      const response = await postService.createPost(postData)

      if (response.success) {
        toast.success("게시물이 작성되었습니다.")
        // 성공 시 홈페이지로 리다이렉트
        router.push("/")
        router.refresh()
      } else {
        setError(response.error?.message || "게시물 작성 중 오류가 발생했습니다.")
        toast.error("게시물 작성에 실패했습니다.")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Failed to create post:", error)
      setError("게시물 작성 중 오류가 발생했습니다. 다시 시도해주세요.")
      toast.error("게시물 작성에 실패했습니다.")
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500">기관 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">새 게시물 작성</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              <Input
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select value={institutionId} onValueChange={setInstitutionId}>
                <SelectTrigger>
                  <SelectValue placeholder="게시물 카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id.toString()}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px]"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "게시물 작성 중..." : "게시물 작성"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}