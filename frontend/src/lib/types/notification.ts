// src/lib/types/notification.ts

import { ID, Timestamps, NotificationType, BaseFilter } from './common';

/**
 * 알림 관련 타입 정의
 */

/**
 * 알림 기본 정보
 */
export interface Notification extends Timestamps {
  id: ID;
  user_id: ID;
  type: NotificationType;
  content: string;
  is_read: boolean;
  related_id?: ID;
}

/**
 * 알림 필터
 */
export interface NotificationFilter extends BaseFilter {
  type?: NotificationType;
  is_read?: boolean;
}