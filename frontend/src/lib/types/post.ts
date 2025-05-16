// src/lib/types/post.ts

import { ID, Timestamps, BaseFilter } from './common';
import { User } from './user';
import { Institution } from './institution';
import { Category } from './category';

/**
 * 게시물 관련 타입 정의
 */

/**
 * 게시물 이미지
 */
export interface PostImage {
  id: ID;
  post_id: ID;
  image_url: string;
  created_at: string;
}

/**
 * 게시물 기본 정보
 */
export interface Post extends Timestamps {
  id: ID;
  title: string;
  content: string;
  user_id: ID;
  institution_id?: ID;
  category_id?: ID;
  view_count: number;
  is_hidden: boolean;
}

/**
 * 게시물 상세 정보 (API 응답)
 */
export interface PostWithDetails extends Post {
  user: User;
  institution?: Institution;
  category?: Category;
  images: PostImage[];
  comment_count: number;
  like_count: number;
  dislike_count: number;
}

/**
 * 게시물 생성 요청
 */
export interface PostCreateRequest {
  title: string;
  content: string;
  institution_id?: ID;
  category_id?: ID;
}

/**
 * 게시물 업데이트 요청
 */
export interface PostUpdateRequest {
  title?: string;
  content?: string;
  institution_id?: ID;
  category_id?: ID;
  is_hidden?: boolean;
}

/**
 * 게시물 필터
 */
export interface PostFilter extends BaseFilter {
  category_id?: ID;
  institution_id?: ID;
  user_id?: ID;
}

/**
 * 게시물 이미지 업로드 요청
 */
export interface PostImageUploadRequest {
  post_id: ID;
  image: File;
}