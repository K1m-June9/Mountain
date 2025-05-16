// src/lib/types/comment.ts

import { ID, Timestamps, BaseFilter } from './common';
import { User } from './user';

/**
 * 댓글 관련 타입 정의
 */

/**
 * 댓글 기본 정보
 */
export interface Comment extends Timestamps {
  id: ID;
  content: string;
  user_id: ID;
  post_id: ID;
  parent_id?: ID;
  is_hidden: boolean;
}

/**
 * 댓글 + 사용자 정보
 */
export interface CommentWithUser extends Comment {
  user: User;
  like_count: number;
  dislike_count: number;
}

/**
 * 댓글 + 답글 정보
 */
export interface CommentWithReplies extends CommentWithUser {
  replies: CommentWithUser[];
}

/**
 * 댓글 생성 요청
 */
export interface CommentCreateRequest {
  content: string;
  post_id: ID;
  parent_id?: ID;
}

/**
 * 댓글 업데이트 요청
 */
export interface CommentUpdateRequest {
  content?: string;
  is_hidden?: boolean;
}

/**
 * 댓글 필터
 */
export interface CommentFilter extends BaseFilter {
  post_id?: ID;
  user_id?: ID;
  parent_id?: ID;
}