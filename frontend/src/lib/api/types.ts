// src/lib/api/types.ts

import { ID, Role } from '../types/common';
import { User } from '../types/user';

/**
 * API 응답의 기본 형식
 * 백엔드에서 반환하는 응답 구조를 정의합니다.
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  meta?: {
    skip: number;
    limit: number;
    total: number;
  };
}

/**
 * API 에러 정보
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * API 결과 - 성공/실패를 명시적으로 처리하기 위한 타입
 * 서비스 레이어에서 반환하는 결과 구조를 정의합니다.
 */
export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    skip: number;
    limit: number;
    total: number;
  };
}

/**
 * API 요청 옵션
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: RequestCache;
  retry?: number;
}

/**
 * 인증 응답 타입
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}