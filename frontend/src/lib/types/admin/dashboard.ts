// src/lib/types/admin/dashboard.ts

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
  pendingReportCount: number;
  hiddenPostCount: number;
  hiddenCommentCount: number;
}
//-----------------------------------------------------------------------------------------------------
//  현재는 DashboardStats만 사용.
//  아래는 추가 확장용
//-----------------------------------------------------------------------------------------------------
/**
 * 확장된 대시보드 통계 정보
 */
export interface ExtendedDashboardStats extends DashboardStats {
  // 추가적인 통계 정보가 필요한 경우 여기에 추가
}

/**
 * 대시보드 기간별 필터 옵션
 */
export type DashboardPeriod = 'today' | 'week' | 'month' | 'year' | 'all';

/**
 * 대시보드 필터 옵션
 */
export interface DashboardFilter {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
}

/**
 * 대시보드 활동 요약
 */
export interface ActivitySummary {
  newUsers: number;
  newPosts: number;
  newComments: number;
  newReports: number;
  resolvedReports: number;
}