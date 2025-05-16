// src/lib/types/category.ts

import { ID, Timestamps, BaseFilter } from './common';

/**
 * 카테고리 관련 타입 정의
 */

/**
 * 카테고리 기본 정보
 */
export interface Category extends Timestamps {
  id: ID;
  name: string;
  description?: string;
}

/**
 * 카테고리 생성 요청
 */
export interface CategoryCreateRequest {
  name: string;
  description?: string;
}

/**
 * 카테고리 업데이트 요청
 */
export interface CategoryUpdateRequest {
  name?: string;
  description?: string;
}

/**
 * 카테고리 필터
 */
export interface CategoryFilter extends BaseFilter {
  // 추가 필터링 옵션이 있다면 여기에 정의
}