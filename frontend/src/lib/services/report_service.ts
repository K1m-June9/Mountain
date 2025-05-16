// src/lib/services/report_service.ts

import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { 
  Report, 
  ReportCreateRequest, 
  ReportUpdateRequest, 
  ReportFilter 
} from "../types/report";
import type { PaginatedData, PaginationParams, ID } from "../types/common";

/**
 * 신고 관련 서비스 함수들을 제공하는 클래스
 */
export class ReportService {
  /**
   * 신고 목록 조회 (관리자 전용)
   * @param filters 필터링 옵션
   * @returns 페이지네이션된 신고 목록
   */
  async getReports(filters?: ReportFilter): Promise<ApiResult<PaginatedData<Report>>> {
    return await api.get<PaginatedData<Report>>("/reports", filters);
  }

  /**
   * 특정 신고 조회 (관리자 전용)
   * @param reportId 신고 ID
   * @returns 신고 정보
   */
  async getReport(reportId: ID): Promise<ApiResult<Report>> {
    return await api.get<Report>(`/reports/${reportId}`);
  }

  /**
   * 신고 생성
   * @param reportData 신고 생성 데이터
   * @param targetType 신고 대상 타입 (post 또는 comment)
   * @param targetId 신고 대상 ID
   * @returns 생성된 신고 정보
   */
  async createReport(
    reportData: ReportCreateRequest, 
    targetType: "post" | "comment", 
    targetId: ID
  ): Promise<ApiResult<Report>> {
    const data = {
      ...reportData,
      ...(targetType === "post" ? { post_id: targetId } : { comment_id: targetId })
    };
    
    return await api.post<Report>("/reports", data);
  }

  /**
   * 신고 상태 업데이트 (관리자 전용)
   * @param reportId 신고 ID
   * @param updateData 업데이트할 신고 데이터
   * @returns 업데이트된 신고 정보
   */
  async updateReport(reportId: ID, updateData: ReportUpdateRequest): Promise<ApiResult<Report>> {
    return await api.put<Report>(`/reports/${reportId}`, updateData);
  }

  /**
   * 게시물 신고
   * @param postId 게시물 ID
   * @param reportData 신고 데이터
   * @returns 생성된 신고 정보
   */
  async reportPost(postId: ID, reportData: ReportCreateRequest): Promise<ApiResult<Report>> {
    return this.createReport(reportData, "post", postId);
  }

  /**
   * 댓글 신고
   * @param commentId 댓글 ID
   * @param reportData 신고 데이터
   * @returns 생성된 신고 정보
   */
  async reportComment(commentId: ID, reportData: ReportCreateRequest): Promise<ApiResult<Report>> {
    return this.createReport(reportData, "comment", commentId);
  }
}

// 싱글톤 인스턴스 생성
const reportService = new ReportService();
export default reportService;