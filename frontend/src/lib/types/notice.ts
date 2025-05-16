// src/lib/types/notice.ts

import { ID, Timestamps, BaseFilter } from './common';
import { User } from './user';

/**
 * 공지사항 관련 타입 정의
 */

/**
 * 공지사항 기본 정보
 */
export interface Notice extends Timestamps {
  id: ID;
  title: string;
  content: string;
  user_id: ID;
  is_important: boolean;
  is_hidden?: boolean; // 숨김 여부 추가
}

/**
 * 공지사항 + 사용자 정보
 */
export interface NoticeWithUser extends Notice {
  user: User;
}

/**
 * 공지사항 생성 요청
 */
export interface NoticeCreateRequest {
  title: string;
  content: string;
  is_important: boolean;
}

/**
 * 공지사항 업데이트 요청
 */
export interface NoticeUpdateRequest {
  title?: string;
  content?: string;
  is_important?: boolean;
  is_hidden?: boolean; // 오타 수정
}

/**
 * 공지사항 필터
 */
export interface NoticeFilter extends BaseFilter {
  important_only?: boolean;
}