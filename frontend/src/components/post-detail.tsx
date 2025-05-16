"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// 컴포넌트 임포트
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ReportForm from "@/components/report-form"
import CommentReportForm from "@/components/comment-report-form"

// 아이콘 임포트
import { ThumbsUp, ThumbsDown, Share2, ArrowLeft, Flag, AlertTriangle, MessageSquare, CornerDownRight, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react'

// 컨텍스트 및 훅 임포트
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// 서비스 임포트
import postService from "@/lib/services/post_service"
import commentService from "@/lib/services/comment_service"

// 타입 임포트
import type { Post, PostWithDetails } from "@/lib/types/post"
import type { Comment, CommentWithUser } from "@/lib/types/comment"
import type { ID } from "@/lib/types/common"
import type { Institution } from "@/lib/types/institution"

interface PostDetailProps {
  postId: string
}

// 프론트엔드 표시용 확장 타입
interface ExtendedPost extends Omit<PostWithDetails, 'institution'> {
  author?: { nickname: string; profileImage?: string };
  authorId?: ID;
  institution?: string | Institution;
  likedByMe?: boolean;
  dislikedByMe?: boolean;
  isNotice?: boolean;
  isHidden?: boolean;
}

interface ExtendedComment extends Omit<CommentWithUser, 'user'> {
  user?: any; // 원래 타입 유지
  author?: { nickname: string; profileImage?: string };
  authorId?: ID;
  parentId?: ID;
  replyCount?: number;
  likedByMe?: boolean;
  dislikedByMe?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  isHidden?: boolean;
}

export default function PostDetail({ postId }: PostDetailProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  
  // 상태 관리
  const [post, setPost] = useState<ExtendedPost | null>(null)
  const [comments, setComments] = useState<ExtendedComment[]>([])
  const [commentText, setCommentText] = useState("")
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 게시물 및 댓글 불러오기
  // 게시물 및 댓글 불러오기
useEffect(() => {
  const fetchPostAndComments = async () => {
    setIsLoading(true)
    try {
      // 게시물 불러오기 - postId를 숫자로 변환
      const postResponse = await postService.getPost(Number(postId))
      if (!postResponse.success || !postResponse.data) {
        throw new Error(postResponse.error?.message || "게시물을 불러오는데 실패했습니다.")
      }
      
      // API 응답을 프론트엔드 표시용 형식으로 변환
      const postData = postResponse.data;
      const extendedPost: ExtendedPost = {
        ...postData,
        author: postData.user ? {
          nickname: postData.user.nickname || postData.user.username,
          profileImage: undefined // 사용자 이미지 사용하지 않음
        } : undefined,
        authorId: postData.user_id,
        institution: typeof postData.institution === 'object' ? postData.institution?.name : postData.institution,
        likedByMe: false, // API에서 제공하지 않으므로 기본값 설정
        dislikedByMe: false, // API에서 제공하지 않으므로 기본값 설정
        isHidden: postData.is_hidden
      };
      
      setPost(extendedPost)

      // 댓글 불러오기 - postId를 숫자로 변환
      const commentsResponse = await postService.getPostComments(Number(postId))
      if (!commentsResponse.success) {
        throw new Error(commentsResponse.error?.message || "댓글을 불러오는데 실패했습니다.")
      }
      
      // API 응답을 프론트엔드 표시용 형식으로 변환
      const extendedComments: ExtendedComment[] = (commentsResponse.data?.items || []).map(comment => ({
        ...comment,
        author: comment.user ? {
          nickname: comment.user.nickname || comment.user.username,
          profileImage: undefined // 사용자 이미지 사용하지 않음
        } : undefined,
        authorId: comment.user_id,
        parentId: comment.parent_id,
        likedByMe: false, // API에서 제공하지 않으므로 기본값 설정
        dislikedByMe: false, // API에서 제공하지 않으므로 기본값 설정
        isHidden: comment.is_hidden
      }));
      
      setComments(extendedComments)
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
      const response = await postService.likePost(post.id)
      if (!response.success) {
        throw new Error(response.error?.message || "좋아요 처리에 실패했습니다.")
      }
      
      // 로컬 상태 업데이트
      setPost((prev) => {
        if (!prev) return null;
        
        // 이미 좋아요 상태인 경우 토글
        const newLikedByMe = !prev.likedByMe;
        
        return {
          ...prev,
          like_count: response.data?.like_count || prev.like_count,
          likedByMe: newLikedByMe,
          // 좋아요를 누르면 싫어요는 취소
          dislikedByMe: newLikedByMe ? false : prev.dislikedByMe
        };
      });
      
      toast.success("좋아요를 표시했습니다.")
    } catch (error) {
      console.error("Failed to like post:", error)
      toast.error(error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.")
    }
  }

  // 게시물 싫어요 처리
  const handleDislike = async () => {
    if (!isAuthenticated || !post) return

    try {
      const response = await postService.dislikePost(post.id)
      if (!response.success) {
        throw new Error(response.error?.message || "싫어요 처리에 실패했습니다.")
      }
      
      // 로컬 상태 업데이트
      setPost((prev) => {
        if (!prev) return null;
        
        // 이미 싫어요 상태인 경우 토글
        const newDislikedByMe = !prev.dislikedByMe;
        
        return {
          ...prev,
          dislike_count: response.data?.dislike_count || prev.dislike_count,
          dislikedByMe: newDislikedByMe,
          // 싫어요를 누르면 좋아요는 취소
          likedByMe: newDislikedByMe ? false : prev.likedByMe
        };
      });
      
      toast.success("싫어요를 표시했습니다.")
    } catch (error) {
      console.error("Failed to dislike post:", error)
      toast.error(error instanceof Error ? error.message : "싫어요 처리에 실패했습니다.")
    }
  }

  // 댓글 좋아요 처리
  const handleCommentLike = async (commentId: ID) => {
    if (!isAuthenticated) return

    try {
      const response = await commentService.likeComment(commentId)
      if (!response.success) {
        throw new Error(response.error?.message || "댓글 좋아요 처리에 실패했습니다.")
      }
      
      // 로컬 상태 업데이트
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id !== commentId) return comment;
          
          // 이미 좋아요 상태인 경우 토글
          const newLikedByMe = !comment.likedByMe;
          
          return {
            ...comment,
            like_count: response.data?.like_count || comment.like_count,
            likedByMe: newLikedByMe,
            // 좋아요를 누르면 싫어요는 취소
            dislikedByMe: newLikedByMe ? false : comment.dislikedByMe
          };
        })
      );
    } catch (error) {
      console.error("Failed to like comment:", error)
      toast.error(error instanceof Error ? error.message : "댓글 좋아요 처리에 실패했습니다.")
    }
  }

  // 댓글 싫어요 처리
  const handleCommentDislike = async (commentId: ID) => {
    if (!isAuthenticated) return

    try {
      const response = await commentService.dislikeComment(commentId)
      if (!response.success) {
        throw new Error(response.error?.message || "댓글 싫어요 처리에 실패했습니다.")
      }
      
      // 로컬 상태 업데이트
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id !== commentId) return comment;
          
          // 이미 싫어요 상태인 경우 토글
          const newDislikedByMe = !comment.dislikedByMe;
          
          return {
            ...comment,
            dislike_count: response.data?.dislike_count || comment.dislike_count,
            dislikedByMe: newDislikedByMe,
            // 싫어요를 누르면 좋아요는 취소
            likedByMe: newDislikedByMe ? false : comment.likedByMe
          };
        })
      );
    } catch (error) {
      console.error("Failed to dislike comment:", error)
      toast.error(error instanceof Error ? error.message : "댓글 싫어요 처리에 실패했습니다.")
    }
  }

  // 댓글 작성 처리
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !post) return

    try {
      const response = await commentService.createComment({
        content: commentText,
        post_id: post.id,
      })
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "댓글 작성에 실패했습니다.")
      }

      // API 응답을 프론트엔드 표시용 형식으로 변환
      const newComment: ExtendedComment = {
        ...response.data,
        author: user ? {
          nickname: user.nickname || user.username,
          profileImage: undefined // 사용자 이미지 사용하지 않음
        } : undefined,
        authorId: user?.id,
        like_count: 0,
        dislike_count: 0,
        likedByMe: false,
        dislikedByMe: false,
        isHidden: false
      };

      setComments((prev) => [newComment, ...prev])
      setCommentText("")
      toast.success("댓글이 작성되었습니다.")
    } catch (error) {
      console.error("Failed to create comment:", error)
      toast.error(error instanceof Error ? error.message : "댓글 작성에 실패했습니다.")
    }
  }

  // 답글 작성 취소
  const handleCancelReply = () => {
    setReplyingToId(null)
    setReplyText("")
  }

  // 답글 작성 시작
  const handleStartReply = (commentId: ID) => {
    setReplyingToId(String(commentId))
    setReplyText("")
  }

  // 답글 제출
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !replyingToId || !post) return

    try {
      const response = await commentService.createComment({
        content: replyText,
        post_id: post.id,
        parent_id: Number(replyingToId),
      })
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "답글 작성에 실패했습니다.")
      }

      // API 응답을 프론트엔드 표시용 형식으로 변환
      const newReply: ExtendedComment = {
        ...response.data,
        author: user ? {
          nickname: user.nickname || user.username,
          profileImage: undefined // 사용자 이미지 사용하지 않음
        } : undefined,
        authorId: user?.id,
        parentId: Number(replyingToId),
        like_count: 0,
        dislike_count: 0,
        likedByMe: false,
        dislikedByMe: false,
        isHidden: false
      };

      // 로컬 상태 업데이트
      setComments((prev) => {
        // 부모 댓글의 replyCount 증가
        const updatedComments = prev.map((comment) =>
          comment.id.toString() === replyingToId ? { ...comment, replyCount: (comment.replyCount || 0) + 1 } : comment,
        )
        // 새 답글 추가
        return [...updatedComments, newReply]
      })

      setReplyingToId(null)
      setReplyText("")
      toast.success("답글이 작성되었습니다.")
    } catch (error) {
      console.error("Failed to create reply:", error)
      toast.error(error instanceof Error ? error.message : "답글 작성에 실패했습니다.")
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
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, isDeleted: true, content: "삭제된 댓글입니다." } : comment,
        ),
      )

      toast.success("댓글이 삭제되었습니다.")
    } catch (error) {
      console.error("Failed to delete comment:", error)
      toast.error(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.")
    }
  }

  // 댓글 수정 시작
  const handleStartEditComment = (comment: ExtendedComment) => {
    setEditingCommentId(String(comment.id))
    setEditCommentText(comment.content)
  }

  // 댓글 수정 취소
  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditCommentText("")
  }

  // 댓글 수정 제출
  const handleSubmitEditComment = async (commentId: ID) => {
    if (!editCommentText.trim()) return

    try {
      const response = await commentService.updateComment(commentId, {
        content: editCommentText,
      })
      
      if (!response.success) {
        throw new Error(response.error?.message || "댓글 수정에 실패했습니다.")
      }

      // 로컬 상태 업데이트
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, content: editCommentText, isEdited: true } : comment,
        ),
      )

      setEditingCommentId(null)
      setEditCommentText("")
      toast.success("댓글이 수정되었습니다.")
    } catch (error) {
      console.error("Failed to update comment:", error)
      toast.error(error instanceof Error ? error.message : "댓글 수정에 실패했습니다.")
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
  const reportingComment = reportingCommentId ? comments.find((comment) => comment.id.toString() === reportingCommentId) : null

  // 댓글이 답글인지 확인
  const isReply = (comment: ExtendedComment) => !!comment.parentId

  // 현재 사용자가 게시물 작성자인지 확인
  const isPostAuthor = user?.id === post?.user_id

  // 현재 사용자가 댓글 작성자인지 확인
  const isCommentAuthor = (comment: ExtendedComment) => user?.id === comment.user_id

  // 기관 이름 추출 함수
  const getInstitutionName = (institution: string | Institution | undefined): string | undefined => {
    if (!institution) return undefined;
    if (typeof institution === 'string') return institution;
    return institution.name;
  }

  // 댓글 목록에서 최상위 댓글과 그에 대한 답글을 구분하여 표시
  const renderComments = () => {
    // 댓글 ID를 기준으로 그룹화
    const commentGroups: { [key: string]: ExtendedComment[] } = {}

    // 최상위 댓글 목록
    const topLevelComments: ExtendedComment[] = []

    // 댓글을 그룹화
    comments.forEach((comment) => {
      if (!comment.parentId) {
        // 최상위 댓글
        topLevelComments.push(comment)
        commentGroups[String(comment.id)] = []
      } else {
        // 답글
        const parentId = String(comment.parentId);
        if (!commentGroups[parentId]) {
          commentGroups[parentId] = []
        }
        commentGroups[parentId].push(comment)
      }
    })

    // 최상위 댓글과 그에 대한 답글을 순서대로 렌더링
    return topLevelComments.map((comment) => (
      <div key={String(comment.id)} className="space-y-2">
        {/* 최상위 댓글 */}
        {renderCommentCard(comment)}

        {/* 답글 목록 */}
        <div className="ml-8 space-y-2">
          {commentGroups[String(comment.id)]?.map((reply) => renderCommentCard(reply))}
        </div>
      </div>
    ))
  }

  // 개별 댓글 카드 렌더링
  const renderCommentCard = (comment: ExtendedComment) => (
    <Card key={String(comment.id)} className={comment.isHidden || comment.isDeleted ? "bg-gray-50" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {isReply(comment) && <CornerDownRight className="h-4 w-4 mr-2 text-muted-foreground" />}
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback>{(comment.author?.nickname || "U")[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{comment.author?.nickname || "익명"}</span>
            {comment.user_id && <span className="ml-1 text-xs text-muted-foreground">({comment.user_id})</span>}
          </div>
          <div className="flex items-center">
            {comment.isEdited && <span className="text-xs text-muted-foreground mr-2">(수정됨)</span>}
            <span className="text-sm text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
          </div>
        </div>

        {comment.isHidden ? (
          <div className="p-2 bg-gray-100 rounded text-muted-foreground italic">
            <AlertTriangle className="h-4 w-4 inline-block mr-2" />
            신고로 인해 숨김 처리된 댓글입니다.
          </div>
        ) : comment.isDeleted ? (
          <div className="p-2 bg-gray-100 rounded text-muted-foreground italic">
            <MessageSquare className="h-4 w-4 inline-block mr-2" />
            삭제된 댓글입니다.
          </div>
        ) : editingCommentId === String(comment.id) ? (
          // 댓글 수정 폼
          <div className="space-y-2">
            <Textarea
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEditComment}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                <span>취소</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSubmitEditComment(comment.id)}
                className="flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                <span>저장</span>
              </Button>
            </div>
          </div>
        ) : (
          <p>{comment.content}</p>
        )}

        {/* 댓글 액션 버튼 (수정 중이 아닐 때만 표시) */}
        {editingCommentId !== String(comment.id) && (
          <div className="flex justify-end mt-2 gap-2">
            {/* 좋아요/싫어요 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${comment.likedByMe ? "text-blue-500" : ""}`}
              onClick={() => handleCommentLike(comment.id)}
              disabled={!isAuthenticated}
            >
              <ThumbsUp className="h-3 w-3" />
              <span className="text-xs">{comment.like_count || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${comment.dislikedByMe ? "text-red-500" : ""}`}
              onClick={() => handleCommentDislike(comment.id)}
              disabled={!isAuthenticated}
            >
              <ThumbsDown className="h-3 w-3" />
              <span className="text-xs">{comment.dislike_count || 0}</span>
            </Button>

            {isAuthenticated && !comment.isHidden && !comment.isDeleted && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-muted-foreground"
                  onClick={() => handleStartReply(comment.id)}
                >
                  <MessageSquare className="h-3 w-3" />
                  <span className="text-xs">답글</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-muted-foreground"
                  onClick={() => handleReportComment(comment.id)}
                >
                  <Flag className="h-3 w-3" />
                  <span className="text-xs">신고</span>
                </Button>

                {isCommentAuthor(comment) && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-blue-500"
                      onClick={() => handleStartEditComment(comment)}
                    >
                      <Edit className="h-3 w-3" />
                      <span className="text-xs">수정</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-red-500"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="text-xs">삭제</span>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* 답글 작성 폼 */}
        {replyingToId === String(comment.id) && (
          <div className="mt-4 pl-4 border-l-2 border-gray-200">
            <form onSubmit={handleSubmitReply} className="space-y-2">
              <Textarea
                placeholder="답글을 작성해주세요"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleCancelReply}>
                  취소
                </Button>
                <Button type="submit" size="sm">
                  답글 작성
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )

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

  // 기관 이름 추출
  const institutionName = getInstitutionName(post.institution);

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>목록으로 돌아가기</span>
        </Link>
      </div>

      {post.isHidden && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            이 게시물은 신고가 누적되어 숨김 처리되었습니다. 관리자 검토 후 복원될 수 있습니다.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {institutionName && (
                  <Badge className={institutionColors[institutionName] || "bg-gray-100 text-gray-800"} variant="outline">
                    {institutionName}
                  </Badge>
                )}
                <h2 className="text-2xl font-bold">{post.title}</h2>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>조회 {post.view_count}</span>
                <span className="flex items-center">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {post.like_count}
                </span>
                <span className="flex items-center">
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  {post.dislike_count || 0}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>{(post.author?.nickname || "U")[0]}</AvatarFallback>
                </Avatar>
                <span>{post.author?.nickname || "익명"}</span>
                {post.user_id && <span className="ml-1 text-xs">({post.user_id})</span>}
              </div>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="prose max-w-none">
            {post.content?.split("\n").map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t py-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-1 ${post.likedByMe ? "text-blue-500" : ""}`}
              disabled={!isAuthenticated}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>좋아요 {post.like_count}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDislike}
              className={`flex items-center gap-1 ${post.dislikedByMe ? "text-red-500" : ""}`}
              disabled={!isAuthenticated}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>싫어요 {post.dislike_count || 0}</span>
            </Button>
            {!post.isNotice && (
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span>공유</span>
              </Button>
            )}
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowReportForm(true)}
              >
                <Flag className="h-4 w-4" />
                <span>신고</span>
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            {/* 게시물 작성자인 경우 수정/삭제 버튼 표시 */}
            {isPostAuthor && (
              <>
                <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleEditPost}>
                  <Edit className="h-4 w-4" />
                  <span>수정</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-red-500"
                  onClick={handleShowDeleteDialog}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>삭제</span>
                </Button>
              </>
            )}
            {!post.isNotice && institutionName && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/institution/${encodeURIComponent(institutionName)}`}>목록</Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* 게시물 신고 폼 */}
      {showReportForm && (
        <div className="mt-6">
          <ReportForm postId={post.id} postTitle={post.title} onClose={() => setShowReportForm(false)} />
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">댓글 {comments.length}개</h3>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleAddComment}>
              <Textarea
                placeholder="댓글을 작성해주세요"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mb-4"
                disabled={!isAuthenticated}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={!isAuthenticated}>
                  댓글 작성
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 댓글 신고 폼 */}
        {reportingComment && reportingCommentId && (
          <div className="mb-6">
            <CommentReportForm
              commentId={Number(reportingCommentId)}
              postId={post.id}
              commentAuthor={reportingComment.author?.nickname || "익명"}
              commentContent={reportingComment.content}
              onClose={handleCloseCommentReport}
            />
          </div>
        )}

        {comments.length > 0 ? (
          <div className="space-y-4">{renderComments()}</div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
            </CardContent>
          </Card>
        )}
      </div>

      {/* 게시물 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시물 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}