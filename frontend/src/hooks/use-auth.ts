import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { User, LoginInput, RegisterInput, AuthResponse } from '@/types/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 로컬 스토리지에서 토큰 확인
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get<User>('/users/me');
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginInput) => {
    try {
      setLoading(true);
      const response = await api.post<AuthResponse>('/auth/login', data);
      localStorage.setItem('token', response.data.access_token);
      setUser(response.data.user);
      setError(null);
      router.push('/');
      return true;
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || '로그인에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      setLoading(true);
      await api.post('/auth/register', data);
      setError(null);
      router.push('/login');
      return true;
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || '회원가입에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}