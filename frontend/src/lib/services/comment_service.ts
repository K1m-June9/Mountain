// src/lib/services/comment_service.ts

import { api } from "../api/client";
import type { ApiResult } from "../api/types";
import type { 
  Comment, 
  CommentWithUser, 
  CommentWithReplies,
  CommentCreate, 
  CommentUpdate, 
  CommentFilter,
  Reaction,
  ReportCreate,
  Report
} from "../types/comment";
import type { ID } from "../types/common";

/**
 * 댓글 관련 서비스 함수들을 제공하는 클래스
 */
export class CommentService {
  /**
   * 게시물의 댓글 목록 조회 (대댓글 포함)
   * @param postId 게시물 ID
   * @param params 페이지네이션 파라미터
   * @returns 댓글 목록 (대댓글 포함)
   */
  async getPostComments(
    postId: ID,
    params?: CommentFilter
  ): Promise<ApiResult<CommentWithReplies[]>> {
    return await api.get<CommentWithReplies[]>(`/comments/${postId}/comments`, params);
  }

  /**
   * 댓글 생성
   * @param commentData 댓글 생성 데이터
   * @returns 생성된 댓글 정보
   */
  async createComment(commentData: CommentCreate): Promise<ApiResult<Comment>> {
    return await api.post<Comment>("/comments", commentData);
  }

  /**
   * 댓글 수정
   * @param commentId 댓글 ID
   * @param updateData 업데이트할 댓글 데이터
   * @returns 업데이트된 댓글 정보
   */
  async updateComment(commentId: ID, updateData: CommentUpdate): Promise<ApiResult<Comment>> {
    return await api.put<Comment>(`/comments/${commentId}`, updateData);
  }

  /**
   * 댓글 삭제
   * @param commentId 댓글 ID
   * @returns 삭제된 댓글 정보
   */
  async deleteComment(commentId: ID): Promise<ApiResult<Comment>> {
    return await api.delete<Comment>(`/comments/${commentId}`);
  }

  /**
   * 댓글 좋아요
   * @param commentId 댓글 ID
   * @returns 좋아요 반응 정보
   */
  async likeComment(commentId: ID): Promise<ApiResult<Reaction>> {
    return await api.post<Reaction>(`/comments/${commentId}/like`);
  }

  /**
   * 댓글 싫어요
   * @param commentId 댓글 ID
   * @returns 싫어요 반응 정보
   */
  async dislikeComment(commentId: ID): Promise<ApiResult<Reaction>> {
    return await api.post<Reaction>(`/comments/${commentId}/dislike`);
  }

  /**
   * 댓글 신고
   * @param commentId 댓글 ID
   * @param reportData 신고 데이터
   * @returns 신고 정보
   */
  async reportComment(commentId: ID, reportData: ReportCreate): Promise<ApiResult<Report>> {
    return await api.post<Report>(`/comments/${commentId}/report`, reportData);
  }

  /**
   * 특정 댓글의 답글 목록 조회
   * @param commentId 댓글 ID
   * @param params 페이지네이션 파라미터
   * @returns 답글 목록
   */
  async getCommentReplies(
    commentId: ID,
    params?: CommentFilter
  ): Promise<ApiResult<CommentWithUser[]>> {
    return await api.get<CommentWithUser[]>(`/comments/${commentId}/replies`, params);
  }

  /**
   * 사용자 반응 상태 확인 (좋아요/싫어요 여부)
   * 
   * 참고: 이 기능은 백엔드에 직접적인 엔드포인트가 없으므로,
   * 프론트엔드에서 댓글 데이터를 처리할 때 사용자 반응 상태를 계산하는 유틸리티 함수입니다.
   * 
   * @param comments 댓글 목록
   * @param userId 현재 사용자 ID
   * @returns 사용자 반응 상태가 추가된 댓글 목록
   */
  processUserReactions<T extends CommentWithUser>(
    comments: T[],
    userId?: ID | null
  ): T[] {
    if (!userId) return comments;
    
    // 이 함수는 백엔드에서 제공하지 않는 기능이므로 프론트엔드에서 구현해야 합니다.
    // 실제 구현은 백엔드에서 사용자의 반응 정보를 제공하는 방식에 따라 달라질 수 있습니다.
    
    return comments;
  }
}

// 싱글톤 인스턴스 생성
const commentService = new CommentService();
export default commentService;