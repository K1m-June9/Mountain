// src/lib/api/utils.ts
import { ApiError } from './types';
import { PaginationParams } from '../types/common';

/**
 * API 에러 메시지를 사용자 친화적인 메시지로 변환
 */
export function getErrorMessage(error: ApiError | null | undefined): string {
  if (!error) return '알 수 없는 오류가 발생했습니다.';
  
  // 에러 코드에 따른 사용자 친화적인 메시지 매핑
  const errorMessages: Record<string, string> = {
    'UNAUTHORIZED': '로그인이 필요합니다.',
    'FORBIDDEN': '접근 권한이 없습니다.',
    'NOT_FOUND': '요청한 리소스를 찾을 수 없습니다.',
    'VALIDATION_ERROR': '입력 데이터가 유효하지 않습니다.',
    'NETWORK_ERROR': '네트워크 연결을 확인해주세요.',
    'SERVER_ERROR': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    'UNKNOWN_ERROR': '알 수 없는 오류가 발생했습니다.',
    'PARSE_ERROR': '데이터 처리 중 오류가 발생했습니다.',
    'REQUEST_ABORTED': '요청이 취소되었습니다.',
  };
  
  return errorMessages[error.code] || error.message || '알 수 없는 오류가 발생했습니다.';
}

/**
 * API 에러를 콘솔에 로깅
 */
export function logApiError(context: string, error: ApiError | null | undefined): void {
  if (!error) return;
  
  console.error(`API Error (${context}):`, {
    code: error.code,
    message: error.message,
    details: error.details,
  });
}

/**
 * 페이지네이션 파라미터 생성
 */
export function createPaginationParams(
  page: number = 1, 
  limit: number = 10, 
  sortBy?: string, 
  sortOrder?: 'asc' | 'desc',
  filters?: Record<string, any>
): PaginationParams & Record<string, any> {
  // 백엔드 API는 skip/limit을 사용하므로 page를 skip으로 변환
  const skip = (page - 1) * limit;
  
  return {
    skip,
    limit,
    ...(sortBy ? { sort: sortBy } : {}),
    ...(sortOrder ? { order: sortOrder } : {}),
    ...filters
  };
}