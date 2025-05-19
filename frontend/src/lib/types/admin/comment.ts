// src/lib/types/admin/comment.ts

import { ID, Timestamps, BaseFilter, PaginatedData } from '../common';
import { Comment, CommentWithUser } from '../comment';

/**
 * 관리자용 댓글 필터링 옵션
 */
export interface AdminCommentFilter extends BaseFilter {
  status?: 'all' | 'visible' | 'hidden';
  user_id?: ID;
  post_id?: ID;
  date_from?: string;
  date_to?: string;
}

/**
 * 관리자용 댓글 상세 정보
 * 기본 댓글 정보에 관리 관련 추가 정보를 포함
 */
export interface AdminCommentDetail extends CommentWithUser {
  report_count: number;
  is_hidden: boolean;
  post_title: string;
  post_slug?: string;
}

/**
 * 관리자용 댓글 목록 응답
 */
export interface AdminCommentsResponse extends PaginatedData<AdminCommentDetail> {
  hidden_count: number;
  reported_count: number;
}

/**
 * 댓글 숨김 상태 변경 요청
 */
export interface CommentVisibilityUpdateRequest {
  is_hidden: boolean;
  reason?: string;
}

/**
 * 댓글 일괄 처리 요청
 */
export interface BulkCommentActionRequest {
  comment_ids: ID[];
  action: 'hide' | 'unhide' | 'delete';
  reason?: string;
}

/**
 * 댓글 일괄 처리 응답
 */
export interface BulkCommentActionResponse {
  success: boolean;
  processed_count: number;
  failed_ids?: ID[];
  message?: string;
}

/**
 * 댓글 통계 정보
 */
export interface CommentStats {
  total_count: number;
  hidden_count: number;
  reported_count: number;
  today_count: number;
  this_week_count: number;
  this_month_count: number;
}

/**
 * 댓글 활동 로그
 */
export interface CommentActivityLog extends Timestamps {
  id: ID;
  comment_id: ID;
  user_id: ID;
  username: string;
  action: 'create' | 'update' | 'hide' | 'unhide' | 'delete';
  description: string;
  ip_address?: string;
}

/**
 * 댓글 활동 로그 필터
 */
export interface CommentActivityLogFilter extends BaseFilter {
  comment_id?: ID;
  user_id?: ID;
  action?: string;
}