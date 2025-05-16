// src/lib/services/institution_service.ts

import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { 
  Institution, 
  InstitutionCreateRequest, 
  InstitutionUpdateRequest, 
  InstitutionFilter 
} from "../types/institution";
import type { PaginatedData, PaginationParams, ID } from "../types/common";
import type { PostWithDetails } from "../types/post";

/**
 * 기관 관련 서비스 함수들을 제공하는 클래스
 */
export class InstitutionService {
  /**
   * 기관 목록 조회
   * @param params 필터링 옵션
   * @returns 페이지네이션된 기관 목록
   */
  async getInstitutions(params?: InstitutionFilter): Promise<ApiResult<PaginatedData<Institution>>> {
    return await api.get<PaginatedData<Institution>>("/institutions", params);
  }

  /**
   * 특정 기관 조회
   * @param institutionId 기관 ID
   * @returns 기관 정보
   */
  async getInstitution(institutionId: ID): Promise<ApiResult<Institution>> {
    return await api.get<Institution>(`/institutions/${institutionId}`);
  }

  /**
   * 기관 생성 (관리자 전용)
   * @param institutionData 기관 생성 데이터
   * @returns 생성된 기관 정보
   */
  async createInstitution(institutionData: InstitutionCreateRequest): Promise<ApiResult<Institution>> {
    return await api.post<Institution>("/institutions", institutionData);
  }

  /**
   * 기관 업데이트 (관리자 전용)
   * @param institutionId 기관 ID
   * @param updateData 업데이트할 기관 데이터
   * @returns 업데이트된 기관 정보
   */
  async updateInstitution(institutionId: ID, updateData: InstitutionUpdateRequest): Promise<ApiResult<Institution>> {
    return await api.put<Institution>(`/institutions/${institutionId}`, updateData);
  }

  /**
   * 기관 삭제 (관리자 전용)
   * @param institutionId 기관 ID
   * @returns 삭제 결과
   */
  async deleteInstitution(institutionId: ID): Promise<ApiResult<Institution>> {
    return await api.delete<Institution>(`/institutions/${institutionId}`);
  }

  /**
   * 기관의 게시물 목록 조회
   * @param institutionId 기관 ID
   * @param params 페이지네이션 파라미터
   * @returns 페이지네이션된 게시물 목록
   */
  async getInstitutionPosts(
    institutionId: ID,
    params?: PaginationParams
  ): Promise<ApiResult<PaginatedData<PostWithDetails>>> {
    return await api.get<PaginatedData<PostWithDetails>>(`/institutions/${institutionId}/posts`, params);
  }

  /**
   * 기관 검색
   * @param query 검색어
   * @param params 페이지네이션 파라미터
   * @returns 페이지네이션된 기관 목록
   */
  async searchInstitutions(
    query: string,
    params?: PaginationParams
  ): Promise<ApiResult<PaginatedData<Institution>>> {
    return await api.get<PaginatedData<Institution>>("/institutions", {
      ...params,
      search: query
    });
  }
}

// 싱글톤 인스턴스 생성
const institutionService = new InstitutionService();
export default institutionService;