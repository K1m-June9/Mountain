// src/lib/services/user_service.ts

import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { User, UserUpdateRequest } from "../types/user";
import type { PaginatedData, PaginationParams } from "../types/common";

/**
 * 사용자 관련 서비스 함수들을 제공하는 클래스
 */
export class UserService {
  /**
   * 현재 로그인한 사용자의 프로필 정보를 조회합니다.
   * @returns 사용자 프로필 정보
   */
  async getCurrentUserProfile(): Promise<ApiResult<User>> {
    return await api.get<User>("/users/me");
  }

  /**
   * 특정 사용자의 프로필 정보를 조회합니다.
   * @param userId 조회할 사용자의 ID
   * @returns 사용자 프로필 정보
   */
  async getUserProfile(userId: number): Promise<ApiResult<User>> {
    return await api.get<User>(`/users/${userId}`);
  }

  /**
   * 사용자 프로필 정보를 업데이트합니다.
   * @param updateData 업데이트할 사용자 정보
   * @returns 업데이트된 사용자 프로필 정보
   */
  async updateUserProfile(updateData: UserUpdateRequest): Promise<ApiResult<User>> {
    return await api.put<User>("/users/me", updateData);
  }

  /**
   * 사용자 목록을 페이지네이션하여 조회합니다.
   * @param params 페이지네이션 파라미터
   * @returns 페이지네이션된 사용자 목록
   */
  async getUsers(params: PaginationParams): Promise<ApiResult<PaginatedData<User>>> {
    return await api.get<PaginatedData<User>>("/users", params);
  }

  /**
   * 사용자 계정을 비활성화합니다.
   * @returns 비활성화 결과
   */
  async deactivateAccount(): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>("/users/me");
  }

  /**
   * 사용자 프로필 이미지를 업로드합니다.
   * @param imageFile 업로드할 이미지 파일
   * @returns 업로드 결과 및 이미지 URL
   */
  async uploadProfileImage(imageFile: File): Promise<ApiResult<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append("image", imageFile);

    return await api.post<{ imageUrl: string }>("/users/me/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 사용자 알림 설정을 업데이트합니다.
   * @param settings 업데이트할 알림 설정
   * @returns 업데이트된 알림 설정
   */
  async updateNotificationSettings(settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  }): Promise<ApiResult<{ emailNotifications: boolean; pushNotifications: boolean }>> {
    return await api.put<{
      emailNotifications: boolean;
      pushNotifications: boolean;
    }>("/users/me/notification-settings", settings);
  }
    //
    /**
   * 사용자 통계 정보를 조회합니다.
   * @param userId 조회할 사용자의 ID
   * @returns 사용자 통계 정보 (게시글 수, 댓글 수, 좋아요 수)
   */
  async getUserStats(userId: number): Promise<ApiResult<{
    post_count: number;
    comment_count: number;
    like_count: number;
  }>> {
    return await api.get<{
      post_count: number;
      comment_count: number;
      like_count: number;
    }>(`/users/${userId}/stats`);
  }
}

// 싱글톤 인스턴스 생성
const userService = new UserService();
export default userService;