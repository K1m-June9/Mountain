// lib/api/index.ts

// API 클라이언트 및 토큰 관리 함수 내보내기
export { default as api, setToken, getToken, removeToken } from '@/lib/api';

// 인증 관련 API 함수 내보내기
export * from './auth';

// 사용자 관련 API 함수 내보내기
export * from './users';

// 게시물 관련 API 함수 내보내기
export * from './posts';