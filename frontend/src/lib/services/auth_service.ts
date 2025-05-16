// src/lib/services/auth_service.ts

import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/auth";
import { STORAGE_KEYS, getLocalStorage, setLocalStorage, removeLocalStorage } from "../utils/storage";

/**
 * 비밀번호 변경 요청 타입
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * 인증 관련 서비스 함수들을 제공하는 클래스
 */
export class AuthService {
  /**
   * 사용자 로그인을 처리합니다.
   * @param credentials 로그인 정보 (이메일, 비밀번호)
   * @returns 로그인 결과 및 사용자 정보
   */
  async login(credentials: LoginRequest): Promise<ApiResult<LoginResponse>> {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    
    if (response.success && response.data) {
      setLocalStorage(STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
      setLocalStorage(STORAGE_KEYS.USER, response.data.user);
    }
    
    return response;
  }

  /**
   * 새로운 사용자를 등록합니다.
   * @param userData 사용자 등록 정보
   * @returns 등록 결과 및 사용자 정보
   */
  async register(userData: RegisterRequest): Promise<ApiResult<RegisterResponse>> {
    const response = await api.post<RegisterResponse>("/auth/register", userData);
    
    if (response.success && response.data) {
      setLocalStorage(STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
      setLocalStorage(STORAGE_KEYS.USER, response.data.user);
    }
    
    return response;
  }

  /**
   * 사용자명 중복 확인을 수행합니다.
   * @param username 확인할 사용자명
   * @returns 사용 가능 여부 및 메시지
   */
  async checkUsernameAvailability(username: string): Promise<ApiResult<{ available: boolean; message?: string }>> {
    return await api.get<{ available: boolean; message?: string }>(`/auth/check-username`, { username });
  }

  /**
   * 사용자 로그아웃을 처리합니다.
   * @returns 로그아웃 결과
   */
  async logout(): Promise<ApiResult<{ success: boolean }>> {
    // 서버에 로그아웃 요청을 보냅니다.
    const response = await api.post<{ success: boolean }>("/auth/logout", {});
    
    // 로컬 스토리지에서 토큰을 제거합니다.
    removeLocalStorage(STORAGE_KEYS.ACCESS_TOKEN);
    removeLocalStorage(STORAGE_KEYS.USER);
    
    return response;
  }

  /**
   * 비밀번호 재설정 이메일을 요청합니다.
   * @param email 사용자 이메일
   * @returns 요청 결과
   */
  async requestPasswordReset(email: string): Promise<ApiResult<{ success: boolean }>> {
    return await api.post<{ success: boolean }>("/auth/reset-password", { email });
  }

  /**
   * 비밀번호를 재설정합니다.
   * @param token 비밀번호 재설정 토큰
   * @param newPassword 새 비밀번호
   * @returns 재설정 결과
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResult<{ success: boolean }>> {
    return await api.post<{ success: boolean }>("/auth/reset-password/confirm", {
      token,
      newPassword,
    });
  }

  /**
   * 사용자 비밀번호를 변경합니다.
   * @param passwordData 비밀번호 변경 데이터 (현재 비밀번호, 새 비밀번호)
   * @returns 비밀번호 변경 결과
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResult<{ success: boolean }>> {
    return await api.post<{ success: boolean }>("/auth/change-password", {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
    });
  }

  /**
   * 현재 사용자의 인증 상태를 확인합니다.
   * @returns 인증 상태
   */
  isUserAuthenticated(): boolean {
    return api.isAuthenticated();
  }

  /**
   * 인증 토큰을 갱신합니다.
   * @returns 갱신된 토큰 정보
   */
  async refreshToken(): Promise<ApiResult<{ access_token: string }>> {
    const response = await api.post<{ access_token: string }>("/auth/refresh-token", {});
    
    if (response.success && response.data) {
      setLocalStorage(STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
    }
    
    return response;
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();
export default authService;