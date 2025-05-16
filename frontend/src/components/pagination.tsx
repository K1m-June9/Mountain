"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useRouter } from "next/navigation"
import type { Institution } from "@/lib/types/institution"

interface PaginationProps {
  currentPage: number
  totalItems?: number
  itemsPerPage?: number
  totalPages?: number
  baseUrl?: string
  onPageChange?: (page: number) => void
  institution?: Institution
}

/**
 * 페이지네이션 컴포넌트
 * 
 * 현재 페이지와 총 페이지 수를 기반으로 페이지네이션 UI를 렌더링합니다.
 * 페이지 변경 시 onPageChange 콜백이 호출되거나 baseUrl이 제공된 경우 해당 URL로 이동합니다.
 */
export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  totalPages: propsTotalPages,
  baseUrl,
  onPageChange,
  institution
}: PaginationProps) {
  const router = useRouter()
  const totalPages = propsTotalPages || Math.ceil((totalItems || 0) / itemsPerPage)

  /**
   * 페이지 범위 계산 (현재 페이지 주변 페이지 표시)
   * @returns 표시할 페이지 번호 배열 (페이지 사이 간격은 -1로 표시)
   */
  const getPageRange = (): number[] => {
    const delta = 2 // 현재 페이지 양쪽에 표시할 페이지 수
    const range: number[] = []
    const rangeWithDots: number[] = []

    // 첫 페이지는 항상 표시
    range.push(1)

    // 페이지 범위 계산
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i)
      }
    }

    // 마지막 페이지가 1보다 크면 추가
    if (totalPages > 1) {
      range.push(totalPages)
    }

    // 중복 제거 및 정렬
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b)

    // 페이지 사이에 ... 추가
    let prev = 0
    for (const i of uniqueRange) {
      if (prev + 1 !== i) {
        rangeWithDots.push(-1) // -1은 ... 표시를 위한 값
      }
      rangeWithDots.push(i)
      prev = i
    }

    return rangeWithDots
  }

  /**
   * 페이지 변경 처리
   * @param page 이동할 페이지 번호
   */
  const handlePageChange = (page: number): void => {
    if (page < 1 || page > totalPages) return

    if (onPageChange) {
      onPageChange(page)
    } else if (baseUrl) {
      router.push(`${baseUrl}${page}`)
    }
  }

  // 페이지가 1개 이하면 페이지네이션 표시하지 않음
  if (totalPages <= 1) return null

  return (
    <nav aria-label="페이지네이션" className="flex items-center justify-center space-x-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">이전 페이지</span>
      </Button>

      {getPageRange().map((page, index) =>
        page === -1 ? (
          <Button key={`dots-${index}`} variant="ghost" size="icon" disabled aria-hidden="true">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => handlePageChange(page)}
            className="w-9 h-9"
            aria-label={`${page} 페이지로 이동`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">다음 페이지</span>
      </Button>
    </nav>
  )
}