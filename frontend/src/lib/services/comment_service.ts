// src/lib/services/comment_service.ts

import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { 
  Comment, 
  CommentWithUser, 
  CommentWithReplies,
  CommentCreateRequest, 
  CommentUpdateRequest, 
  CommentFilter 
} from "../types/comment";
import type { PaginatedData, PaginationParams, ID } from "../types/common";

/**
 * 댓글 관련 서비스 함수들을 제공하는 클래스
 */
export class CommentService {
  /**
   * 댓글 목록 조회
   * @param filters 필터링 옵션
   * @returns 페이지네이션된 댓글 목록
   */
  async getComments(filters?: CommentFilter): Promise<ApiResult<PaginatedData<CommentWithUser>>> {
    return await api.get<PaginatedData<CommentWithUser>>("/comments", filters);
  }

  /**
   * 특정 댓글 조회
   * @param commentId 댓글 ID
   * @returns 댓글 정보
   */
  async getComment(commentId: ID): Promise<ApiResult<CommentWithUser>> {
    return await api.get<CommentWithUser>(`/comments/${commentId}`);
  }

  /**
   * 댓글 생성
   * @param commentData 댓글 생성 데이터
   * @returns 생성된 댓글 정보
   */
  async createComment(commentData: CommentCreateRequest): Promise<ApiResult<Comment>> {
    return await api.post<Comment>("/comments", commentData);
  }

  /**
   * 댓글 업데이트
   * @param commentId 댓글 ID
   * @param updateData 업데이트할 댓글 데이터
   * @returns 업데이트된 댓글 정보
   */
  async updateComment(commentId: ID, updateData: CommentUpdateRequest): Promise<ApiResult<Comment>> {
    return await api.put<Comment>(`/comments/${commentId}`, updateData);
  }

  /**
   * 댓글 삭제
   * @param commentId 댓글 ID
   * @returns 삭제 결과
   */
  async deleteComment(commentId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.delete<{ success: boolean }>(`/comments/${commentId}`);
  }

  /**
   * 댓글 좋아요
   * @param commentId 댓글 ID
   * @returns 좋아요 결과
   */
  async likeComment(commentId: ID): Promise<ApiResult<{ like_count: number }>> {
    return await api.post<{ like_count: number }>(`/comments/${commentId}/like`);
  }

  /**
   * 댓글 좋아요 취소
   * @param commentId 댓글 ID
   * @returns 좋아요 취소 결과
   */
  async unlikeComment(commentId: ID): Promise<ApiResult<{ like_count: number }>> {
    return await api.delete<{ like_count: number }>(`/comments/${commentId}/like`);
  }

  /**
   * 댓글 싫어요
   * @param commentId 댓글 ID
   * @returns 싫어요 결과
   */
  async dislikeComment(commentId: ID): Promise<ApiResult<{ dislike_count: number }>> {
    return await api.post<{ dislike_count: number }>(`/comments/${commentId}/dislike`);
  }

  /**
   * 댓글 싫어요 취소
   * @param commentId 댓글 ID
   * @returns 싫어요 취소 결과
   */
  async undislikeComment(commentId: ID): Promise<ApiResult<{ dislike_count: number }>> {
    return await api.delete<{ dislike_count: number }>(`/comments/${commentId}/dislike`);
  }

  /**
   * 댓글의 답글 목록 조회
   * @param commentId 댓글 ID
   * @param params 페이지네이션 파라미터
   * @returns 페이지네이션된 답글 목록
   */
  async getCommentReplies(
    commentId: ID,
    params?: PaginationParams
  ): Promise<ApiResult<PaginatedData<CommentWithUser>>> {
    return await api.get<PaginatedData<CommentWithUser>>(`/comments/${commentId}/replies`, params);
  }

  /**
   * 게시물의 댓글 목록 조회
   * @param postId 게시물 ID
   * @param params 페이지네이션 파라미터
   * @returns 페이지네이션된 댓글 목록
   */
  async getCommentsByPostId(
    postId: ID,
    params?: PaginationParams
  ): Promise<ApiResult<PaginatedData<CommentWithReplies>>> {
    return await api.get<PaginatedData<CommentWithReplies>>(`/posts/${postId}/comments`, params);
  }

  /**
   * 관리자용 모든 댓글 조회
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @param status 상태 필터
   * @param search 검색어
   * @returns 관리자용 댓글 목록
   */
  async getAllComments(
    page: number = 1, 
    limit: number = 10, 
    status: string = "all", 
    search: string = ""
  ): Promise<ApiResult<{
    comments: CommentWithUser[];
    totalPages: number;
    totalItems: number;
  }>> {
    const params = {
      page,
      limit,
      ...(status && status !== "all" ? { status } : {}),
      ...(search ? { search } : {})
    };

    return await api.get<{
      comments: CommentWithUser[];
      totalPages: number;
      totalItems: number;
    }>("/admin/comments", params);
  }

  /**
   * 댓글 숨김 처리
   * @param commentId 댓글 ID
   * @returns 처리 결과
   */
  async hideComment(commentId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.put<{ success: boolean }>(`/admin/comments/${commentId}/hide`);
  }

  /**
   * 댓글 숨김 해제
   * @param commentId 댓글 ID
   * @returns 처리 결과
   */
  async unhideComment(commentId: ID): Promise<ApiResult<{ success: boolean }>> {
    return await api.put<{ success: boolean }>(`/admin/comments/${commentId}/unhide`);
  }
    /**
   * 사용자가 작성한 댓글 목록 조회
   * @param userId 사용자 ID
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @returns 페이지네이션된 댓글 목록
   */
  async getUserComments(
    userId: ID,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResult<PaginatedData<CommentWithUser & { post_title: string }>>> {
    const skip = (page - 1) * limit;
    return await api.get<PaginatedData<CommentWithUser & { post_title: string }>>(
      `/users/${userId}/comments`,
      { skip, limit }
    );
  }
}

// 싱글톤 인스턴스 생성
const commentService = new CommentService();
export default commentService;