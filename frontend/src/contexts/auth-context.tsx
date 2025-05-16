"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User, UserUpdateRequest } from "@/lib/types/user"
import type { LoginRequest, RegisterData } from "@/lib/types/auth"
import authService from "@/lib/services/auth_service"
import userService from "@/lib/services/user_service"
import { toast } from "sonner"
import { STORAGE_KEYS, getLocalStorage } from "@/lib/utils/storage"

// 필요한 타입 정의
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message?: string; user?: User }>
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  updateProfile: (data: UserUpdateRequest) => Promise<{ success: boolean }>
  checkUsernameAvailability: (username: string) => Promise<{ available: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // 초기 로드 시 로컬 스토리지에서 사용자 정보 가져오기
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 로컬 스토리지에서 사용자 정보 가져오기
        const isAuthenticated = authService.isUserAuthenticated()
        
        if (isAuthenticated) {
          // 사용자 정보 가져오기
          const result = await userService.getCurrentUserProfile()
          
          if (result.success && result.data) {
            setAuthState({
              user: result.data,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // 토큰은 있지만 사용자 정보를 가져오지 못한 경우
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error("Failed to check authentication:", error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    checkAuth()
  }, [])

  // 로그인 함수
  const login = async (credentials: LoginRequest): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const result = await authService.login(credentials)

      if (result.success && result.data) {
        // 사용자 정보 가져오기
        const userResult = await userService.getCurrentUserProfile()
        
        if (userResult.success && userResult.data) {
          setAuthState({
            user: userResult.data,
            isAuthenticated: true,
            isLoading: false,
          })
          
          return { success: true, user: userResult.data }
        }
      }
      
      return { 
        success: false, 
        message: result.error?.message || "로그인에 실패했습니다." 
      }
    } catch (error) {
      console.error("Login failed:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "로그인에 실패했습니다.",
      }
    }
  }

  // 아이디 중복 확인 함수
  const checkUsernameAvailability = async (username: string): Promise<{ available: boolean; message?: string }> => {
    try {
      const result = await authService.checkUsernameAvailability(username);
      
      if (result.success && result.data) {
        return {
          available: result.data.available,
          message: result.data.message,
        };
      }
      
      return {
        available: false,
        message: result.error?.message || "아이디 중복 확인에 실패했습니다.",
      };
    } catch (error) {
      console.error("Username check failed:", error);
      return {
        available: false,
        message: error instanceof Error ? error.message : "아이디 중복 확인에 실패했습니다.",
      };
    }
  }

  // 회원가입 함수
  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      // RegisterData를 RegisterRequest로 변환
      const registerRequest = {
        username: data.username,
        email: data.email,
        password: data.password,
      }

      const result = await authService.register(registerRequest)

      if (result.success && result.data) {
        // 사용자 정보 설정
        setAuthState({
          user: result.data.user,
          isAuthenticated: true,
          isLoading: false,
        })

        return { success: true }
      }
      
      return { 
        success: false, 
        message: result.error?.message || "회원가입에 실패했습니다." 
      }
    } catch (error) {
      console.error("Registration failed:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "회원가입에 실패했습니다.",
      }
    }
  }

  // 로그아웃 함수
  const logout = async () => {
    try {
      const result = await authService.logout()

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("로그아웃 중 오류가 발생했습니다.")
    }
  }

  // 프로필 업데이트 함수 - UserUpdateRequest 타입으로 변경
  const updateProfile = async (data: UserUpdateRequest): Promise<{ success: boolean }> => {
    if (!authState.user) {
      return { success: false }
    }

    try {
      const result = await userService.updateUserProfile(data)

      if (result.success && result.data) {
        setAuthState({
          ...authState,
          user: { ...authState.user, ...result.data },
        })

        return { success: true }
      }
      
      return { success: false }
    } catch (error) {
      console.error("Profile update failed:", error)
      return { success: false }
    }
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