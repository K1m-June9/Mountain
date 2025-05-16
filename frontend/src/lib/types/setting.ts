// src/lib/types/setting.ts

import { ID, Timestamps } from './common';

/**
 * 설정 관련 타입 정의
 */

/**
 * 설정 기본 정보
 */
export interface Setting extends Timestamps {
  id: ID;
  key_name: string;
  value: string;
  description?: string;
}

/**
 * 설정 업데이트 요청
 */
export interface SettingUpdateRequest {
  value: string;
  description?: string;
}