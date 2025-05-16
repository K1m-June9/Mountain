// src/lib/types/auth.ts

import { User } from './user';

/**
 * 인증 관련 타입 정의
 */

/**
 * 로그인 요청
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * 회원가입 요청
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * 회원가입 응답
 */
export interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * 비밀번호 재설정 요청
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * 비밀번호 재설정 확인 요청
 */
export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}
/**
 * 회원가입 데이터 (클라이언트 측에서 사용)
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}