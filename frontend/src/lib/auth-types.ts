// lib/auth-types.ts

export interface User {
    id: number
    username: string
    nickname: string
    email: string
    profileImage?: string
    bio?: string
    role: string
    createdAt: string
    updatedAt: string
  }
  
  export interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
  }
  
  export interface LoginCredentials {
    username: string
    password: string
    remember?: boolean
  }
  
  export interface RegisterData {
    username: string
    password: string
    nickname: string
    email: string
  }
  
  export interface AuthResponse {
    access_token: string
    token_type: string
    user: User
  }
  
  export interface ApiError {
    detail: string
  }