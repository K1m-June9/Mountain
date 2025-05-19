// src/lib/types/admin/report.ts

import { ID, Timestamps, ReportStatus, BaseFilter } from '../common';
import { Report, ReportReason } from '../report';
import { Post } from '../post';
import { Comment } from '../comment';
import { User } from '../user';

/**
 * 관리자용 신고 관련 타입 정의
 */

/**
 * 게시물 신고 정보 (관리자용)
 */
export interface PostReport extends Report {
  post: Post;
  reporter?: User;
}

/**
 * 댓글 신고 정보 (관리자용)
 */
export interface CommentReport extends Report {
  comment: Comment;
  reporter?: User;
}

/**
 * 신고 설정
 */
export interface ReportSettings {
  autoHideThreshold: number;
  requireReasonForReport: boolean;
  allowAnonymousReports: boolean;
  notifyAdminsOnReport: boolean;
}

/**
 * 신고 설정 업데이트 요청
 */
export interface ReportSettingsUpdateRequest {
  autoHideThreshold?: number;
  requireReasonForReport?: boolean;
  allowAnonymousReports?: boolean;
  notifyAdminsOnReport?: boolean;
}

/**
 * 관리자용 신고 필터
 */
export interface AdminReportFilter extends BaseFilter {
  status?: ReportStatus;
  reporter_id?: ID;
  reviewed_by?: ID;
  type?: 'post' | 'comment';
  reason?: ReportReason;
  from_date?: string;
  to_date?: string;
}

/**
 * 신고 처리 결과
 */
export interface ReportActionResult {
  success: boolean;
  report: Report;
  action: 'approve' | 'reject' | 'hide' | 'unhide';
  target_type: 'post' | 'comment';
  target_id: ID;
}

/**
 * 신고 통계
 */
export interface ReportStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  rejected: number;
  byReason: Record<ReportReason, number>;
}

/**
 * 신고 대시보드 데이터
 */
export interface ReportDashboard {
  stats: ReportStats;
  recentReports: Report[];
  topReporters: {
    user_id: ID;
    username: string;
    report_count: number;
  }[];
}

/**
 * 신고 검토 요청
 */
export interface ReviewReportRequest {
  status: 'reviewed' | 'resolved' | 'rejected';
  hide_content?: boolean;
  send_notification?: boolean;
  note?: string;
}