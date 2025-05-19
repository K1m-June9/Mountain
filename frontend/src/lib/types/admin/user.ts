// src/lib/types/admin/user.ts

import { ID, Timestamps, Role } from '../common';
import { User } from '../user';

/**
 * 사용자 상태 타입
 */
export type UserStatus = "active" | "inactive" | "suspended";

/**
 * 관리자 화면용 사용자 상세 정보 타입
 */
export interface AdminUserDetail extends User {
  status: UserStatus;
  suspended_until?: string;
  post_count: number;
  comment_count: number;
  like_count: number;
  dislike_count: number;
  last_active?: string;
}

/**
 * 사용자 활동 타입
 */
export interface UserActivity extends Timestamps {
  id: ID;
  user_id: ID;
  action_type: string;
  description: string;
  ip_address?: string;
}

/**
 * 제재 이력 타입
 */
export interface RestrictionHistory extends Timestamps {
  id: ID;
  user_id: ID;
  type: "suspend" | "unsuspend";
  reason: string;
  duration?: number;
  suspended_until?: string;
  created_by: ID;
}

/**
 * 사용자 상태 업데이트 요청
 */
export interface UserStatusUpdateRequest {
  status: UserStatus;
  suspended_until?: string | null;
  reason: string;
  duration?: number | null;
}

/**
 * 사용자 역할 업데이트 요청
 */
export interface UserRoleUpdateRequest {
  role: Role;
}

/**
 * 사용자 활동 응답
 */
export interface UserActivitiesResponse {
  activities: UserActivity[];
  total: number;
}

/**
 * 사용자 관리 필터
 */
export interface AdminUserFilter {
  search?: string;
  role?: Role;
  status?: UserStatus;
  page?: number;
  limit?: number;
}