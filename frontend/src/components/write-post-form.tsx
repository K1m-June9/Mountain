// src/components/write-post-form.tsx
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ImageIcon, X } from 'lucide-react'
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
  
  // 이미지 관련 상태 추가
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // 파일 크기 검사 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("이미지 크기는 5MB 이하여야 합니다.")
        return
      }
      
      // 파일 형식 검사
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        toast.error("지원되는 이미지 형식은 JPG, PNG, GIF입니다.")
        return
      }
      
      setSelectedImage(file)
      
      // 이미지 미리보기 생성
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 이미지 업로드 함수
  const uploadImage = async (postId: number): Promise<boolean> => {
    if (!selectedImage) return true // 이미지가 없으면 성공으로 간주
    
    try {
      const result = await postService.uploadImage(selectedImage, postId)
      if (!result.success) {
        console.error("Failed to upload image:", result.error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error uploading image:", error)
      return false
    }
  }

  // 게시물 삭제 함수
  const deletePost = async (postId: number) => {
    try {
      await postService.deletePost(postId)
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

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
      // 1. 게시물 생성 API 호출
      const postData: PostCreateRequest = {
        title,
        content,
        institution_id: parseInt(institutionId),
      }

      const response = await postService.createPost(postData)

      if (response.success && response.data) {
        const postId = response.data.id
        
        // 2. 이미지 업로드 (게시물 ID 포함)
        const imageUploaded = await uploadImage(postId)
        
        if (!imageUploaded) {
          // 이미지 업로드 실패 시 게시물 삭제
          await deletePost(postId)
          setError("이미지 업로드에 실패했습니다. 게시물이 작성되지 않았습니다.")
          toast.error("게시물 작성에 실패했습니다.")
          setIsSubmitting(false)
          return
        }
        
        // 성공 시 홈페이지로 리다이렉트
        toast.success("게시물이 작성되었습니다.")
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
              className="min-h-[300px] mb-4"
            />
            
            {/* 이미지 업로드 UI */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">이미지 첨부</p>
              
              {imagePreview ? (
                <div className="relative w-full h-48 mb-4 border rounded-md overflow-hidden">
                  <img 
                    src={imagePreview || "/placeholder.svg"} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <label 
                    htmlFor="image-upload" 
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">이미지를 선택하세요 (최대 5MB)</span>
                      <span className="text-xs text-gray-400 mt-1">지원 형식: JPG, PNG, GIF</span>
                    </div>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageSelect}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </div>
              )}
            </div>
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