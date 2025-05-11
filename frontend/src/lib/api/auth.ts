// lib/api/auth.ts

import api, { setToken, removeToken } from '@/lib/api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/lib/auth-types';

// 로그인 API
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  
  const response = await api.post<AuthResponse>('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  // 토큰 저장
  if (response.data.access_token) {
    setToken({
      access_token: response.data.access_token,
      token_type: response.data.token_type || 'Bearer',
    });
  }
  
  return response.data;
};

// 회원가입 API
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  
  // 토큰 저장
  if (response.data.access_token) {
    setToken({
      access_token: response.data.access_token,
      token_type: response.data.token_type || 'Bearer',
    });
  }
  
  return response.data;
};

// 로그아웃 API
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    // API 호출 성공 여부와 관계없이 토큰 제거
    removeToken();
  }
};

// 현재 사용자 정보 조회 API
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

// 아이디 중복 확인 API
export const checkUsernameAvailability = async (username: string): Promise<{ available: boolean; message?: string }> => {
  try {
    await api.get(`/auth/check-username/${username}`);
    return { available: true, message: '사용 가능한 아이디입니다.' };
  } catch (error: any) {
    if (error.response?.status === 400) {
      return { available: false, message: error.response.data.detail || '이미 사용 중인 아이디입니다.' };
    }
    return { available: false, message: '아이디 확인 중 오류가 발생했습니다.' };
  }
};

// 비밀번호 재설정 요청 API
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await api.post('/auth/password-reset', { email });
    return { success: true, message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.' };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.detail || '비밀번호 재설정 요청 중 오류가 발생했습니다.' 
    };
  }
};

// 비밀번호 재설정 API
export const resetPassword = async (token: string, password: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await api.post('/auth/reset-password', { token, password });
    return { success: true, message: '비밀번호가 성공적으로 재설정되었습니다.' };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.detail || '비밀번호 재설정 중 오류가 발생했습니다.' 
    };
  }
};

// 이메일 인증 API
export const verifyEmail = async (token: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await api.post('/auth/verify-email', { token });
    return { success: true, message: '이메일이 성공적으로 인증되었습니다.' };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.detail || '이메일 인증 중 오류가 발생했습니다.' 
    };
  }
};