// src/lib/types/admin/institution.ts

import { ID, Timestamps, BaseFilter } from '../common';
import { Institution } from '../institution';

/**
 * 관리자용 기관 관련 타입 정의
 */

/**
 * 관리자용 기관 상세 정보
 */
export interface AdminInstitution extends Institution {
  post_count?: number;
  user_count?: number;
  last_updated?: string;
}

/**
 * 기관 생성 요청 (관리자용)
 */
export interface AdminInstitutionCreateRequest {
  name: string;
  description?: string;
  color?: string;
}

/**
 * 기관 업데이트 요청 (관리자용)
 */
export interface AdminInstitutionUpdateRequest {
  name?: string;
  description?: string;
  color?: string;
}

/**
 * 기관 필터 (관리자용)
 */
export interface AdminInstitutionFilter extends BaseFilter {
  status?: 'active' | 'inactive';
  hasDescription?: boolean;
}

/**
 * 기관 정보 업데이트 필요 여부
 */
export interface InstitutionsUpdateStatus {
  needsUpdate: boolean;
  incompleteCount: number;
  outdatedCount: number;
}

/**
 * 기관 통계 정보
 */
export interface InstitutionStats {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  withDescriptionCount: number;
  withoutDescriptionCount: number;
  recentlyUpdatedCount: number;
}

/**
 * 기관 삭제 응답
 */
export interface InstitutionDeleteResponse {
  success: boolean;
  message?: string;
}

/**
 * 기관 일괄 업데이트 요청
 */
export interface InstitutionBulkUpdateRequest {
  institutionIds: ID[];
  updates: {
    description?: string;
    color?: string;
  };
}

/**
 * 기관 일괄 업데이트 응답
 */
export interface InstitutionBulkUpdateResponse {
  success: boolean;
  updatedCount: number;
  failedIds?: ID[];
}