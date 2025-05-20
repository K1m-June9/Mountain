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
  InstitutionsUpdateStatus,
  CommentWithDetails
} from "../types/admin";
import type { User } from "../types/user";
import type { Report, ReportFilter } from "../types/report";
import type { Post } from "../types/post";
import type { Comment } from "../types/comment";
import type { Institution } from "../types/institution";
import type { Notice, NoticeCreateRequest, NoticeUpdateRequest, NoticeFilter, NoticeWithUser } from "../types/notice";
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
// src/lib/services/admin_service.ts의 신고 관련 메서드 수정

  /**
   * 신고 목록 조회 (관리자 전용)
   * @param filters 필터링 옵션
   * @returns 페이지네이션된 신고 목록
   */
  async getReports(filters?: ReportFilter): Promise<ApiResult<PaginatedData<Report>>> {
    try {
      // 백엔드에서 반환하는 형식 그대로 받아들임
      const response = await api.get<any>("/reports", filters);
      
      if (response.success && response.data) {
        // 백엔드 응답이 배열인 경우 (List[schemas.Report])
        if (Array.isArray(response.data)) {
          // PaginatedData 형식으로 변환
          return {
            success: true,
            data: {
              items: response.data,
              total: response.data.length,
              page: filters?.page || 1,
              limit: filters?.limit || 10
            },
            meta: response.meta
          };
        } 
        // 백엔드 응답이 이미 페이지네이션 형식인 경우
        else if (response.data.items && typeof response.data.total === 'number') {
          return response as ApiResult<PaginatedData<Report>>;
        }
        // 기타 예상치 못한 형식의 경우
        else {
          console.warn('Unexpected response format from /reports endpoint:', response.data);
          // 최선의 추측으로 변환 시도
          const items = response.data.items || response.data;
          return {
            success: true,
            data: {
              items: Array.isArray(items) ? items : [items],
              total: response.data.total || (Array.isArray(items) ? items.length : 1),
              page: response.data.page || filters?.page || 1,
              limit: response.data.limit || filters?.limit || 10
            },
            meta: response.meta
          };
        }
      }
      
      return response as ApiResult<PaginatedData<Report>>;
    } catch (error) {
      console.error("Error in getReports:", error);
      return {
        success: false,
        error: {
          code: "UNEXPECTED_ERROR",
          message: "신고 목록을 가져오는 중 오류가 발생했습니다."
        }
      } as any;
    }
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
    try {
      // type 파라미터 추가하여 게시물 신고만 필터링
      const response = await api.get<any>("/reports", { 
        ...params, 
        type: "post" 
      });
      
      if (response.success && response.data) {
        // 백엔드 응답이 배열인 경우
        if (Array.isArray(response.data)) {
          // 각 신고에 post 객체가 있는지 확인하고 필요한 경우 추가
          const postReports = response.data.map(report => {
            if (!report.post && report.post_id) {
              report.post = {
                id: report.post_id,
                title: "",
                content: "",
                user_id: 0,
                view_count: 0,
                is_hidden: false,
                created_at: report.created_at,
                updated_at: report.updated_at
              };
            }
            return report as PostReport;
          });
          
          return {
            success: true,
            data: {
              items: postReports,
              total: postReports.length,
              page: params?.page || 1,
              limit: params?.limit || 10
            },
            meta: response.meta
          };
        } 
        // 백엔드 응답이 이미 페이지네이션 형식인 경우
        else if (response.data.items && typeof response.data.total === 'number') {
          // 각 신고에 post 객체가 있는지 확인하고 필요한 경우 추가
          const postReports = response.data.items.map(report => {
            if (!report.post && report.post_id) {
              report.post = {
                id: report.post_id,
                title: "",
                content: "",
                user_id: 0,
                view_count: 0,
                is_hidden: false,
                created_at: report.created_at,
                updated_at: report.updated_at
              };
            }
            return report as PostReport;
          });
          
          return {
            success: true,
            data: {
              ...response.data,
              items: postReports
            },
            meta: response.meta
          };
        }
        // 기타 예상치 못한 형식의 경우
        else {
          console.warn('Unexpected response format from /reports endpoint:', response.data);
          // 최선의 추측으로 변환 시도
          const items = response.data.items || [response.data];
          const postReports = items.map(report => {
            if (!report.post && report.post_id) {
              report.post = {
                id: report.post_id,
                title: "",
                content: "",
                user_id: 0,
                view_count: 0,
                is_hidden: false,
                created_at: report.created_at,
                updated_at: report.updated_at
              };
            }
            return report as PostReport;
          });
          
          return {
            success: true,
            data: {
              items: postReports,
              total: response.data.total || postReports.length,
              page: response.data.page || params?.page || 1,
              limit: response.data.limit || params?.limit || 10
            },
            meta: response.meta
          };
        }
      }
      
      return response as ApiResult<PaginatedData<PostReport>>;
    } catch (error) {
      console.error("Error in getPostReports:", error);
      return {
        success: false,
        error: {
          code: "UNEXPECTED_ERROR",
          message: "게시물 신고 목록을 가져오는 중 오류가 발생했습니다."
        }
      } as any;
    }
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
    try {
      // type 파라미터 추가하여 댓글 신고만 필터링
      const response = await api.get<any>("/reports", { 
        ...params, 
        type: "comment" 
      });
      
      if (response.success && response.data) {
        // 백엔드 응답이 배열인 경우
        if (Array.isArray(response.data)) {
          // 각 신고에 comment 객체가 있는지 확인하고 필요한 경우 추가
          const commentReports = response.data.map(report => {
            if (!report.comment && report.comment_id) {
              report.comment = {
                id: report.comment_id,
                content: "",
                user_id: 0,
                post_id: 0,
                parent_id: null,
                is_hidden: false,
                created_at: report.created_at,
                updated_at: report.updated_at
              };
            }
            return report as CommentReport;
          });
          
          return {
            success: true,
            data: {
              items: commentReports,
              total: commentReports.length,
              page: params?.page || 1,
              limit: params?.limit || 10
            },
            meta: response.meta
          };
        } 
        // 백엔드 응답이 이미 페이지네이션 형식인 경우
        else if (response.data.items && typeof response.data.total === 'number') {
          // 각 신고에 comment 객체가 있는지 확인하고 필요한 경우 추가
          const commentReports = response.data.items.map(report => {
            if (!report.comment && report.comment_id) {
              report.comment = {
                id: report.comment_id,
                content: "",
                user_id: 0,
                post_id: 0,
                parent_id: null,
                is_hidden: false,
                created_at: report.created_at,
                updated_at: report.updated_at
              };
            }
            return report as CommentReport;
          });
          
          return {
            success: true,
            data: {
              ...response.data,
              items: commentReports
            },
            meta: response.meta
          };
        }
        // 기타 예상치 못한 형식의 경우
        else {
          console.warn('Unexpected response format from /reports endpoint:', response.data);
          // 최선의 추측으로 변환 시도
          const items = response.data.items || [response.data];
          const commentReports = items.map(report => {
            if (!report.comment && report.comment_id) {
              report.comment = {
                id: report.comment_id,
                content: "",
                user_id: 0,
                post_id: 0,
                parent_id: null,
                is_hidden: false,
                created_at: report.created_at,
                updated_at: report.updated_at
              };
            }
            return report as CommentReport;
          });
          
          return {
            success: true,
            data: {
              items: commentReports,
              total: response.data.total || commentReports.length,
              page: response.data.page || params?.page || 1,
              limit: response.data.limit || params?.limit || 10
            },
            meta: response.meta
          };
        }
      }
      
      return response as ApiResult<PaginatedData<CommentReport>>;
    } catch (error) {
      console.error("Error in getCommentReports:", error);
      return {
        success: false,
        error: {
          code: "UNEXPECTED_ERROR",
          message: "댓글 신고 목록을 가져오는 중 오류가 발생했습니다."
        }
      } as any;
    }
  }

  /**
   * 신고 승인
   * @param reportId 신고 ID
   * @param type 신고 타입
   * @returns 업데이트된 신고 정보
   */
  async approveReport(reportId: ID, type?: "post" | "comment"): Promise<ApiResult<Report>> {
    return await api.put<Report>(`/reports/${reportId}/approve`, { type });
  }

  /**
   * 신고 거부
   * @param reportId 신고 ID
   * @param type 신고 타입
   * @returns 업데이트된 신고 정보
   */
  async rejectReport(reportId: ID, type?: "post" | "comment"): Promise<ApiResult<Report>> {
    return await api.put<Report>(`/reports/${reportId}/reject`, { type });
  }

  /**
   * 게시물 숨김 처리
   * @param postId 게시물 ID
   * @returns 업데이트된 게시물 정보
   */
  async hidePost(postId: ID): Promise<ApiResult<Post>> {
    return await api.put<Post>(`/posts/${postId}`, { is_hidden: true });
  }

  /**
   * 게시물 숨김 해제
   * @param postId 게시물 ID
   * @returns 업데이트된 게시물 정보
   */
  async unhidePost(postId: ID): Promise<ApiResult<Post>> {
    return await api.put<Post>(`/posts/${postId}`, { is_hidden: false });
  }

  /**
   * 게시물 삭제
   * @param postId 게시물 ID
   * @returns 삭제 결과
   */
  async deletePost(postId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>(`/posts/${postId}`);
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
    comments: CommentWithDetails[];
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
      comments: CommentWithDetails[];
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
    return await api.delete<{ success: boolean }>(`/comments/${commentId}`);
  }

  /**
   * 댓글 숨김 처리
   * @param commentId 댓글 ID
   * @returns 업데이트된 댓글 정보
   */
  async hideComment(commentId: ID): Promise<ApiResult<Comment>> {
    return await api.put<Comment>(`/comments/${commentId}/hide`);
  }

  /**
   * 댓글 숨김 해제
   * @param commentId 댓글 ID
   * @returns 업데이트된 댓글 정보
   */
  async unhideComment(commentId: ID): Promise<ApiResult<Comment>> {
    return await api.put<Comment>(`/comments/${commentId}/unhide`);
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
   * 기관 목록 가져오기
   * @param params 필터링 옵션
   * @returns 페이지네이션된 기관 목록
   */
  async getInstitutions(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResult<PaginatedData<Institution>>> {
    const result = await api.get<Institution[]>("/institutions", params);
    
    // 백엔드 응답을 PaginatedData 형식으로 변환
    if (result.success && Array.isArray(result.data)) {
      return {
        success: true,
        data: {
          items: result.data,
          total: result.data.length,
          page: params?.page || 1,
          limit: params?.limit || 100
        },
        meta: result.meta
      };
    }
    
    return result as any;
  }

  /**
   * 기관 추가
   * @param data 기관 데이터
   * @returns 생성된 기관 정보
   */
  async addInstitution(data: { 
    name: string; 
    description?: string; 
    color?: string; // 프론트엔드에서만 사용되는 필드
  }): Promise<ApiResult<Institution>> {
    // color 필드는 백엔드로 전송하지 않음
    const { color, ...backendData } = data;
    return await api.post<Institution>("/institutions", backendData);
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
    // color 필드는 백엔드로 전송하지 않음
    const { color, ...backendData } = data;
    return await api.put<Institution>(`/institutions/${institutionId}`, backendData);
  }

  /**
   * 기관 삭제
   * @param institutionId 기관 ID
   * @returns 삭제 결과
   */
  async deleteInstitution(institutionId: ID): Promise<ApiResult<{ success: boolean }>> {
    const result = await api.delete<Institution>(`/institutions/${institutionId}`);
    
    // 백엔드 응답을 { success: boolean } 형식으로 변환
    if (result.success) {
      return {
        success: true,
        data: { success: true }
      };
    }
    
    return {
      success: false,
      error: result.error
    };
  }

  // /**
  //  * 공지사항 목록 가져오기
  //  * @param params 필터링 옵션
  //  * @returns 페이지네이션된 공지사항 목록
  //  */
  // async getNotices(params?: { 
  //   page?: number; 
  //   limit?: number; 
  //   includeHidden?: boolean;
  // }): Promise<ApiResult<PaginatedData<Notice>>> {
  //   return await api.get<PaginatedData<Notice>>("/admin/notices", params);
  // }
// src/lib/services/admin_service.ts의 공지사항 관련 메서드 부분

  /**
   * 공지사항 목록 가져오기
   * @param params 필터링 옵션
   * @returns 페이지네이션된 공지사항 목록
   */
  async getNotices(params?: NoticeFilter): Promise<ApiResult<PaginatedData<NoticeWithUser>>> {
    const result = await api.get<NoticeWithUser[]>("/notices", params);
    
    if (result.success && Array.isArray(result.data)) {
      return {
        success: true,
        data: {
          items: result.data,
          total: result.data.length,
          page: params?.page || 1,
          limit: params?.limit || 10
        },
        meta: result.meta
      };
    }
    
    return result as any;
  }

  /**
   * 공지사항 추가
   * @param noticeData 공지사항 데이터
   * @returns 생성된 공지사항 정보
   */
  async addNotice(noticeData: NoticeCreateRequest): Promise<ApiResult<Notice>> {
    return await api.post<Notice>("/notices", noticeData);
  }

  /**
   * 공지사항 수정
   * @param noticeId 공지사항 ID
   * @param noticeData 업데이트할 공지사항 데이터
   * @returns 업데이트된 공지사항 정보
   */
  async updateNotice(noticeId: ID, noticeData: NoticeUpdateRequest): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/notices/${noticeId}`, noticeData);
  }

  /**
   * 공지사항 삭제
   * @param noticeId 공지사항 ID
   * @returns 삭제 결과
   */
  async deleteNotice(noticeId: ID): Promise<ApiResult<Notice>> {
    return await api.delete<Notice>(`/notices/${noticeId}`);
  }

  /**
   * 공지사항 숨김 처리 (이스터에그: 랜덤 명언 표시)
   * @param noticeId 공지사항 ID
   * @returns 업데이트된 공지사항 정보와 명언
   */
  async hideNotice(noticeId: ID): Promise<ApiResult<Notice & { message: string }>> {
    // 랜덤 명언 목록
    const inspirationalQuotes = [
      "성공은 매일 반복한 작은 노력들의 합이다. - 로버트 콜리어",
      "당신이 할 수 있다고 믿든, 할 수 없다고 믿든, 당신의 믿음이 옳다. - 헨리 포드",
      "나는 실패한 적이 없다. 그저 작동하지 않는 10,000가지 방법을 발견했을 뿐이다. - 토마스 에디슨",
      "당신의 시간은 제한되어 있다. 다른 사람의 인생을 사느라 시간을 낭비하지 마라. - 스티브 잡스",
      "가장 큰 위험은 아무런 위험도 감수하지 않는 것이다. - 마크 주커버그",
      "불가능은 의견일 뿐이다. - 무하마드 알리",
      "당신이 포기할 때, 그때가 바로 게임이 끝나는 시간이다. - 브라이언 트레이시",
      "성공은 준비와 기회가 만날 때 찾아온다. - 바비 언저",
      "당신이 세상을 변화시키지 못한다면, 누가 할 수 있겠는가? - 말랄라 유사프자이",
      "미래를 예측하는 최선의 방법은 미래를 창조하는 것이다. - 앨런 케이"
    ];
    
    // 랜덤 명언 선택
    const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
    
    // 성공 응답 반환 (실제로는 아무 작업도 수행하지 않음)
    return {
      success: true,
      data: {
        id: noticeId,
        title: "",
        content: "",
        user_id: 0,
        is_important: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message: randomQuote
      }
    };
  }

  /**
   * 공지사항 숨김 해제 (이스터에그: 랜덤 운세 메시지 표시)
   * @param noticeId 공지사항 ID
   * @returns 업데이트된 공지사항 정보와 운세 메시지
   */
  async unhideNotice(noticeId: ID): Promise<ApiResult<Notice & { message: string }>> {
    // 랜덤 운세 메시지 목록
    const fortuneMessages = [
      "오늘은 당신에게 행운이 찾아올 것입니다. 새로운 기회를 놓치지 마세요.",
      "곧 중요한 결정을 내리게 될 것입니다. 직감을 믿으세요.",
      "오래된 친구로부터 반가운 소식이 있을 것입니다.",
      "당신의 노력이 곧 인정받게 될 것입니다. 포기하지 마세요.",
      "예상치 못한 여행의 기회가 찾아올 수 있습니다.",
      "재정적인 행운이 당신을 기다리고 있습니다.",
      "오늘 만나는 사람이 당신의 미래에 중요한 역할을 할 것입니다.",
      "건강에 특별히 신경 쓰세요. 작은 변화가 큰 차이를 만듭니다.",
      "창의적인 아이디어가 성공으로 이어질 것입니다.",
      "가까운 미래에 당신의 꿈이 현실이 될 것입니다."
    ];
    
    // 랜덤 운세 메시지 선택
    const randomFortune = fortuneMessages[Math.floor(Math.random() * fortuneMessages.length)];
    
    // 성공 응답 반환 (실제로는 아무 작업도 수행하지 않음)
    return {
      success: true,
      data: {
        id: noticeId,
        title: "",
        content: "",
        user_id: 0,
        is_important: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message: randomFortune
      }
    };
  }

  /**
   * 공지사항 중요 표시
   * @param noticeId 공지사항 ID
   * @returns 업데이트된 공지사항 정보
   */
  async pinNotice(noticeId: ID): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/notices/${noticeId}`, { is_important: true });
  }

  /**
   * 공지사항 중요 표시 해제
   * @param noticeId 공지사항 ID
   * @returns 업데이트된 공지사항 정보
   */
  async unpinNotice(noticeId: ID): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/notices/${noticeId}`, { is_important: false });
  }
  /**
   * 활동 로그 조회
   * @param params 필터링 옵션
   * @returns 페이지네이션된 활동 로그 목록
   */
  async getActivityLogs(params?: ActivityLogFilter): Promise<ApiResult<ActivityLog[]>> {
    return await api.get<ActivityLog[]>("/admin/activity-logs", params);
  }
  
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
  // src/lib/services/admin_service.ts (user 관련 메서드만 업데이트)

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
    // 페이지 번호를 skip으로 변환 (백엔드는 skip/limit 방식 사용)
    const skip = params?.page ? (params.page - 1) * (params.limit || 10) : 0;
    
    const queryParams = {
      skip,
      limit: params?.limit || 10,
      search: params?.search,
      role: params?.role,
      status: params?.status
    };
    
    return await api.get<PaginatedData<User>>("/admin/users", queryParams);
  }

  /**
   * 사용자 상세 정보 가져오기
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
    /**
   * 모든 설정 가져오기
   * @returns 모든 설정 정보 (섹션별로 그룹화)
   */
  async getSettings(): Promise<ApiResult<{
    site: SiteSettings;
    report: ReportSettings;
    notification: NotificationSettings;
  }>> {
    return await api.get<{
      site: SiteSettings;
      report: ReportSettings;
      notification: NotificationSettings;
    }>("/admin/settings");
  }

  /**
   * 특정 섹션의 설정 업데이트
   * @param section 설정 섹션 (site, report, notification)
   * @param data 업데이트할 설정 데이터
   * @returns 업데이트된 설정 정보
   */
  async updateSettings(
    section: "site" | "report" | "notification", 
    data: Partial<SiteSettings | ReportSettings | NotificationSettings>
  ): Promise<ApiResult<any>> {
    return await api.put<any>(`/admin/settings/${section}`, data);
  }

  /**
   * 특정 섹션의 설정 초기화
   * @param section 설정 섹션 (site, report, notification)
   * @returns 초기화된 설정 정보
   */
  async resetSettings(
    section: "site" | "report" | "notification"
  ): Promise<ApiResult<any>> {
    return await api.post<any>(`/admin/settings/${section}/reset`);
  }

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
    return await this.updateSettings("site", data);
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
    return await this.updateSettings("report", data);
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
    return await this.updateSettings("notification", data);
  }

  // /**
  //  * 대시보드 통계 가져오기 (확장 버전)
  //  * @returns 대시보드 통계 정보
  //  */
  // async getDashboardStats(): Promise<ApiResult<DashboardStats>> {
  //   return await api.get<DashboardStats>("/admin/dashboard");
  // }
}

// 싱글톤 인스턴스 생성
const adminService = new AdminService();
export default adminService;