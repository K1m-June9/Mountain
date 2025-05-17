// src/lib/services/notice_service.ts

import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { 
  Notice, 
  NoticeWithUser, 
  NoticeCreateRequest, 
  NoticeUpdateRequest, 
  NoticeFilter 
} from "../types/notice";
import type { PaginatedData, PaginationParams, ID } from "../types/common";

/**
 * 공지사항 관련 서비스 함수들을 제공하는 클래스
 */
export class NoticeService {
  /**
   * 공지사항 목록 조회
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
          page: 1, // 백엔드에서 페이지 정보가 없으므로 기본값 사용
          limit: params?.limit || 10
        },
        meta: result.meta
      };
    }
    
    return result as any;
  }

  /**
   * 특정 공지사항 조회
   * @param noticeId 공지사항 ID
   * @returns 공지사항 상세 정보
   */
  async getNoticeById(noticeId: ID): Promise<ApiResult<NoticeWithUser>> {
    return await api.get<NoticeWithUser>(`/notices/${noticeId}`);
  }

  /**
   * 공지사항 생성
   * @param noticeData 공지사항 생성 데이터
   * @returns 생성된 공지사항 정보
   */
  async createNotice(noticeData: NoticeCreateRequest): Promise<ApiResult<Notice>> {
    return await api.post<Notice>("/notices", noticeData);
  }

  /**
   * 공지사항 수정
   * @param noticeId 공지사항 ID
   * @param updateData 업데이트할 공지사항 데이터
   * @returns 업데이트된 공지사항 정보
   */
  async updateNotice(noticeId: ID, updateData: NoticeUpdateRequest): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/notices/${noticeId}`, updateData);
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
   * 공지사항 중요 표시
   * @param noticeId 공지사항 ID
   * @returns 업데이트된 공지사항 정보
   */
  async markAsImportant(noticeId: ID): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/notices/${noticeId}`, { is_important: true });
  }

  /**
   * 공지사항 중요 표시 해제
   * @param noticeId 공지사항 ID
   * @returns 업데이트된 공지사항 정보
   */
  async unmarkAsImportant(noticeId: ID): Promise<ApiResult<Notice>> {
    return await api.put<Notice>(`/notices/${noticeId}`, { is_important: false });
  }

  /**
   * 중요 공지사항만 조회
   * @param params 페이지네이션 파라미터
   * @returns 페이지네이션된 중요 공지사항 목록
   */
  async getImportantNotices(params?: PaginationParams): Promise<ApiResult<PaginatedData<NoticeWithUser>>> {
    const result = await api.get<NoticeWithUser[]>("/notices", { 
      ...params,
      important_only: true 
    });
    
    if (result.success && Array.isArray(result.data)) {
      return {
        success: true,
        data: {
          items: result.data,
          total: result.data.length,
          page: 1, // 백엔드에서 페이지 정보가 없으므로 기본값 사용
          limit: params?.limit || 10
        },
        meta: result.meta
      };
    }
    
    return result as any;
  }
}

// 싱글톤 인스턴스 생성
const noticeService = new NoticeService();
export default noticeService;