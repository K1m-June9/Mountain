// src/lib/services/post_service.ts
import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { 
  Post, 
  PostWithDetails, 
  PostCreateRequest, 
  PostUpdateRequest, 
  PostFilter,
  PostReactionResponse,
  PostImage,
  PostReportRequest
} from "../types/post";
import { ID, PaginatedData, PaginationParams } from "../types/common";

/**
 * 게시물 관련 서비스 함수들을 제공하는 클래스
 */
export class PostService {
  /**
   * 게시물 목록을 조회합니다.
   * @param filter 필터링 옵션 (페이지네이션, 카테고리, 기관 등)
   * @returns 게시물 목록
   */
  async getPosts(filter: PostFilter = {}): Promise<ApiResult<PaginatedData<PostWithDetails>>> {
    const { skip, limit = 50, category_id, institution_id, user_id } = filter;
    
    // page와 limit을 skip과 limit으로 변환
    const page = filter.page || 1;
    const calculatedSkip = skip !== undefined ? skip : (page - 1) * limit;
    
    const params: Record<string, any> = {
      skip: calculatedSkip,
      limit
    };
    
    if (category_id) params.category_id = category_id;
    if (institution_id) params.institution_id = institution_id;
    if (user_id) params.user_id = user_id;
    
    const result = await api.get<PostWithDetails[]>("/posts", params);
    
    // 백엔드 응답을 PaginatedData 형식으로 변환
    if (result.success && Array.isArray(result.data)) {
      return {
        success: true,
        data: {
          items: result.data,
          total: result.data.length, // 백엔드가 total을 제공하지 않으면 배열 길이 사용
          page: page,
          limit: limit
        },
        meta: result.meta
      };
    }
    
    return result as any;
  }

  // searchPosts 메서드 수정
  async searchPosts(query: string, filter: PostFilter = {}): Promise<ApiResult<PaginatedData<PostWithDetails>>> {
    // 검색어가 없으면 빈 결과 반환
    if (!query) {
      return {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: filter.limit || 50
        }
      };
    }
    
    const { skip, limit = 50, category_id, institution_id } = filter;
    
    // page와 limit을 skip과 limit으로 변환
    const page = filter.page || 1;
    const calculatedSkip = skip !== undefined ? skip : (page - 1) * limit;
    
    const params: Record<string, any> = {
      q: query,
      skip: calculatedSkip,
      limit,
      sort: filter.sortBy || 'recent'
    };
    
    if (category_id) params.category_id = category_id;
    if (institution_id) params.institution_id = institution_id;
    
    const result = await api.get<any>("/posts/search", params);
    
    // 백엔드 응답 처리
    if (result.success) {
      // 백엔드가 items, total, page, limit 형식으로 응답하는 경우
      if (result.data && 'items' in result.data) {
        return {
          success: true,
          data: {
            items: result.data.items,
            total: result.data.total,
            page: result.data.page,
            limit: result.data.limit
          },
          meta: result.meta
        };
      }
      
      // 백엔드가 배열로 응답하는 경우 (이전 버전 호환)
      if (Array.isArray(result.data)) {
        return {
          success: true,
          data: {
            items: result.data,
            total: result.data.length,
            page: page,
            limit: limit
          },
          meta: result.meta
        };
      }
    }
    
    return result as any;
  }

