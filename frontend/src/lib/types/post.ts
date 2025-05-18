import { ID, Timestamps } from './common';
import { User } from './user';
import { Institution } from './institution';
import { Category } from './category';

/**
 * 게시물 이미지 타입
 */
export interface PostImage {
  id: ID;
  post_id: ID;
  image_url: string;
  created_at: string;
}

/**
 * 게시물 기본 타입
 */
export interface PostBase {
  title: string;
  content: string;
  institution_id?: ID | null;
  category_id?: ID | null;
}

/**
 * 게시물 생성 요청 타입
 */
export interface PostCreateRequest extends PostBase {
  // 추가 필드가 필요하면 여기에 정의
}

/**
 * 게시물 수정 요청 타입
 */
export interface PostUpdateRequest {
  title?: string;
  content?: string;
  institution_id?: ID | null;
  category_id?: ID | null;
  is_hidden?: boolean;
}

/**
 * 게시물 기본 응답 타입
 */
export interface Post extends PostBase, Timestamps {
  id: ID;
  user_id: ID;
  view_count: number;
  is_hidden: boolean;
}

/**
 * 게시물 상세 정보 타입
 */
export interface PostWithDetails extends Post {
  user: User;
  institution?: Institution | null;
  category?: Category | null;
  images: PostImage[];
  comment_count: number;
  like_count: number;
  dislike_count: number;
}

/**
 * 게시물 필터 타입
 */
// src/lib/types/post.ts의 PostFilter 인터페이스 수정
export interface PostFilter {
  skip?: number;
  limit?: number;
  page?: number;  // 추가된 속성
  category_id?: ID;
  institution_id?: ID;
  user_id?: ID;
  search?: string;
}

/**
 * 게시물 반응 응답 타입
 */
export interface PostReactionResponse {
  like_count?: number;
  dislike_count?: number;
}

/**
 * 게시물 신고 요청 타입
 */
export interface PostReportRequest {
  post_id: ID;
  reason: string;
  description?: string;
}