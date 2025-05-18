import type { PostWithDetails } from "@/lib/types/post"
import type { ID } from "@/lib/types/common"
import type { Institution } from "@/lib/types/institution"

// 프론트엔드 표시용 확장 타입
export interface ExtendedPost extends Omit<PostWithDetails, "institution"> {
  author?: { nickname: string; profileImage?: string }
  authorId?: ID
  institution?: string | Institution
  likedByMe?: boolean
  dislikedByMe?: boolean
  isNotice?: boolean
  isHidden?: boolean
}

// 백엔드 응답 구조에 맞춘 댓글 타입
export interface ExtendedComment {
  id: ID
  content: string
  user_id: ID
  post_id: ID
  parent_id: ID | null | undefined  // null과 undefined 모두 허용
  is_hidden: boolean
  created_at: string
  updated_at: string
  user?: any
  author?: { nickname: string; profileImage?: string }
  authorId?: ID
  like_count: number
  dislike_count: number
  likedByMe?: boolean
  dislikedByMe?: boolean
  isEdited?: boolean
  isDeleted?: boolean
  isHidden?: boolean
  replies?: ExtendedComment[]
}