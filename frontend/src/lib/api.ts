// lib/api.ts

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 토큰 관련 타입
interface TokenData {
  access_token: string;
  token_type: string;
}

// 요청 설정에 _retry 속성 추가를 위한 인터페이스 확장
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 토큰 저장 함수
export const setToken = (tokenData: TokenData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', tokenData.access_token);
    localStorage.setItem('token_type', tokenData.token_type);
  }
};

// 토큰 가져오기 함수
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// 토큰 타입 가져오기 함수
export const getTokenType = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token_type') || 'Bearer';
  }
  return 'Bearer';
};

// 토큰 제거 함수
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
  }
};

// API 클라이언트 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getToken();
    const tokenType = getTokenType();
    
    if (token && config.headers) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    // 401 에러이고 토큰 만료인 경우 토큰 갱신 시도
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 갱신 API 호출 (백엔드에 해당 엔드포인트가 있어야 함)
        const response = await axios.post<TokenData>(`${API_URL}/auth/refresh-token`, {}, {
          withCredentials: true,
        });
        
        if (response.data.access_token) {
          // 새 토큰 저장
          setToken(response.data);
          
          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `${getTokenType()} ${response.data.access_token}`;
          }
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        removeToken();
        
        // 브라우저 환경에서만 리다이렉트
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;