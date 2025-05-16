// src/lib/types/report.ts

import { ID, Timestamps, ReportStatus, BaseFilter } from './common';

/**
 * 신고 관련 타입 정의
 */

/**
 * 신고 기본 정보
 */
export interface Report extends Timestamps {
  id: ID;
  reporter_id: ID;
  post_id?: ID;
  comment_id?: ID;
  reason: string;
  description?: string;
  status: ReportStatus;
  reviewed_by?: ID;
}

/**
 * 신고 생성 요청
 */
export interface ReportCreateRequest {
  reason: string;
  description?: string;
}

/**
 * 신고 업데이트 요청
 */
export interface ReportUpdateRequest {
  status: ReportStatus;
}

/**
 * 신고 필터
 */
export interface ReportFilter extends BaseFilter {
  status?: ReportStatus;
  reporter_id?: ID;
  reviewed_by?: ID;
}

// src/lib/types/report.ts에 추가

/**
 * 신고 사유 타입
 */
export type ReportReason = 
  | "spam" 
  | "inappropriate" 
  | "offensive" 
  | "harassment" 
  | "misinformation" 
  | "other";

/**
 * 신고 사유 레이블
 */
export const reportReasonLabels: Record<ReportReason, string> = {
  spam: "스팸 또는 광고",
  inappropriate: "부적절한 콘텐츠",
  offensive: "불쾌감을 주는 내용",
  harassment: "괴롭힘 또는 혐오 표현",
  misinformation: "허위 정보",
  other: "기타"
};

