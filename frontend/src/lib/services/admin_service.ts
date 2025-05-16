// src/lib/services/admin_service.ts

import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { 
  DashboardStats, 
  SiteSettings, 
  ReportSettings, 
  NotificationSettings,
  UserStatusUpdateRequest,
  UserRoleUpdateRequest,
  SettingUpdateRequest,
  ActivityLog,
  ActivityLogFilter,
  PostReport,
  CommentReport,
  AdminUserDetail, 
  RestrictionHistory, 
  UserActivitiesResponse,
  ExtendedDashboardStats,
  InstitutionsUpdateStatus
} from "../types/admin";
import type { User } from "../types/user";
import type { Report } from "../types/report";
import type { Post } from "../types/post";
import type { Comment } from "../types/comment";
import type { Institution } from "../types/institution";
import type { Notice, NoticeCreateRequest, NoticeUpdateRequest } from "../types/notice";
import type { PaginatedData, PaginationParams, ID, Role } from "../types/common";
/**
 * 관리자 관련 서비스 함수들을 제공하는 클래스
 */
export class AdminService {
  /**
   * 관리자 대시보드 통계 가져오기
   * @returns 대시보드 통계 정보
   */
  async getDashboardStats(): Promise<ApiResult<DashboardStats>> {
    return await api.get<DashboardStats>("/admin/stats");
  }

