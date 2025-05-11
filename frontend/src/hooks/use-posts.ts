import { useState } from 'react';
import api from '@/lib/api';
import type { Post, PostCreateInput, Comment } from '@/types/post';

export function usePosts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPosts = async (page = 1, institution?: string) => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page };
      if (institution) {
        params.institution = institution;
      }
      
      const response = await api.get<{ items: Post[]; total: number }>('/posts/', { params });
      return response.data;
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      setError(err.response?.data?.detail || '게시물을 불러오는데 실패했습니다.');
      return { items: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const getPost = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get<Post>(`/posts/${id}`);
      return response.data;
    } catch (err: any) {
      console.error(`Failed to fetch post ${id}:`, err);
      setError(err.response?.data?.detail || '게시물을 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (data: PostCreateInput) => {
    try {
      setLoading(true);
      const response = await api.post<Post>('/posts/', data);
      return response.data;
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.response?.data?.detail || '게시물 작성에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getComments = async (postId: number) => {
    try {
      setLoading(true);
      const response = await api.get<Comment[]>(`/posts/${postId}/comments`);
      return response.data;
    } catch (err: any) {
      console.error(`Failed to fetch comments for post ${postId}:`, err);
      setError(err.response?.data?.detail || '댓글을 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (postId: number, content: string, parentId?: number) => {
    try {
      setLoading(true);
      const data: any = { content };
      if (parentId) {
        data.parent_id = parentId;
      }
      
      const response = await api.post<Comment>(`/posts/${postId}/comments`, data);
      return response.data;
    } catch (err: any) {
      console.error('Failed to create comment:', err);
      setError(err.response?.data?.detail || '댓글 작성에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPosts,
    getPost,
    createPost,
    getComments,
    createComment,
  };
}