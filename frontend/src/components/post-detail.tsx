// src/components/post-detail.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// 컴포넌트 임포트
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, AlertTriangle } from 'lucide-react'
import ReportForm from "@/components/report-form"
//import CommentReportForm from "@/components/comment-report-form"

// 새로 분리한 컴포넌트 임포트
import PostHeader from "@/components/post-header"
import PostContent from "@/components/post-content"
import PostActions from "@/components/post-actions"
import PostFooter from "@/components/post-footer"
import CommentForm from "@/components/comment-form"
import CommentList from "@/components/comment-list"
import DeleteConfirmDialog from "@/components/delete-confirm-dialog"

// 컨텍스트 및 훅 임포트
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// 서비스 임포트
import postService from "@/lib/services/post_service"
import commentService from "@/lib/services/comment_service"

// 타입 임포트
import type { ID } from "@/lib/types/common"
import type { PostWithDetails } from "@/lib/types/post"
import type { CommentWithReplies, CommentWithUser } from "@/lib/types/comment"

interface PostDetailProps {
  postId: string
}

export default function PostDetail({ postId }: PostDetailProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  // 상태 관리
  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 로컬 상태로 좋아요/싫어요 상태 관리
  const [likedByMe, setLikedByMe] = useState(false)
  const [dislikedByMe, setDislikedByMe] = useState(false)

  // 게시물 및 댓글 불러오기
  useEffect(() => {
    const fetchPostAndComments = async () => {
      setIsLoading(true)
      try {
        // 게시물 불러오기 - postId를 숫자로 변환
        const postResponse = await postService.getPostById(Number(postId))
        if (!postResponse.success || !postResponse.data) {
          throw new Error(postResponse.error?.message || "게시물을 불러오는데 실패했습니다.")
        }

        // API 응답을 직접 사용
        const postData = postResponse.data
        setPost(postData)
        
        // 좋아요/싫어요 상태는 백엔드에서 제공하지 않으므로 기본값으로 설정
        setLikedByMe(false)
        setDislikedByMe(false)

        // 댓글 불러오기 - postId를 숫자로 변환
        const commentsResponse = await commentService.getPostComments(Number(postId))
        if (!commentsResponse.success) {
          throw new Error(commentsResponse.error?.message || "댓글을 불러오는데 실패했습니다.")
        }

        // API 응답을 직접 사용
        const commentsData = commentsResponse.data || []
        setComments(commentsData)
        setError(null)
      } catch (error) {
        console.error("Failed to fetch post or comments:", error)
        setError(error instanceof Error ? error.message : "게시물 또는 댓글을 불러오는데 실패했습니다.")
        toast.error("게시물 또는 댓글을 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPostAndComments()
  }, [postId])

  // 기관별 색상 매핑
  const institutionColors: Record<string, string> = {
    국회: "bg-blue-100 text-blue-800",
    여성가족부: "bg-pink-100 text-pink-800",
    교육부: "bg-green-100 text-green-800",
    문화체육관광부: "bg-purple-100 text-purple-800",
    고용노동부: "bg-orange-100 text-orange-800",
  }

  // 게시물 좋아요 처리
  const handleLike = async () => {
    if (!isAuthenticated || !post) return

    try {
      // 낙관적 UI 업데이트 - API 응답을 기다리지 않고 먼저 UI 업데이트
      const newLikedByMe = !likedByMe
      
      // 좋아요 상태 업데이트
      setLikedByMe(newLikedByMe)
      
      // 좋아요를 누르면 싫어요는 취소
      if (newLikedByMe && dislikedByMe) {
        setDislikedByMe(false)
      }
      
      // 게시물 좋아요 수 업데이트
      setPost((prev) => {
        if (!prev) return null
        
        return {
          ...prev,
          like_count: newLikedByMe ? prev.like_count + 1 : prev.like_count - 1,
          dislike_count: newLikedByMe && dislikedByMe ? prev.dislike_count - 1 : prev.dislike_count,
        }
      })

      // API 호출
      const response = await postService.likePost(post.id)

      // 409 Conflict는 에러로 처리하지 않음 (이미 좋아요 누른 상태)
      if (!response.success && response.error?.code !== "HTTP_ERROR_409") {
        throw new Error(response.error?.message || "좋아요 처리에 실패했습니다.")
      }

      // 성공 메시지는 유지 (선택적)
      if (response.success) {
        toast.success("좋아요를 표시했습니다.")
      }
    } catch (error) {
      console.error("Failed to like post:", error)
      toast.error(error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.")
      
      // 에러 발생 시 UI 상태 복원
      setLikedByMe(!likedByMe)
      if (dislikedByMe) {
        setDislikedByMe(true)
      }
      
      // 게시물 좋아요 수 복원
      setPost((prev) => {
        if (!prev) return null
        
        return {
          ...prev,
          like_count: likedByMe ? prev.like_count + 1 : prev.like_count - 1,
          dislike_count: dislikedByMe ? prev.dislike_count + 1 : prev.dislike_count,
        }
      })
    }
  }

  // 게시물 싫어요 처리
  const handleDislike = async () => {
    if (!isAuthenticated || !post) return

    try {
      // 낙관적 UI 업데이트 - API 응답을 기다리지 않고 먼저 UI 업데이트
      const newDislikedByMe = !dislikedByMe
      
      // 싫어요 상태 업데이트
      setDislikedByMe(newDislikedByMe)
      
      // 싫어요를 누르면 좋아요는 취소
      if (newDislikedByMe && likedByMe) {
        setLikedByMe(false)
      }
      
      // 게시물 싫어요 수 업데이트
      setPost((prev) => {
        if (!prev) return null
        
        return {
          ...prev,
          dislike_count: newDislikedByMe ? prev.dislike_count + 1 : prev.dislike_count - 1,
          like_count: newDislikedByMe && likedByMe ? prev.like_count - 1 : prev.like_count,
        }
      })

      // API 호출
      const response = await postService.dislikePost(post.id)

      // 409 Conflict는 에러로 처리하지 않음 (이미 싫어요 누른 상태)
      if (!response.success && response.error?.code !== "HTTP_ERROR_409") {
        throw new Error(response.error?.message || "싫어요 처리에 실패했습니다.")
      }

      // 성공 메시지는 유지 (선택적)
      if (response.success) {
        toast.success("싫어요를 표시했습니다.")
      }
    } catch (error) {
      console.error("Failed to dislike post:", error)
      toast.error(error instanceof Error ? error.message : "싫어요 처리에 실패했습니다.")
      
      // 에러 발생 시 UI 상태 복원
      setDislikedByMe(!dislikedByMe)
      if (likedByMe) {
        setLikedByMe(true)
      }
      
      // 게시물 싫어요 수 복원
      setPost((prev) => {
        if (!prev) return null
        
        return {
          ...prev,
          dislike_count: dislikedByMe ? prev.dislike_count + 1 : prev.dislike_count - 1,
          like_count: likedByMe ? prev.like_count + 1 : prev.like_count,
        }
      })
    }
  }

  // src/components/post-detail.tsx
  // 댓글 좋아요 처리 함수 수정
  const handleCommentLike = async (commentId: ID) => {
    if (!isAuthenticated) return

    try {
      // 낙관적 UI 업데이트
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              like_count: comment.like_count + 1,
              // 좋아요를 누르면 싫어요는 취소
              dislike_count: comment.dislike_count,
            }
          }

          // 답글 확인
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    like_count: reply.like_count + 1,
                    // 좋아요를 누르면 싫어요는 취소
                    dislike_count: reply.dislike_count,
                  }
                }
                return reply
              }),
            }
          }

          return comment
        }),
      )

      // API 호출 - 반환값에서 like_count, dislike_count를 사용하지 않음
      await commentService.likeComment(commentId)
      
    } catch (error) {
      console.error("Failed to like comment:", error)
      toast.error(error instanceof Error ? error.message : "댓글 좋아요 처리에 실패했습니다.")
      
      // 에러 발생 시 UI 상태 복원 로직 추가
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              like_count: Math.max(0, comment.like_count - 1),
            }
          }

          // 답글 확인
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    like_count: Math.max(0, reply.like_count - 1),
                  }
                }
                return reply
              }),
            }
          }

          return comment
        }),
      )
    }
  }

  // 댓글 싫어요 처리 함수 수정
  const handleCommentDislike = async (commentId: ID) => {
    if (!isAuthenticated) return

    try {
      // 낙관적 UI 업데이트
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              dislike_count: comment.dislike_count + 1,
              // 싫어요를 누르면 좋아요는 취소
              like_count: comment.like_count,
            }
          }

          // 답글 확인
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    dislike_count: reply.dislike_count + 1,
                    // 싫어요를 누르면 좋아요는 취소
                    like_count: reply.like_count,
                  }
                }
                return reply
              }),
            }
          }

          return comment
        }),
      )

      // API 호출 - 반환값에서 like_count, dislike_count를 사용하지 않음
      await commentService.dislikeComment(commentId)
      
    } catch (error) {
      console.error("Failed to dislike comment:", error)
      toast.error(error instanceof Error ? error.message : "댓글 싫어요 처리에 실패했습니다.")
      
      // 에러 발생 시 UI 상태 복원 로직 추가
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              dislike_count: Math.max(0, comment.dislike_count - 1),
            }
          }

          // 답글 확인
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    dislike_count: Math.max(0, reply.dislike_count - 1),
                  }
                }
                return reply
              }),
            }
          }

          return comment
        }),
      )
    }
  }

  // 댓글 작성 처리 함수 수정
  const handleAddComment = async (content: string) => {
    if (!content.trim() || !post || !user) return

    try {
      const response = await commentService.createComment({
        content: content,
        post_id: post.id,
      })

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "댓글 작성에 실패했습니다.")
      }

      // 새 댓글 생성 - user가 있는 경우에만 진행
      const newComment: CommentWithReplies = {
        ...response.data,
        user: user, // 현재 로그인한 사용자 정보 사용
        like_count: 0,
        dislike_count: 0,
        replies: [],
      }

      setComments((prev) => [newComment, ...prev])
      toast.success("댓글이 작성되었습니다.")
    } catch (error) {
      console.error("Failed to create comment:", error)
      toast.error(error instanceof Error ? error.message : "댓글 작성에 실패했습니다.")
      throw error
    }
  }

  // 답글 제출 함수 수정
  const handleSubmitReply = async (commentId: ID, content: string) => {
    if (!content.trim() || !post || !user) return

    try {
      const response = await commentService.createComment({
        content: content,
        post_id: post.id,
        parent_id: Number(commentId),
      })

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "답글 작성에 실패했습니다.")
      }

      // 새 답글 생성
      const newReply: CommentWithUser = {
        ...response.data,
        user: user, // 현재 로그인한 사용자 정보 사용
        like_count: 0,
        dislike_count: 0,
      }

      // 로컬 상태 업데이트 - 계층 구조 유지
      setComments((prev) => {
        return prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          }
          return comment
        })
      })

      toast.success("답글이 작성되었습니다.")
    } catch (error) {
      console.error("Failed to create reply:", error)
      toast.error(error instanceof Error ? error.message : "답글 작성에 실패했습니다.")
      throw error
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId: ID) => {
    try {
      const response = await commentService.deleteComment(commentId)
      if (!response.success) {
        throw new Error(response.error?.message || "댓글 삭제에 실패했습니다.")
      }

      // 로컬 상태 업데이트 (삭제된 상태로 표시)
      setComments((prev) => {
        return prev.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, is_hidden: true, content: "삭제된 댓글입니다." }
          }

          // 답글 확인
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  return { ...reply, is_hidden: true, content: "삭제된 댓글입니다." }
                }
                return reply
              }),
            }
          }

          return comment
        })
      })

      toast.success("댓글이 삭제되었습니다.")
    } catch (error) {
      console.error("Failed to delete comment:", error)
      toast.error(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.")
      throw error
    }
  }

  // 댓글 수정 제출
  const handleSubmitEditComment = async (commentId: ID, content: string) => {
    if (!content.trim()) return

    try {
      const response = await commentService.updateComment(commentId, {
        content: content,
      })

      if (!response.success) {
        throw new Error(response.error?.message || "댓글 수정에 실패했습니다.")
      }

      // 로컬 상태 업데이트
      setComments((prev) => {
        return prev.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, content: content }
          }

          // 답글 확인
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  return { ...reply, content: content }
                }
                return reply
              }),
            }
          }

          return comment
        })
      })

      toast.success("댓글이 수정되었습니다.")
    } catch (error) {
      console.error("Failed to update comment:", error)
      toast.error(error instanceof Error ? error.message : "댓글 수정에 실패했습니다.")
      throw error
    }
  }

  // 게시물 삭제 확인 다이얼로그 표시
  const handleShowDeleteDialog = () => {
    setShowDeleteDialog(true)
  }

  // 게시물 삭제 처리
  const handleDeletePost = async () => {
    if (!post) return

    setIsDeleting(true)
    try {
      const response = await postService.deletePost(post.id)
      if (!response.success) {
        throw new Error(response.error?.message || "게시물 삭제에 실패했습니다.")
      }

      setIsDeleting(false)
      setShowDeleteDialog(false)
      toast.success("게시물이 삭제되었습니다.")

      // 삭제 성공 시 목록 페이지로 이동
      router.push("/")
      router.refresh()
    } catch (error) {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      console.error("Failed to delete post:", error)
      toast.error(error instanceof Error ? error.message : "게시물 삭제에 실패했습니다.")
    }
  }

  // 게시물 수정 페이지로 이동
  const handleEditPost = () => {
    if (!post) return
    router.push(`/edit/${post.id}`)
  }

  // 댓글 신고 시작
  const handleReportComment = (commentId: ID) => {
    setReportingCommentId(String(commentId))
  }

  // 댓글 신고 취소
  const handleCloseCommentReport = () => {
    setReportingCommentId(null)
  }

  // 신고 중인 댓글 찾기
  const findReportingComment = (commentId: string): CommentWithUser | undefined => {
    // 최상위 댓글에서 찾기
    const mainComment = comments.find(c => c.id.toString() === commentId)
    if (mainComment) return mainComment
    
    // 답글에서 찾기
    for (const comment of comments) {
      if (comment.replies) {
        const reply = comment.replies.find(r => r.id.toString() === commentId)
        if (reply) return reply
      }
    }
    
    return undefined
  }
  
  const reportingComment = reportingCommentId ? findReportingComment(reportingCommentId) : null

  // 현재 사용자가 게시물 작성자인지 확인
  const isPostAuthor = user?.id === post?.user_id

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container max-w-4xl py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "게시물을 찾을 수 없습니다."}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/">목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>목록으로 돌아가기</span>
        </Link>
      </div>

      {post.is_hidden && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            이 게시물은 신고가 누적되어 숨김 처리되었습니다. 관리자 검토 후 복원될 수 있습니다.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        {/* 게시물 헤더 */}
        <PostHeader post={post} institutionColors={institutionColors} />

        {/* 게시물 내용 */}
        <PostContent post={post} />

        {/* 게시물 푸터 */}
        <PostFooter
          post={post}
          isPostAuthor={isPostAuthor}
          onEdit={handleEditPost}
          onDelete={handleShowDeleteDialog}
        />

        {/* 게시물 액션 버튼들 */}
        <div className="px-6 pb-6">
          <PostActions
            post={post}
            isAuthenticated={isAuthenticated}
            onLike={handleLike}
            onDislike={handleDislike}
            onReport={() => setShowReportForm(true)}
          />
        </div>
      </Card>

      {/* 게시물 신고 폼 */}
      {showReportForm && (
        <div className="mt-6">
          <ReportForm
          targetId={post.id}
          targetType="post"
          targetTitle={post.title}
          onClose={() => setShowReportForm(false)}
          />
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">댓글 {comments.length}개</h3>

        {/* 댓글 작성 폼 */}
        <CommentForm isAuthenticated={isAuthenticated} onSubmit={handleAddComment} />

        {/* 댓글 신고 폼 */}
        {reportingComment && reportingCommentId && (
          <div className="mb-6">
            <ReportForm
              targetId={Number(reportingCommentId)}
              targetType="comment"
              targetTitle={`댓글 신고`}
              targetContent={reportingComment.content}
              targetAuthor={reportingComment.user?.username || "익명"}
              onClose={handleCloseCommentReport}
            />
          </div>
        )}

        {/* 댓글 목록 */}
        <Card>
          <CardContent className="py-6">
            <CommentList
              comments={comments}
              isAuthenticated={isAuthenticated}
              currentUserId={user?.id}
              onLike={handleCommentLike}
              onDislike={handleCommentDislike}
              onReply={handleSubmitReply}
              onEdit={handleSubmitEditComment}
              onDelete={handleDeleteComment}
              onReport={handleReportComment}
            />
          </CardContent>
        </Card>
      </div>

      {/* 게시물 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        isDeleting={isDeleting}
        title="게시물 삭제"
        description="정말로 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeletePost}
      />
    </div>
  )
}