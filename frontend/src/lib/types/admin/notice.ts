// src/lib/types/admin/notice.ts

import { ID, Timestamps, BaseFilter } from '../common';
import { Notice, NoticeCreateRequest, NoticeUpdateRequest } from '../notice';
import { User } from '../user';

/**
 * 관리자용 공지사항 관련 타입 정의
 */

/**
 * 관리자용 확장된 공지사항 정보
 */
export interface AdminNotice extends Notice {
  is_pinned?: boolean;
  view_count?: number;
  is_hidden?: boolean;
}

/**
 * 관리자용 공지사항 + 사용자 정보
 */
export interface AdminNoticeWithUser extends AdminNotice {
  user: User;
}

/**
 * 관리자용 공지사항 필터
 */
export interface AdminNoticeFilter extends BaseFilter {
  includeHidden?: boolean;
  isPinned?: boolean;
  isImportant?: boolean;
  userId?: ID;
  startDate?: string;
  endDate?: string;
}

/**
 * 관리자용 공지사항 통계
 */
export interface NoticeStats {
  totalCount: number;
  hiddenCount: number;
  pinnedCount: number;
  importantCount: number;
  viewCount: number;
  averageViewCount: number;
}

/**
 * 공지사항 상태 업데이트 요청 (숨김/표시)
 */
export interface NoticeVisibilityUpdateRequest {
  is_hidden: boolean;
}

/**
 * 공지사항 고정 상태 업데이트 요청
 */
export interface NoticePinUpdateRequest {
  is_pinned: boolean;
}

/**
 * 공지사항 중요도 업데이트 요청
 */
export interface NoticeImportanceUpdateRequest {
  is_important: boolean;
}

/**
 * 관리자용 공지사항 생성 요청 (기본 요청 확장)
 */
export interface AdminNoticeCreateRequest extends NoticeCreateRequest {
  is_pinned?: boolean;
  is_hidden?: boolean;
}

/**
 * 관리자용 공지사항 업데이트 요청 (기본 요청 확장)
 */
export interface AdminNoticeUpdateRequest extends NoticeUpdateRequest {
  is_pinned?: boolean;
}

/**
 * 공지사항 일괄 작업 요청
 */
export interface NoticeBulkActionRequest {
  notice_ids: ID[];
  action: 'hide' | 'unhide' | 'pin' | 'unpin' | 'delete';
}

/**
 * 공지사항 일괄 작업 응답
 */
export interface NoticeBulkActionResponse {
  success: boolean;
  processed_count: number;
  failed_ids?: ID[];
}