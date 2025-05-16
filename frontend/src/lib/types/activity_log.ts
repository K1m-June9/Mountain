// src/lib/types/activity-log.ts

import { ID, Timestamps, BaseFilter } from './common';

/**
 * 활동 로그 관련 타입 정의
 */

/**
 * 활동 로그 기본 정보
 */
export interface ActivityLog extends Timestamps {
  id: ID;
  user_id: ID;
  action_type: string;
  description: string;
  ip_address?: string;
}

/**
 * 활동 로그 필터
 */
export interface ActivityLogFilter extends BaseFilter {
  user_id?: ID;
  action_type?: string;
}