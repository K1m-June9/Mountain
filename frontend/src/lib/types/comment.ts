// src/lib/types/comment.ts

import { ID, Timestamps, ReactionType, ReportStatus } from './common';
import { User } from './user';

/**
 * 댓글 기본 정보 (백엔드 Comment 스키마와 일치)
 */
export interface Comment {
  id: ID;
  content: string;
  user_id: ID;
  post_id: ID;
  parent_id: ID | null;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 댓글 생성 요청 (백엔드 CommentCreate 스키마와 일치)
 */
export interface CommentCreate {
  content: string;
  post_id: ID;
  parent_id?: ID | null;
}

/**
 * 댓글 업데이트 요청 (백엔드 CommentUpdate 스키마와 일치)
 */
export interface CommentUpdate {
  content?: string;
  is_hidden?: boolean;
}

/**
 * 사용자 정보가 포함된 댓글 (백엔드 CommentWithUser 스키마와 일치)
 */
export interface CommentWithUser extends Comment {
  user: User;
  like_count: number;
  dislike_count: number;
}

/**
 * 답글이 포함된 댓글 (백엔드 CommentWithReplies 스키마와 일치)
 */
export interface CommentWithReplies extends CommentWithUser {
  replies: CommentWithUser[];
}

/**
 * 댓글 반응 (좋아요/싫어요) 정보
 */
export interface Reaction {
  id: ID;
  user_id: ID;
  comment_id: ID | null;
  post_id: ID | null;
  type: ReactionType;
  created_at: string;
}

/**
 * 댓글 신고 생성 요청
 */
export interface ReportCreate {
  reason: string;
  description?: string;
}

/**
 * 댓글 신고 정보
 */
export interface Report {
  id: ID;
  reporter_id: ID;
  comment_id: ID | null;
  post_id: ID | null;
  reason: string;
  description?: string;
  status: ReportStatus;
  reviewed_by: ID | null;
  created_at: string;
  updated_at: string;
}

/**
 * 프론트엔드 UI 상태를 위한 확장 타입
 */
export interface CommentWithUIState extends CommentWithUser {
  isEditing?: boolean;
  isReplying?: boolean;
  isSubmitting?: boolean;
  likedByMe?: boolean;
  dislikedByMe?: boolean;
  showReplies?: boolean;
  newReplyContent?: string;
  editContent?: string;
}

/**
 * 댓글 목록 필터링 옵션
 */
export interface CommentFilter {
  skip?: number;
  limit?: number;
}