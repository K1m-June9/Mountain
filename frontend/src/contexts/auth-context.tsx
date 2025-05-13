// src/contexts/auth-context.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, LoginCredentials, RegisterData } from '@/lib/services/auth';

interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  role?: string;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 로컬 스토리지에서 토큰 확인
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // 토큰이 있으면 현재 사용자 정보 가져오기
        const userData = await authService.getCurrentUser();
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  // 로그인 함수
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const data = await authService.login(credentials);
      
      // 토큰 저장
      localStorage.setItem('token', data.access_token);
      
      // 사용자 정보 가져오기
      const userData = await authService.getCurrentUser();
      
      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true, user: userData };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.detail || '로그인에 실패했습니다.' 
      };
    }
  };

  // 회원가입 함수
  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      await authService.register(data);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.detail || '회원가입에 실패했습니다.' 
      };
    }
  };

  // 로그아웃 함수
  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push('/login');
  };

  // 프로필 업데이트 함수
  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean }> => {
    try {
      // 백엔드 API 호출 (실제 구현 필요)
      // await api.put('/users/me', data);
      
      if (!authState.user) {
        return { success: false };
      }

      const updatedUser = {
        ...authState.user,
        ...data,
      };

      setAuthState({
        ...authState,
        user: updatedUser,
      });

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false };
    }
  };

  const value = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}