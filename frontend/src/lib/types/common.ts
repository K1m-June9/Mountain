// src/lib/types/common.ts

/**
 * 공통 타입 정의
 * 여러 도메인에서 공통적으로 사용되는 타입들을 정의합니다.
 */

/**
 * ID 타입 (문자열 또는 숫자)
 */
export type ID = number;

/**
 * 기본 타임스탬프 필드
 */
export interface Timestamps {
  created_at: string;
  updated_at?: string;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

/**
 * 사용자 역할 타입
 */
export type Role = "user" | "moderator" | "admin";

/**
 * API 응답 메타데이터
 */
export interface ResponseMeta {
  timestamp: string;
}

/**
 * 기본 필터 타입
 */
export interface BaseFilter extends PaginationParams {
  search?: string;
  [key: string]: any;
}

/**
 * 반응 타입 (좋아요/싫어요)
 */
export type ReactionType = "like" | "dislike";

/**
 * 신고 상태 타입
 */
export type ReportStatus = "pending" | "reviewed" | "resolved" | "rejected";

/**
 * 알림 타입
 */
export type NotificationType = "report_status" | "admin_message";

/**
 * API 응답 결과 타입
 */
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}