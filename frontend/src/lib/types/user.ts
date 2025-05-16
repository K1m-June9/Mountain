// src/lib/types/user.ts

import { ID, Timestamps, Role } from './common';

/**
 * 사용자 관련 타입 정의
 */

/**
 * 사용자 기본 정보
 */
export interface User extends Timestamps {
  id: ID;
  username: string;
  email: string;
  role: Role;
  nickname?: string;
  bio?: string;
  // created_at과 updated_at은 Timestamps에서 상속됨
}

/**
 * 사용자 생성 요청
 */
export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  bio?: string;
}

/**
 * 사용자 업데이트 요청
 */
export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  nickname?: string;
  bio?: string;
}

/**
 * 사용자 필터
 */
export interface UserFilter {
  search?: string;
  role?: Role;
  skip?: number;
  limit?: number;
}

// 이 인터페이스들은 auth.ts로 이동해야 함
// LoginRequest, TokenResponse는 제거