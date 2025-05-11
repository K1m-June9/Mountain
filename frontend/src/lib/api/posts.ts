// lib/api/posts.ts

import api from '@/lib/api';

// 게시물 목록 조회 API
export const getPosts = async (params: { 
  skip?: number; 
  limit?: number; 
  institution_id?: number;
  category_id?: number;
  search?: string;
}) => {
  const response = await api.get('/posts/', { params });
  return response.data;
};

// 게시물 상세 조회 API
export const getPostById = async (id: number) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

// 게시물 작성 API
export const createPost = async (data: {
  title: string;
  content: string;
  institution_id: number;
  category_id: number;
  is_anonymous?: boolean;
}) => {
  const response = await api.post('/posts/', data);
  return response.data;
};

// 게시물 수정 API
export const updatePost = async (id: number, data: {
  title?: string;
  content?: string;
  institution_id?: number;
  category_id?: number;
  is_anonymous?: boolean;
}) => {
  const response = await api.put(`/posts/${id}`, data);
  return response.data;
};

// 게시물 삭제 API
export const deletePost = async (id: number) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

// 게시물 좋아요 API
export const likePost = async (id: number) => {
  const response = await api.post(`/posts/${id}/like`);
  return response.data;
};

// 게시물 싫어요 API
export const dislikePost = async (id: number) => {
  const response = await api.post(`/posts/${id}/dislike`);
  return response.data;
};

// 게시물 신고 API
export const reportPost = async (id: number, data: {
  reason: string;
  description?: string;
}) => {
  const response = await api.post(`/posts/${id}/report`, data);
  return response.data;
};