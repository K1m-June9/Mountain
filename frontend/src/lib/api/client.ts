// src/lib/api/client.ts
import { 
  ApiResponse, 
  ApiError, 
  ApiResult, 
  RequestOptions, 
  AuthResponse 
} from './types';
import { STORAGE_KEYS, getLocalStorage, setLocalStorage, removeLocalStorage } from "../utils/storage";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * API 클라이언트 클래스
 * HTTP 요청 처리, 토큰 관리, 에러 처리 등을 담당합니다.
 */
class ApiClient {
  private abortControllers: Map<string, AbortController> = new Map();

  /**
   * HTTP GET 요청
   */
  async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<ApiResult<T>> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>("GET", url, undefined, options);
  }

  /**
   * HTTP POST 요청
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResult<T>> {
    const url = this.buildUrl(endpoint);
    return this.request<T>("POST", url, data, options);
  }

  /**
   * HTTP PUT 요청
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResult<T>> {
    const url = this.buildUrl(endpoint);
    return this.request<T>("PUT", url, data, options);
  }

  /**
   * HTTP DELETE 요청
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResult<T>> {
    const url = this.buildUrl(endpoint);
    return this.request<T>("DELETE", url, undefined, options);
  }

  /**
   * 요청 취소
   */
  cancelRequest(endpoint: string): void {
    const controller = this.abortControllers.get(endpoint);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(endpoint);
    }
  }

  /**
   * 모든 요청 취소
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * HTTP 요청 공통 처리
   */
  private async request<T>(
    method: string, 
    url: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<ApiResult<T>> {
    const requestId = `${method}:${url}`;
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options?.headers || {})
        
      };

      // 인증 토큰 추가
      const token = this.getAccessToken();
      console.log('Using token:', token ? 'Token exists' : 'No token');

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log('Authorization header set');
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        credentials: "include",
        signal: options?.signal || controller.signal,
        cache: options?.cache,
      };

      // client.ts의 request 메서드 내부 수정
      if (data) {
        // FormData 객체 처리 추가
        if (data instanceof FormData) {
          // FormData는 Content-Type 헤더를 자동으로 설정하도록 함
          // 브라우저가 자동으로 boundary를 추가함
          delete headers["Content-Type"];
          requestOptions.body = data;
        }
        // URLSearchParams 처리 (기존 코드)
        else if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
          if (data instanceof URLSearchParams) {
            requestOptions.body = data;
          } else {
            const formData = new URLSearchParams();
            Object.entries(data).forEach(([key, value]) => {
              formData.append(key, String(value));
            });
            requestOptions.body = formData;
          }
        }
        // 기본 JSON 처리 (기존 코드)
        else {
          requestOptions.body = JSON.stringify(data);
        }
      }

      // 요청 시작 시간 기록 (디버깅용)
      const startTime = performance.now();
      
      let response = await fetch(url, requestOptions);
      
      // 요청 완료 시간 기록 (디버깅용)
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // 개발 환경에서만 로깅
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚀 API ${method} ${url}`);
        console.log(`Status: ${response.status}`);
        console.log(`Duration: ${duration}ms`);
        console.groupEnd();
        console.log('Sending request:', {
          method,
          url,
          headers: requestOptions.headers,
          body: data ? JSON.stringify(data) : undefined
        });
      }

      // 401 에러 시 로그아웃 처리
      if (response.status === 401) {
        this.clearTokens();
        return {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "인증이 필요합니다. 다시 로그인해주세요."
          }
        };
      }

      // 응답 데이터 파싱
      let responseData: any;
      try {
        responseData = await response.json();
      } catch (e) {
        // JSON 파싱 실패 시 빈 응답 생성
        responseData = {};
      }

      // 에러 응답 처리
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_ERROR_${response.status}`,
            message: responseData.detail || `HTTP 오류: ${response.status} ${response.statusText}`,
            details: responseData
          }
        };
      }

      // 성공 응답 처리
      return {
        success: true,
        data: responseData as T
      };
    } catch (error) {
      // 요청 취소 에러는 무시
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: "REQUEST_ABORTED",
            message: "요청이 취소되었습니다."
          }
        };
      }

      // 네트워크 오류 등 기타 예외 처리
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
          details: error
        }
      };
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * URL 생성
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // API_BASE_URL에 /api 경로를 추가하는 대신, URL 객체를 올바르게 생성
    const baseUrl = API_BASE_URL;
    const apiPath = `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const url = new URL(apiPath, baseUrl);
    // 끝에 슬래시(/) 추가
    // const apiPath = `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}${endpoint.endsWith("/") ? "" : "/"}`;
    // const url = new URL(apiPath, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * 액세스 토큰 가져오기
   */
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return getLocalStorage(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * 토큰 저장
   */
  setToken(token: string): void {
    if (typeof window === "undefined") return;
    setLocalStorage(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * 토큰 삭제
   */
  clearTokens(): void {
    if (typeof window === "undefined") return;
    removeLocalStorage(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * 사용자가 로그인되어 있는지 확인
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// API 클라이언트 싱글톤 인스턴스
export const api = new ApiClient();

// 기존 default export도 유지 (하위 호환성을 위해)
export default api;