// src/lib/types/institution.ts

import { ID, Timestamps, BaseFilter } from './common';

/**
 * 기관 관련 타입 정의
 */

/**
 * 기관 기본 정보
 */
export interface Institution extends Timestamps {
  id: ID;
  name: string;
  description?: string;
}

/**
 * 기관 생성 요청
 */
export interface InstitutionCreateRequest {
  name: string;
  description?: string;
}

/**
 * 기관 업데이트 요청
 */
export interface InstitutionUpdateRequest {
  name?: string;
  description?: string;
}

/**
 * 기관 필터
 */
export interface InstitutionFilter extends BaseFilter {
  // 추가 필터링 옵션이 있다면 여기에 정의
}