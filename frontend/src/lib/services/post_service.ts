// src/lib/services/post_service.ts

import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { 
  Post, 
  PostWithDetails, 
  PostCreateRequest, 
  PostUpdateRequest, 
  PostFilter,
  PostImage
} from "../types/post";
import type { PaginatedData, PaginationParams, ID } from "../types/common";
import type { CommentWithUser, CommentFilter } from "../types/comment";

/**
 * 게시물 관련 서비스 함수들을 제공하는 클래스
 */
export class PostService {
  /**
   * 게시물 목록 조회
   * @param filters 필터링 옵션
   * @returns 페이지네이션된 게시물 목록
   */
  // async getPosts(filters?: PostFilter): Promise<ApiResult<PaginatedData<PostWithDetails>>> {
  //   return await api.get<PaginatedData<PostWithDetails>>("/posts", filters);
  // }
  // async getPosts(filters?: PostFilter): Promise<ApiResult<PaginatedData<PostWithDetails>>> {
  // // page 파라미터를 skip으로 변환
  //   const params = { ...filters };
  //   if (params.page) {
  //     params.skip = (params.page - 1) * (params.limit || 10);
  //     delete params.page;
  //   }
    
  //   return await api.get<PaginatedData<PostWithDetails>>("/posts", params);
  // }
  // src/lib/services/post_service.ts의 getPosts 메서드 수정
  async getPosts(filters?: PostFilter): Promise<ApiResult<PaginatedData<PostWithDetails>>> {
    // page 파라미터를 skip으로 변환
    const params = { ...filters };
    if (params.page) {
      params.skip = (params.page - 1) * (params.limit || 10);
      delete params.page;
    }
    
    const result = await api.get<PostWithDetails[]>("/posts", params);
    
    // 백엔드 응답을 PaginatedData 형식으로 변환
    if (result.success && Array.isArray(result.data)) {
      return {
        success: true,
        data: {
          items: result.data,
          total: result.data.length,
          page: filters?.page || 1,
          limit: filters?.limit || 10
        },
        meta: result.meta
      };
    }
    
    return result as any;
  }

  /**
   * 특정 게시물 조회
   * @param postId 게시물 ID
   * @returns 게시물 상세 정보
   */
  async getPost(postId: ID): Promise<ApiResult<PostWithDetails>> {
    return await api.get<PostWithDetails>(`/posts/${postId}`);
  }

  /**
   * post-detail.tsx와의 호환성을 위한 별칭 함수
   * @param postId 게시물 ID
   * @returns 게시물 상세 정보
   */
  async getPostById(postId: ID): Promise<ApiResult<PostWithDetails>> {
    return this.getPost(postId);
  }

  /**
   * 게시물 생성
   * @param postData 게시물 생성 데이터
   * @returns 생성된 게시물 정보
   */
  async createPost(postData: PostCreateRequest): Promise<ApiResult<Post>> {
    return await api.post<Post>("/posts", postData);
  }

  /**
   * 게시물 업데이트
   * @param postId 게시물 ID
   * @param postData 업데이트할 게시물 데이터
   * @returns 업데이트된 게시물 정보
   */
  async updatePost(postId: ID, postData: PostUpdateRequest): Promise<ApiResult<Post>> {
    return await api.put<Post>(`/posts/${postId}`, postData);
  }

  /**
   * 게시물 삭제
   * @param postId 게시물 ID
   * @returns 삭제 결과
   */
  async deletePost(postId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>(`/posts/${postId}`);
  }

  /**
   * 게시물 좋아요
   * @param postId 게시물 ID
   * @returns 좋아요 결과
   */
  async likePost(postId: ID): Promise<ApiResult<{ like_count: number }>> {
    return await api.post<{ like_count: number }>(`/posts/${postId}/like`);
  }

  /**
   * 게시물 좋아요 취소
   * @param postId 게시물 ID
   * @returns 좋아요 취소 결과
   */
  async unlikePost(postId: ID): Promise<ApiResult<{ like_count: number }>> {
    return await api.delete<{ like_count: number }>(`/posts/${postId}/like`);
  }

