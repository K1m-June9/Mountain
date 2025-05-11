// lib/api/users.ts

import api from '@/lib/api';
import { User } from '@/lib/auth-types';

// 사용자 프로필 업데이트 API
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await api.put<User>('/users/me', data);
  return response.data;
};

// 비밀번호 변경 API
export const changePassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    await api.post('/users/me/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.detail || '비밀번호 변경 중 오류가 발생했습니다.' 
    };
  }
};

// 프로필 이미지 업로드 API
export const uploadProfileImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<{ url: string }>('/users/me/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// 사용자 활동 내역 조회 API
export const getUserActivity = async (
  type: 'posts' | 'comments' | 'likes',
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  const response = await api.get(`/users/me/activity/${type}`, {
    params: { page, limit },
  });
  return response.data;
};

// 특정 사용자 정보 조회 API (공개 프로필)
export const getUserProfile = async (username: string): Promise<User> => {
  const response = await api.get<User>(`/users/${username}`);
  return response.data;
};