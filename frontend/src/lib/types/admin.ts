// src/lib/types/admin.ts
//==========================================================================
//마무리되면 파일 삭제 예정
//lib/types/admin/으로 분리 이동
//==========================================================================
import { ID, Timestamps, BaseFilter, ReportStatus, Role } from './common';
import { User } from './user';
import { Post } from './post';
import { Comment } from './comment';
import { Report } from './report';
import { Institution } from './institution';
import { Notice } from './notice';

/**
 * 관리자 관련 타입 정의
 */

/**
 * 대시보드 통계 정보
 */
export interface DashboardStats {
  userCount: number;
  postCount: number;
  commentCount: number;
  reportCount: number;
  activeUserCount: number;
  newUserCount: number;
  newPostCount: number;
  newCommentCount: number;
}

/**
 * 사이트 설정
 */
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
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
 * 알림 설정
 */
export interface NotificationSettings {
  enableEmailNotifications: boolean;
  enableBrowserNotifications: boolean;
  adminEmailNotifications: boolean;
  notifyOnNewUser: boolean;
  notifyOnNewReport: boolean;
}

// /**
//  * 사용자 상태 업데이트 요청
//  */
// export interface UserStatusUpdateRequest {
//   status: 'active' | 'inactive' | 'suspended';
//   suspendedUntil?: string | null;
//   reason?: string;
// }

/**
 * 사용자 역할 업데이트 요청
 */
export interface UserRoleUpdateRequest {
  role: Role;
}

/**
 * 설정 업데이트 요청
 */
export interface SettingUpdateRequest {
  value: string;
  description?: string;
}

/**
 * 활동 로그
 */
export interface ActivityLog extends Timestamps {
  id: ID;
  user_id: ID;
  username: string;
  action_type: string;
  description: string;
  ip_address: string;
}

/**
 * 활동 로그 필터
 */
export interface ActivityLogFilter extends BaseFilter {
  user_id?: ID;
  action_type?: string;
}

/**
 * 게시물 신고 정보
 */
export interface PostReport extends Report {
  post: Post;
}

/**
 * 댓글 신고 정보
 */
export interface CommentReport extends Report {
  comment: Comment;
}

// src/lib/types/admin.ts에 추가할 내용

/**
 * 사용자 활동 타입
 */
export interface UserActivity extends Timestamps {
  id: ID;
  user_id: ID;
  type: "post" | "comment" | "like" | "dislike" | "report";
  title?: string;
  content?: string;
  target_id?: ID;
  target_type?: string;
}
//===========================================================================
//for user-detail.tsx
/**
 * 사용자 상태 타입
 */
export type UserStatus = "active" | "inactive" | "suspended";

/**
 * 관리자 화면용 사용자 상세 정보 타입
 */
export interface AdminUserDetail {
  id: ID;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  suspended_until?: string;
  created_at: string;
  updated_at: string;
  post_count: number;
  comment_count: number;
  like_count: number;
  dislike_count: number;
  last_active?: string;
}

/**
 * 사용자 활동 타입
 */
export interface UserActivity {
  id: ID;
  user_id: ID;
  action_type: string;
  description: string;
  ip_address?: string;
  created_at: string;
}

/**
 * 제재 이력 타입
 */
export interface RestrictionHistory {
  id: ID;
  user_id: ID;
  type: "suspend" | "unsuspend";
  reason: string;
  duration?: number;
  suspended_until?: string;
  created_by: ID;
  created_at: string;
}

/**
 * 사용자 상태 업데이트 요청
 */
export interface UserStatusUpdateRequest {
  status: UserStatus;
  suspended_until?: string | null;
  reason: string;
  duration?: number | null;
}

/**
 * 사용자 역할 업데이트 요청
 */
export interface UserRoleUpdateRequest {
  role: Role;
}

/**
 * 사용자 활동 응답
 */
export interface UserActivitiesResponse {
  activities: UserActivity[];
  total: number;
}

//===========================================================================

// src/lib/types/admin.ts에 추가
/**
 * 확장된 대시보드 통계 정보
 */
export interface ExtendedDashboardStats extends DashboardStats {
  pendingReportCount: number;
  hiddenPostCount: number;
  hiddenCommentCount: number;
}

/**
 * 기관 정보 업데이트 필요 여부
 */
export interface InstitutionsUpdateStatus {
  needsUpdate: boolean;
  incompleteCount: number;
  outdatedCount: number;
}