  /**
   * 게시물 싫어요
   * @param postId 게시물 ID
   * @returns 싫어요 결과
   */
  async dislikePost(postId: ID): Promise<ApiResult<{ dislike_count: number }>> {
    return await api.post<{ dislike_count: number }>(`/posts/${postId}/dislike`);
  }

  /**
   * 게시물 싫어요 취소
   * @param postId 게시물 ID
   * @returns 싫어요 취소 결과
   */
  async undislikePost(postId: ID): Promise<ApiResult<{ dislike_count: number }>> {
    return await api.delete<{ dislike_count: number }>(`/posts/${postId}/dislike`);
  }

  /**
   * 게시물의 댓글 목록 조회
   * @param postId 게시물 ID
   * @param params 페이지네이션 파라미터
   * @returns 페이지네이션된 댓글 목록
   */
  async getPostComments(
    postId: ID,
    params?: PaginationParams
  ): Promise<ApiResult<PaginatedData<CommentWithUser>>> {
    return await api.get<PaginatedData<CommentWithUser>>(`/posts/${postId}/comments`, params);
  }

  /**
   * post-detail.tsx와의 호환성을 위한 별칭 함수
   * @param postId 게시물 ID
   * @param params 페이지네이션 파라미터
   * @returns 페이지네이션된 댓글 목록
   */
  async getCommentsByPostId(
    postId: ID,
    params?: PaginationParams
  ): Promise<ApiResult<PaginatedData<CommentWithUser>>> {
    return this.getPostComments(postId, params);
  }

  /**
   * 게시물 검색
   * @param query 검색어
   * @param params 추가 파라미터
   * @returns 페이지네이션된 게시물 목록
   */
  async searchPosts(
    query: string,
    params?: { page?: number; limit?: number; category_id?: ID }
  ): Promise<ApiResult<PaginatedData<PostWithDetails>>> {
    return await api.get<PaginatedData<PostWithDetails>>("/posts/search", {
      search: query,
      ...params,
    });
  }

  /**
   * 관리자용 게시물 숨김 처리
   * @param postId 게시물 ID
   * @returns 처리 결과
   */
  async hidePost(postId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.put<{ success: boolean }>(`/admin/posts/${postId}/hide`);
  }

  /**
   * 관리자용 게시물 숨김 해제
   * @param postId 게시물 ID
   * @returns 처리 결과
   */
  async unhidePost(postId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.put<{ success: boolean }>(`/admin/posts/${postId}/unhide`);
  }
  
  /**
   * 공지사항 목록 조회
   * @returns 페이지네이션된 공지사항 목록
   */
  async getNotices(): Promise<ApiResult<PaginatedData<PostWithDetails>>> {
    return await api.get<PaginatedData<PostWithDetails>>("/notices");
  }

  /**
   * 게시물 이미지 업로드
   * @param postId 게시물 ID
   * @param imageFile 이미지 파일
   * @returns 업로드된 이미지 정보
   */
  async uploadPostImage(postId: ID, imageFile: File): Promise<ApiResult<PostImage>> {
    const formData = new FormData();
    formData.append("image", imageFile);

    return await api.post<PostImage>(`/posts/${postId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 게시물 이미지 삭제
   * @param imageId 이미지 ID
   * @returns 삭제 결과
   */
  async deletePostImage(imageId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>(`/post-images/${imageId}`);
  }
  /**
   * 특정 사용자가 좋아요한 게시물 목록을 조회합니다.
   * @param userId 사용자 ID
   * @param params 페이지네이션 파라미터
   * @returns 페이지네이션된 게시물 목록
   */
  async getLikedPostsByUser(userId: number, params: PaginationParams): Promise<ApiResult<PaginatedData<Post>>> {
    return await api.get<PaginatedData<Post>>(`/users/${userId}/liked-posts`, params);
  }
}

// 싱글톤 인스턴스 생성
const postService = new PostService();
export default postService;