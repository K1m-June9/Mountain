// src/lib/types/admin/post.ts

import { ID, Timestamps, BaseFilter } from '../common';
import { Post, PostWithDetails } from '../post';
import { User } from '../user';
import { Category } from '../category';
import { Institution } from '../institution';

/**
 * 관리자용 게시물 필터 타입
 */
export interface AdminPostFilter extends BaseFilter {
  status?: 'all' | 'visible' | 'hidden';
  user_id?: ID;
  institution_id?: ID;
  category_id?: ID;
  date_from?: string;
  date_to?: string;
  reported?: boolean;
}

/**
 * 관리자용 게시물 상세 정보 타입
 */
export interface AdminPostDetail extends PostWithDetails {
  report_count: number;
  last_reported_at?: string;
  hidden_by?: ID;
  hidden_at?: string;
  hidden_reason?: string;
}

/**
 * 게시물 숨김 요청 타입
 */
export interface PostHideRequest {
  reason: string;
  notify_user?: boolean;
  notification_message?: string;
}

/**
 * 게시물 숨김 해제 요청 타입
 */
export interface PostUnhideRequest {
  notify_user?: boolean;
  notification_message?: string;
}

/**
 * 게시물 삭제 요청 타입
 */
export interface PostDeleteRequest {
  reason: string;
  notify_user?: boolean;
  notification_message?: string;
}

/**
 * 게시물 일괄 작업 요청 타입
 */
export interface PostBulkActionRequest {
  post_ids: ID[];
  action: 'hide' | 'unhide' | 'delete';
  reason?: string;
  notify_users?: boolean;
  notification_message?: string;
}

/**
 * 게시물 일괄 작업 응답 타입
 */
export interface PostBulkActionResponse {
  success: boolean;
  processed_count: number;
  failed_ids?: ID[];
  error_message?: string;
}

/**
 * 게시물 통계 타입
 */
export interface PostStats {
  total_count: number;
  hidden_count: number;
  reported_count: number;
  by_category: Record<ID, number>;
  by_institution: Record<ID, number>;
  by_date: Record<string, number>; // 날짜별 게시물 수 (YYYY-MM-DD 형식)
}

/**
 * 관리자 대시보드용 최근 게시물 타입
 */
export interface RecentPost {
  id: ID;
  title: string;
  user: {
    id: ID;
    username: string;
  };
  created_at: string;
  is_hidden: boolean;
  report_count: number;
  comment_count: number;
}

/**
 * 관리자 대시보드용 인기 게시물 타입
 */
export interface TrendingPost extends RecentPost {
  view_count: number;
  like_count: number;
}

/**
 * 게시물 관리 로그 타입
 */
export interface PostModLog extends Timestamps {
  id: ID;
  post_id: ID;
  admin_id: ID;
  admin_username: string;
  action: 'hide' | 'unhide' | 'delete' | 'restore';
  reason?: string;
  ip_address?: string;
}

/**
 * 게시물 관리 로그 필터 타입
 */
export interface PostModLogFilter extends BaseFilter {
  post_id?: ID;
  admin_id?: ID;
  action?: string;
  date_from?: string;
  date_to?: string;
}

/**
 * 게시물 내보내기 옵션 타입
 */
export interface PostExportOptions {
  format: 'csv' | 'json' | 'excel';
  include_comments: boolean;
  include_user_info: boolean;
  filter?: AdminPostFilter;
}