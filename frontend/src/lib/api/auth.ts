// lib/api/auth.ts

import api from '@/lib/api';
import { LoginCredentials, RegisterData, AuthResponse } from '@/lib/auth-types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  
  const response = await api.post<AuthResponse>('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await api.get<AuthResponse>('/users/me');
  return response.data;
};

export const checkUsernameAvailability = async (username: string): Promise<{ available: boolean; message?: string }> => {
  try {
    await api.get(`/auth/check-username/${username}`);
    return { available: true, message: '사용 가능한 아이디입니다.' };
  } catch (error:any) {
    if (error.response?.status === 400) {
      return { available: false, message: error.response.data.detail || '이미 사용 중인 아이디입니다.' };
    }
    return { available: false, message: '아이디 확인 중 오류가 발생했습니다.' };
  }
};