  /**
   * 신고 목록 가져오기
   * @param params 필터링 옵션
   * @returns 페이지네이션된 신고 목록
   */
  async getReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: "post" | "comment";
  }): Promise<ApiResult<PaginatedData<Report>>> {
    return await api.get<PaginatedData<Report>>("/admin/reports", params);
  }

  /**
   * 게시물 신고 목록 가져오기
   * @param params 필터링 옵션
   * @returns 페이지네이션된 게시물 신고 목록
   */
  async getPostReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResult<PaginatedData<PostReport>>> {
    return await api.get<PaginatedData<PostReport>>("/admin/reports", { 
      ...params, 
      type: "post" 
    });
  }

  /**
   * 댓글 신고 목록 가져오기
   * @param params 필터링 옵션
   * @returns 페이지네이션된 댓글 신고 목록
   */
  async getCommentReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResult<PaginatedData<CommentReport>>> {
    return await api.get<PaginatedData<CommentReport>>("/admin/reports", { 
      ...params, 
      type: "comment" 
    });
  }

  /**
   * 신고 승인
   * @param reportId 신고 ID
   * @param type 신고 타입
   * @returns 업데이트된 신고 정보
   */
  async approveReport(reportId: ID, type?: "post" | "comment"): Promise<ApiResult<Report>> {
    return await api.put<Report>(`/admin/reports/${reportId}/approve`, { type });
  }

  /**
   * 신고 거부
   * @param reportId 신고 ID
   * @param type 신고 타입
   * @returns 업데이트된 신고 정보
   */
  async rejectReport(reportId: ID, type?: "post" | "comment"): Promise<ApiResult<Report>> {
    return await api.put<Report>(`/admin/reports/${reportId}/reject`, { type });
  }

  /**
   * 게시물 숨김 처리
   * @param postId 게시물 ID
   * @returns 업데이트된 게시물 정보
   */
  async hidePost(postId: ID): Promise<ApiResult<Post>> {
    return await api.put<Post>(`/admin/posts/${postId}/hide`);
  }

  /**
   * 게시물 숨김 해제
   * @param postId 게시물 ID
   * @returns 업데이트된 게시물 정보
   */
  async unhidePost(postId: ID): Promise<ApiResult<Post>> {
    return await api.put<Post>(`/admin/posts/${postId}/unhide`);
  }

  /**
   * 댓글 숨김 처리
   * @param commentId 댓글 ID
   * @returns 업데이트된 댓글 정보
   */
  async hideComment(commentId: ID): Promise<ApiResult<Comment>> {
    return await api.put<Comment>(`/admin/comments/${commentId}/hide`);
  }

  /**
   * 댓글 숨김 해제
   * @param commentId 댓글 ID
   * @returns 업데이트된 댓글 정보
   */
  async unhideComment(commentId: ID): Promise<ApiResult<Comment>> {
    return await api.put<Comment>(`/admin/comments/${commentId}/unhide`);
  }

  /**
   * 기관 목록 가져오기
   * @param params 필터링 옵션
   * @returns 페이지네이션된 기관 목록
   */
  async getInstitutions(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResult<PaginatedData<Institution>>> {
    return await api.get<PaginatedData<Institution>>("/admin/institutions", params);
  }

  /**
   * 기관 추가
   * @param data 기관 데이터
   * @returns 생성된 기관 정보
   */
  async addInstitution(data: { 
    name: string; 
    description?: string; 
    color?: string;
  }): Promise<ApiResult<Institution>> {
    return await api.post<Institution>("/admin/institutions", data);
  }

  /**
   * 기관 수정
   * @param institutionId 기관 ID
   * @param data 업데이트할 기관 데이터
   * @returns 업데이트된 기관 정보
   */
  async updateInstitution(
    institutionId: ID,
    data: { name?: string; description?: string; color?: string; }
  ): Promise<ApiResult<Institution>> {
    return await api.put<Institution>(`/admin/institutions/${institutionId}`, data);
  }

  /**
   * 기관 삭제
   * @param institutionId 기관 ID
   * @returns 삭제 결과
   */
  async deleteInstitution(institutionId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>(`/admin/institutions/${institutionId}`);
  }

  /**
   * 댓글 목록 가져오기
   * @param params 필터링 옵션
   * @returns 페이지네이션된 댓글 목록
   */
  async getComments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResult<PaginatedData<Comment>>> {
    return await api.get<PaginatedData<Comment>>("/admin/comments", params);
  }

  /**
   * 모든 댓글 가져오기 (관리자용)
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @param status 상태 필터
   * @param search 검색어
   * @returns 댓글 목록 및 페이지네이션 정보
   */
  async getAllComments(
    page: number = 1,
    limit: number = 10,
    status: string = "all",
    search: string = ""
  ): Promise<ApiResult<{
    comments: Comment[];
    totalPages: number;
    totalItems: number;
  }>> {
    const params = {
      page,
      limit,
      ...(status && status !== "all" ? { status } : {}),
      ...(search ? { search } : {})
    };

    return await api.get<{
      comments: Comment[];
      totalPages: number;
      totalItems: number;
    }>("/admin/comments", params);
  }

  /**
   * 댓글 삭제
   * @param commentId 댓글 ID
   * @returns 삭제 결과
   */
  async deleteComment(commentId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>(`/admin/comments/${commentId}`);
  }

  /**
   * 게시물 삭제
   * @param postId 게시물 ID
   * @returns 삭제 결과
   */
  async deletePost(postId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>(`/admin/posts/${postId}`);
  }

  /**
   * 사용자 목록 가져오기
   * @param params 필터링 옵션
   * @returns 페이지네이션된 사용자 목록
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResult<PaginatedData<User>>> {
    return await api.get<PaginatedData<User>>("/admin/users", params);
  }

  /**
   * 사용자 상세 정보 가져오기
   * @param userId 사용자 ID
   * @returns 사용자 상세 정보
   */
  async getUserDetail(userId: ID): Promise<ApiResult<User>> {
    return await api.get<User>(`/admin/users/${userId}`);
  }

  // /**
  //  * 사용자 상태 변경
  //  * @param userId 사용자 ID
  //  * @param data 상태 변경 데이터
  //  * @returns 업데이트된 사용자 정보
  //  */
  // async updateUserStatus(
  //   userId: ID,
  //   data: UserStatusUpdateRequest
  // ): Promise<ApiResult<User>> {
  //   return await api.put<User>(`/admin/users/${userId}/status`, data);
  // }

  // /**
  //  * 사용자 역할 변경
  //  * @param userId 사용자 ID
  //  * @param role 새 역할
  //  * @returns 업데이트된 사용자 정보
  //  */
  // async updateUserRole(userId: ID, role: "user" | "moderator" | "admin"): Promise<ApiResult<User>> {
  //   return await api.put<User>(`/admin/users/${userId}/role`, { role });
  // }

  /**
   * 사이트 설정 가져오기
   * @returns 사이트 설정 정보
   */
  async getSiteSettings(): Promise<ApiResult<SiteSettings>> {
    return await api.get<SiteSettings>("/admin/settings/site");
  }

  /**
   * 사이트 설정 업데이트
   * @param data 업데이트할 설정 데이터
   * @returns 업데이트된 설정 정보
   */
  async updateSiteSettings(data: Partial<SiteSettings>): Promise<ApiResult<SiteSettings>> {
    return await api.put<SiteSettings>("/admin/settings/site", data);
  }

  /**
   * 신고 설정 가져오기
   * @returns 신고 설정 정보
   */
  async getReportSettings(): Promise<ApiResult<ReportSettings>> {
    return await api.get<ReportSettings>("/admin/settings/report");
  }

  /**
   * 신고 설정 업데이트
   * @param data 업데이트할 설정 데이터
   * @returns 업데이트된 설정 정보
   */
  async updateReportSettings(data: Partial<ReportSettings>): Promise<ApiResult<ReportSettings>> {
    return await api.put<ReportSettings>("/admin/settings/report", data);
  }

  /**
   * 알림 설정 가져오기
   * @returns 알림 설정 정보
   */
  async getNotificationSettings(): Promise<ApiResult<NotificationSettings>> {
    return await api.get<NotificationSettings>("/admin/settings/notification");
  }

  /**
   * 알림 설정 업데이트
   * @param data 업데이트할 설정 데이터
   * @returns 업데이트된 설정 정보
   */
  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<ApiResult<NotificationSettings>> {
    return await api.put<NotificationSettings>("/admin/settings/notification", data);
  }

  /**
   * 공지사항 목록 가져오기
   * @param params 필터링 옵션
   * @returns 페이지네이션된 공지사항 목록
   */
  async getNotices(params?: { 
    page?: number; 
    limit?: number; 
    includeHidden?: boolean;
  }): Promise<ApiResult<PaginatedData<Notice>>> {
    return await api.get<PaginatedData<Notice>>("/admin/notices", params);
  }

  /**
   * 공지사항 추가
   * @param noticeData 공지사항 데이터
   * @returns 생성된 공지사항 정보
   */
  async addNotice(noticeData: NoticeCreateRequest): Promise<ApiResult<Notice>> {
    return await api.post<Notice>("/admin/notices", noticeData);
  }

  /**
   * 공지사항 수정
   * @param noticeId 공지사항 ID
   * @param noticeData 업데이트할 공지사항 데이터
   * @returns 업데이트된 공지사항 정보
   */
  async updateNotice(noticeId: ID, noticeData: NoticeUpdateRequest): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/admin/notices/${noticeId}`, noticeData);
  }

  /**
   * 공지사항 삭제
   * @param noticeId 공지사항 ID
   * @returns 삭제 결과
   */
  async deleteNotice(noticeId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>(`/admin/notices/${noticeId}`);
  }

  /**
   * 공지사항 숨김 처리
   * @param noticeId 공지사항 ID
   * @returns 업데이트된 공지사항 정보
   */
  async hideNotice(noticeId: ID): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/admin/notices/${noticeId}/hide`);
  }

  /**
   * 공지사항 숨김 해제
   * @param noticeId 공지사항 ID
   * @returns 업데이트된 공지사항 정보
   */
  async unhideNotice(noticeId: ID): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/admin/notices/${noticeId}/unhide`);
  }

  /**
   * 공지사항 고정 처리
   * @param noticeId 공지사항 ID
   * @returns 업데이트된 공지사항 정보
   */
  async pinNotice(noticeId: ID): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/admin/notices/${noticeId}/pin`);
  }

  /**
   * 공지사항 고정 해제
   * @param noticeId 공지사항 ID
   * @returns 업데이트된 공지사항 정보
   */
  async unpinNotice(noticeId: ID): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/admin/notices/${noticeId}/unpin`);
  }

  /**
   * 설정 가져오기
   * @returns 모든 설정 정보
   */
  async getSettings(): Promise<ApiResult<any>> {
    return await api.get<any>("/admin/settings");
  }

  /**
   * 설정 업데이트
   * @param section 설정 섹션
   * @param data 업데이트할 설정 데이터
   * @returns 업데이트된 설정 정보
   */
  async updateSettings(section: string, data: any): Promise<ApiResult<any>> {
    return await api.put<any>(`/admin/settings/${section}`, data);
  }

  /**
   * 설정 초기화
   * @param section 설정 섹션
   * @returns 초기화된 설정 정보
   */
  async resetSettings(section: string): Promise<ApiResult<any>> {
    return await api.post<any>(`/admin/settings/${section}/reset`);
  }

  /**
   * 활동 로그 조회
   * @param params 필터링 옵션
   * @returns 페이지네이션된 활동 로그 목록
   */
  async getActivityLogs(params?: ActivityLogFilter): Promise<ApiResult<ActivityLog[]>> {
    return await api.get<ActivityLog[]>("/admin/activity-logs", params);
  }
  //====================================================================================
  /**
   * 관리자용 사용자 상세 정보 조회
   * @param userId 사용자 ID
   * @returns 사용자 상세 정보
   */
  async getUserById(userId: ID): Promise<ApiResult<AdminUserDetail>> {
    return await api.get<AdminUserDetail>(`/admin/users/${userId}`);
  }

  /**
   * 사용자의 제재 이력 조회
   * @param userId 사용자 ID
   * @returns 제재 이력 목록
   */
  async getUserRestrictionHistory(userId: ID): Promise<ApiResult<RestrictionHistory[]>> {
    return await api.get<RestrictionHistory[]>(`/admin/users/${userId}/restrictions`);
  }

  /**
   * 사용자의 활동 내역 조회
   * @param userId 사용자 ID
   * @param skip 건너뛸 항목 수
   * @param limit 가져올 항목 수
   * @param actionType 활동 유형 필터
   * @returns 활동 내역 및 페이지네이션 정보
   */
  async getUserActivities(
    userId: ID, 
    skip: number = 0, 
    limit: number = 50, 
    actionType?: string
  ): Promise<ApiResult<UserActivitiesResponse>> {
    const params: Record<string, any> = { skip, limit };
    if (actionType) {
      params.action_type = actionType;
    }
    return await api.get<UserActivitiesResponse>(`/admin/users/${userId}/activities`, params);
  }

  /**
   * 사용자 상태 업데이트 (제재 등)
   * @param userId 사용자 ID
   * @param data 상태 업데이트 데이터
   * @returns 업데이트된 사용자 정보
   */
  async updateUserStatus(userId: ID, data: UserStatusUpdateRequest): Promise<ApiResult<User>> {
    return await api.put<User>(`/admin/users/${userId}/status`, data);
  }

  /**
   * 사용자 역할 업데이트
   * @param userId 사용자 ID
   * @param role 새 역할
   * @returns 업데이트된 사용자 정보
   */
  async updateUserRole(userId: ID, role: Role): Promise<ApiResult<User>> {
    const data: UserRoleUpdateRequest = { role };
    return await api.put<User>(`/admin/users/${userId}/role`, data);
  }
  //=========================================================================================
  /**
   * 대시보드 통계 가져오기 (확장 버전)
   * @returns 대시보드 통계 정보
   */
  async getDashboardExtended(): Promise<ApiResult<ExtendedDashboardStats>> {
    return await api.get<ExtendedDashboardStats>("/admin/dashboard");
  }

  /**
   * 기관 정보 업데이트 필요 여부 확인
   * @returns 업데이트 필요 여부 정보
   */
  async checkInstitutionsNeedUpdate(): Promise<ApiResult<InstitutionsUpdateStatus>> {
    return await api.get<InstitutionsUpdateStatus>("/admin/institutions/needs-update");
  }
}

// 싱글톤 인스턴스 생성
const adminService = new AdminService();
export default adminService;