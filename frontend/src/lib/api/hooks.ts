// src/lib/api/hooks.ts
import { useState, useEffect, useCallback } from 'react';
import { ApiResult, ApiError } from './types';
import { logApiError } from './utils';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  initialData?: T;
  deps?: any[];
  skipInitialFetch?: boolean;
}

/**
 * API 요청을 위한 React 훅
 */
export function useApi<T>(
  apiCall: () => Promise<ApiResult<T>>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [isLoading, setIsLoading] = useState(!options.skipInitialFetch);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      
      if (result.success && result.data) {
        setData(result.data);
        options.onSuccess?.(result.data);
      } else if (result.error) {
        setError(result.error);
        options.onError?.(result.error);
        logApiError('useApi', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      const apiError: ApiError = { 
        code: 'UNKNOWN_ERROR', 
        message: errorMessage 
      };
      setError(apiError);
      options.onError?.(apiError);
      logApiError('useApi', apiError);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, options.onSuccess, options.onError]);

  useEffect(() => {
    if (!options.skipInitialFetch) {
      execute();
    }
  }, options.deps || []);

  return {
    data,
    isLoading,
    error,
    execute,
    setData,
  };
}

/**
 * API 요청을 위한 React 훅 (수동 실행)
 */
export function useLazyApi<T, P extends any[]>(
  apiCall: (...params: P) => Promise<ApiResult<T>>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (...params: P) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall(...params);
      
      if (result.success && result.data) {
        setData(result.data);
        options.onSuccess?.(result.data);
        return { success: true, data: result.data };
      } else if (result.error) {
        setError(result.error);
        options.onError?.(result.error);
        logApiError('useLazyApi', result.error);
        return { success: false, error: result.error };
      }
      
      return { success: false };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      const apiError: ApiError = { 
        code: 'UNKNOWN_ERROR', 
        message: errorMessage 
      };
      setError(apiError);
      options.onError?.(apiError);
      logApiError('useLazyApi', apiError);
      return { success: false, error: apiError };
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, options.onSuccess, options.onError]);

  return {
    data,
    isLoading,
    error,
    execute,
    setData,
  };
}