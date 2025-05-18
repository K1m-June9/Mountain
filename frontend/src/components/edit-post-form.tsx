// src/components/edit-post-form.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// 타입 임포트 수정
import type { PostWithDetails, PostUpdateRequest } from "@/lib/types/post"
import type { Institution } from "@/lib/types/institution"
import type { ID } from "@/lib/types/common"
import postService from "@/lib/services/post_service"
import institutionService from "@/lib/services/institution_service"

interface EditPostFormProps {
  postId: ID
}

export default function EditPostForm({ postId }: EditPostFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [institutionId, setInstitutionId] = useState<ID | undefined>(undefined)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 기관 목록 불러오기
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const result = await institutionService.getInstitutions();
        if (result.success && result.data) {
          setInstitutions(result.data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch institutions:", error);
      }
    };

    fetchInstitutions();
  }, []);

  // 게시물 정보 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const result = await postService.getPostById(postId);
        
        if (result.success && result.data) {
          const fetchedPost = result.data;
          setPost(fetchedPost);
          setTitle(fetchedPost.title);
          setContent(fetchedPost.content || "");
          setInstitutionId(fetchedPost.institution_id || undefined); //원래는 안되지만, 샘플 이슈
          setIsLoading(false);
        } else {
          setError(result.error?.message || "게시물 정보를 불러오는데 실패했습니다.");
          setIsLoading(false);
          toast.error("게시물 정보를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
        setError("게시물 정보를 불러오는데 실패했습니다.");
        setIsLoading(false);
        toast.error("게시물 정보를 불러오는데 실패했습니다.");
      }
    };

    fetchPost();
  }, [postId]);

  // 현재 사용자가 게시물 작성자인지 확인
  const isAuthor = user?.id === post?.user_id;

  // 공지사항인지 확인 (category 이름으로 확인)
  const isNotice = post?.category?.name === "공지사항";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 권한 확인
    if (!isAuthor) {
      setError("게시물 수정 권한이 없습니다.");
      return;
    }

    // 입력값 검증
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    // 공지사항이 아닌 경우에만 기관 선택 필수
    if (!isNotice && !institutionId) {
      setError("기관을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 게시물 수정 API 호출 - 수정된 부분
      const updateData: PostUpdateRequest = {
        title,
        content,
        institution_id: institutionId,
      };

      const result = await postService.updatePost(postId, updateData);

      if (result.success) {
        toast.success("게시물이 수정되었습니다.");
        // 성공 시 게시물 상세 페이지로 리다이렉트
        router.push(`/posts/${postId}`);
        router.refresh();
      } else {
        setError(result.error?.message || "게시물 수정 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        toast.error("게시물 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      setError("게시물 수정 중 오류가 발생했습니다.");
      setIsSubmitting(false);
      toast.error("게시물 수정에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">게시물 수정</h1>

      {!isAuthor && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>게시물 수정 권한이 없습니다.</AlertDescription>
        </Alert>
      )}

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
                disabled={!isAuthor}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 공지사항이 아닌 경우에만 기관 선택 가능 */}
            {!isNotice && (
              <div className="mb-4">
                <Select 
                  value={institutionId?.toString()} 
                  onValueChange={(value) => setInstitutionId(Number(value))}
                  disabled={!isAuthor}
                >
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
            )}

            <Textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px]"
              disabled={!isAuthor}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || !isAuthor}>
              {isSubmitting ? "수정 중..." : "수정 완료"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}