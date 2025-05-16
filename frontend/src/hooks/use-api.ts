"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api/client"
import type { ApiError, ApiResult } from "@/lib/api/types"
import type { PaginationParams } from "@/lib/types/common"

interface UseApiOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  defaultErrorMessage?: string
}

/**
 * API 요청을 위한 커스텀 훅
 */
export function useApi<T = any>(options: UseApiOptions = {}) {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = "요청이 성공적으로 처리되었습니다.",
    defaultErrorMessage = "요청 처리 중 오류가 발생했습니다.",
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [data, setData] = useState<T | null>(null)

  /**
   * GET 요청 처리
   */
  const get = useCallback(
    async (endpoint: string, params?: Record<string, any>): Promise<ApiResult<T> | null> => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.get<T>(endpoint, params)
        
        if (result.success && result.data) {
          setData(result.data)
          
          if (showSuccessToast) {
            toast.success(successMessage)
          }
        } else if (result.error) {
          setError(result.error)
          
          if (showErrorToast) {
            toast.error(result.error.message || defaultErrorMessage)
          }
        }

        return result
      } catch (err) {
        console.error("API request failed:", err)
        
        const apiError: ApiError = {
          code: "UNKNOWN_ERROR",
          message: err instanceof Error ? err.message : defaultErrorMessage
        }
        
        setError(apiError)

        if (showErrorToast) {
          toast.error(apiError.message || defaultErrorMessage)
        }

        return {
          success: false,
          error: apiError
        }
      } finally {
        setLoading(false)
      }
    },
    [showSuccessToast, showErrorToast, successMessage, defaultErrorMessage],
  )

  /**
   * POST 요청 처리
   */
  const post = useCallback(
    async (endpoint: string, requestData?: any): Promise<ApiResult<T> | null> => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.post<T>(endpoint, requestData)
        
        if (result.success && result.data) {
          setData(result.data)
          
          if (showSuccessToast) {
            toast.success(successMessage)
          }
        } else if (result.error) {
          setError(result.error)
          
          if (showErrorToast) {
            toast.error(result.error.message || defaultErrorMessage)
          }
        }

        return result
      } catch (err) {
        console.error("API request failed:", err)
        
        const apiError: ApiError = {
          code: "UNKNOWN_ERROR",
          message: err instanceof Error ? err.message : defaultErrorMessage
        }
        
        setError(apiError)

        if (showErrorToast) {
          toast.error(apiError.message || defaultErrorMessage)
        }

        return {
          success: false,
          error: apiError
        }
      } finally {
        setLoading(false)
      }
    },
    [showSuccessToast, showErrorToast, successMessage, defaultErrorMessage],
  )

  /**
   * PUT 요청 처리
   */
  const put = useCallback(
    async (endpoint: string, requestData?: any): Promise<ApiResult<T> | null> => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.put<T>(endpoint, requestData)
        
        if (result.success && result.data) {
          setData(result.data)
          
          if (showSuccessToast) {
            toast.success(successMessage)
          }
        } else if (result.error) {
          setError(result.error)
          
          if (showErrorToast) {
            toast.error(result.error.message || defaultErrorMessage)
          }
        }

        return result
      } catch (err) {
        console.error("API request failed:", err)
        
        const apiError: ApiError = {
          code: "UNKNOWN_ERROR",
          message: err instanceof Error ? err.message : defaultErrorMessage
        }
        
        setError(apiError)

        if (showErrorToast) {
          toast.error(apiError.message || defaultErrorMessage)
        }

        return {
          success: false,
          error: apiError
        }
      } finally {
        setLoading(false)
      }
    },
    [showSuccessToast, showErrorToast, successMessage, defaultErrorMessage],
  )

  /**
   * DELETE 요청 처리
   */
  const del = useCallback(
    async (endpoint: string): Promise<ApiResult<T> | null> => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.delete<T>(endpoint)
        
        if (result.success && result.data) {
          setData(result.data)
          
          if (showSuccessToast) {
            toast.success(successMessage)
          }
        } else if (result.error) {
          setError(result.error)
          
          if (showErrorToast) {
            toast.error(result.error.message || defaultErrorMessage)
          }
        }

        return result
      } catch (err) {
        console.error("API request failed:", err)
        
        const apiError: ApiError = {
          code: "UNKNOWN_ERROR",
          message: err instanceof Error ? err.message : defaultErrorMessage
        }
        
        setError(apiError)

        if (showErrorToast) {
          toast.error(apiError.message || defaultErrorMessage)
        }

        return {
          success: false,
          error: apiError
        }
      } finally {
        setLoading(false)
      }
    },
    [showSuccessToast, showErrorToast, successMessage, defaultErrorMessage],
  )

  /**
   * 에러 초기화
   */
  const resetError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * 데이터 초기화
   */
  const resetData = useCallback(() => {
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    delete: del,
    resetError,
    resetData,
  }
}