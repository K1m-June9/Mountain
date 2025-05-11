// contexts/auth-context.tsx

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { 
  AuthState, 
  User, 
  LoginCredentials, 
  RegisterData,
  ApiError
} from '@/lib/auth-types'
import * as authApi from '@/lib/api/auth'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>
  checkUsernameAvailability: (username: string) => Promise<{ available: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // 초기 로드 시 로컬 스토리지에서 토큰 확인 및 사용자 정보 가져오기
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          return
        }

        // 토큰이 있으면 현재 사용자 정보 가져오기
        const userData = await authApi.getCurrentUser()
        setAuthState({
          user: userData.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        console.error('Failed to authenticate user:', error)
        localStorage.removeItem('token')
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed',
        })
      }
    }

    checkAuth()
  }, [])

  // 로그인 함수
  // 로그인 함수 수정
const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await authApi.login(credentials)
      
      // 토큰 저장
      localStorage.setItem('token', response.access_token)
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      return { success: true }
    } catch (error: any) { // 타입을 any로 명시
      console.error('Login failed:', error)
      
      const errorMessage = error.response?.data?.detail || '로그인에 실패했습니다.'
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      
      return { success: false, message: errorMessage }
    }
  }

  // 회원가입 함수
  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await authApi.register(data)
      
      // 토큰 저장
      localStorage.setItem('token', response.access_token)
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      return { success: true }
    } catch (error:any) {
      console.error('Registration failed:', error)
      
      const errorMessage = error.response?.data?.detail || '회원가입에 실패했습니다.'
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      
      return { success: false, message: errorMessage }
    }
  }

  // 로그아웃 함수
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // 로컬 스토리지에서 토큰 제거
      localStorage.removeItem('token')
      
      // 인증 상태 초기화
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      
      // 로그인 페이지로 리디렉션
      router.push('/login')
    }
  }

  // 프로필 업데이트 함수
  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // 프로필 업데이트 API 호출 (구현 필요)
      // const response = await api.put('/users/me', data)
      
      // 임시 구현 (실제 API 연결 시 수정 필요)
      const updatedUser = { ...authState.user, ...data } as User
      
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      return { success: true }
    } catch (error:any) {
      console.error('Profile update failed:', error)
      
      const errorMessage = error.response?.data?.detail || '프로필 업데이트에 실패했습니다.'
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      
      return { success: false, message: errorMessage }
    }
  }

  // 아이디 중복 확인 함수
  const checkUsernameAvailability = async (username: string): Promise<{ available: boolean; message?: string }> => {
    return await authApi.checkUsernameAvailability(username)
  }

  const value = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    checkUsernameAvailability,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}