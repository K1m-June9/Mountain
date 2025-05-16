// src/lib/services/notification_service.ts

import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { Notification, NotificationFilter } from "../types/notification";
import type { PaginatedData, PaginationParams, ID } from "../types/common";

/**
 * 알림 관련 서비스 함수들을 제공하는 클래스
 */
export class NotificationService {
  /**
   * 알림 목록 조회
   * @param params 필터링 옵션
   * @returns 페이지네이션된 알림 목록
   */
  async getNotifications(params?: NotificationFilter): Promise<ApiResult<PaginatedData<Notification>>> {
    return await api.get<PaginatedData<Notification>>("/notifications", params);
  }

  /**
   * 알림 읽음 표시
   * @param notificationId 알림 ID
   * @returns 업데이트된 알림 정보
   */
  async markAsRead(notificationId: ID): Promise<ApiResult<Notification>> {
    return await api.put<Notification>(`/notifications/${notificationId}/read`);
  }

  /**
   * 모든 알림 읽음 표시
   * @returns 업데이트된 알림 목록
   */
  async markAllAsRead(): Promise<ApiResult<Notification[]>> {
    return await api.put<Notification[]>("/notifications/read-all");
  }

  /**
   * 알림 삭제
   * @param notificationId 알림 ID
   * @returns 삭제 결과
   */
  async deleteNotification(notificationId: ID): Promise<ApiResult<Notification>> {
    return await api.delete<Notification>(`/notifications/${notificationId}`);
  }

  /**
   * 모든 알림 삭제
   * @returns 삭제 결과
   */
  async deleteAllNotifications(): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>("/notifications");
  }

  /**
   * 읽지 않은 알림 개수 조회
   * @returns 읽지 않은 알림 개수
   */
  async getUnreadCount(): Promise<ApiResult<{ count: number }>> {
    return await api.get<{ count: number }>("/notifications/unread-count");
  }
}

// 싱글톤 인스턴스 생성
const notificationService = new NotificationService();
export default notificationService;