// 검색 제안 메서드 추가
async getSuggestions(query: string, limit: number = 5): Promise<ApiResult<any[]>> {
  if (!query || query.length < 2) {
    return {
      success: true,
      data: []
    };
  }
  
  return await api.get<any[]>("/posts/suggest", {
    q: query,
    limit
  });
}
  /**
   * 특정 게시물의 상세 정보를 조회합니다.
   * @param postId 게시물 ID
   * @returns 게시물 상세 정보
   */
  async getPostById(postId: ID): Promise<ApiResult<PostWithDetails>> {
    return await api.get<PostWithDetails>(`/posts/${postId}`);
  }

  /**
   * 새 게시물을 생성합니다.
   * @param postData 게시물 데이터
   * @returns 생성된 게시물 정보
   */
  async createPost(postData: PostCreateRequest): Promise<ApiResult<Post>> {
    return await api.post<Post>("/posts", postData);
  }

  /**
   * 게시물을 수정합니다.
   * @param postId 게시물 ID
   * @param postData 수정할 게시물 데이터
   * @returns 수정된 게시물 정보
   */
  async updatePost(postId: ID, postData: PostUpdateRequest): Promise<ApiResult<Post>> {
    return await api.put<Post>(`/posts/${postId}`, postData);
  }

  /**
   * 게시물을 삭제합니다.
   * @param postId 게시물 ID
   * @returns 삭제 결과
   */
  async deletePost(postId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>(`/posts/${postId}`);
  }

  /**
   * 게시물에 좋아요를 추가합니다.
   * @param postId 게시물 ID
   * @returns 좋아요 수
   */
  async likePost(postId: ID): Promise<ApiResult<PostReactionResponse>> {
    return await api.post<PostReactionResponse>(`/posts/${postId}/like`);
  }

  /**
   * 게시물 좋아요를 취소합니다.
   * @param postId 게시물 ID
   * @returns 좋아요 수
   */
  async unlikePost(postId: ID): Promise<ApiResult<PostReactionResponse>> {
    return await api.delete<PostReactionResponse>(`/posts/${postId}/like`);
  }

  /**
   * 게시물에 싫어요를 추가합니다.
   * @param postId 게시물 ID
   * @returns 싫어요 수
   */
  async dislikePost(postId: ID): Promise<ApiResult<PostReactionResponse>> {
    return await api.post<PostReactionResponse>(`/posts/${postId}/dislike`);
  }

  /**
   * 게시물 싫어요를 취소합니다.
   * @param postId 게시물 ID
   * @returns 싫어요 수
   */
  async undislikePost(postId: ID): Promise<ApiResult<PostReactionResponse>> {
    return await api.delete<PostReactionResponse>(`/posts/${postId}/dislike`);
  }

  /**
   * 게시물 이미지를 업로드합니다.
   * @param file 업로드할 이미지 파일
   * @returns 업로드된 이미지 정보
   */
  //함수 수정
  async uploadImage(file: File, post_id?: ID): Promise<ApiResult<PostImage>> {
    const formData = new FormData();
    formData.append('file', file);
    
    // post_id가 있으면 추가
    if (post_id) {
      formData.append('post_id', post_id.toString());
    }
    
    return await api.post<PostImage>("/posts/upload-image", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * 게시물을 신고합니다.
   * @param reportData 신고 데이터
   * @returns 신고 결과
   */
  async reportPost(reportData: PostReportRequest): Promise<ApiResult<{ success: boolean }>> {
    return await api.post<{ success: boolean }>("/reports", reportData);
  }

  /**
   * 특정 사용자가 좋아요한 게시물 목록을 조회합니다.
   * @param userId 사용자 ID
   * @param params 페이지네이션 파라미터
   * @returns 좋아요한 게시물 목록
   */
  async getLikedPostsByUser(userId: ID, params: PaginationParams = {}): Promise<ApiResult<PaginatedData<PostWithDetails>>> {
    const { skip, limit = 50 } = params;
    
    const queryParams: Record<string, any> = {
      skip,
      limit
    };
    
    const result = await api.get<PostWithDetails[]>(`/posts/liked-by/${userId}`, queryParams);
    
    // 백엔드 응답을 PaginatedData 형식으로 변환
    if (result.success && Array.isArray(result.data)) {
      // 페이지 계산 (skip과 limit으로부터)
      const page = skip !== undefined ? Math.floor(skip / limit) + 1 : 1;
      
      return {
        success: true,
        data: {
          items: result.data,
          total: result.data.length, // 백엔드가 total을 제공하지 않으면 배열 길이 사용
          page: page,
          limit: limit
        },
        meta: result.meta
      };
    }
    
    return result as any;
  }
}

// 싱글톤 인스턴스 생성
const postService = new PostService();
export default postService;