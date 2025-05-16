// src/components/search-filters.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, SortAsc, SortDesc, RefreshCw } from 'lucide-react'
import institutionService from "@/lib/services/institution_service"
import type { Institution } from "@/lib/types/institution"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchFiltersProps {
  query: string
  sortBy: string
  filter: string
  institution: string
  searchIn: string
}

export default function SearchFilters({ query, sortBy, filter, institution, searchIn }: SearchFiltersProps) {
  const router = useRouter()
  const [localSortBy, setLocalSortBy] = useState(sortBy)
  const [localFilter, setLocalFilter] = useState(filter)
  const [localInstitution, setLocalInstitution] = useState(institution)
  const [localSearchIn, setLocalSearchIn] = useState(searchIn)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // 기관 목록 상태 관리
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 기관 목록 가져오기
  useEffect(() => {
    const fetchInstitutions = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await institutionService.getInstitutions()
        
        if (response.success && response.data) {
          setInstitutions(response.data.items)
        } else {
          setError(response.error?.message || "기관 목록을 가져오는데 실패했습니다.")
        }
      } catch (err) {
        console.error("기관 목록 조회 오류:", err)
        setError("기관 목록을 가져오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstitutions()
  }, [])

  // 필터 변경 시 URL 업데이트
  const updateFilters = () => {
    const params = new URLSearchParams()
    params.set("q", query)
    params.set("sort", localSortBy)
    params.set("filter", localFilter)
    params.set("institution", localInstitution)
    params.set("searchIn", localSearchIn)

    router.push(`/search?${params.toString()}`)
  }

  // 필터 초기화
  const resetFilters = () => {
    setLocalSortBy("recent")
    setLocalFilter("all")
    setLocalInstitution("all")
    setLocalSearchIn("all")

    const params = new URLSearchParams()
    params.set("q", query)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          상세 필터
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetFilters} className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            초기화
          </Button>

          <Select
            value={localSortBy}
            onValueChange={(value) => {
              setLocalSortBy(value)
              setTimeout(updateFilters, 0)
            }}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="정렬 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center gap-1">
                  <SortDesc className="h-3 w-3" />
                  최신순
                </div>
              </SelectItem>
              <SelectItem value="old">
                <div className="flex items-center gap-1">
                  <SortAsc className="h-3 w-3" />
                  오래된순
                </div>
              </SelectItem>
              <SelectItem value="views">조회수순</SelectItem>
              <SelectItem value="likes">추천순</SelectItem>
              <SelectItem value="comments">댓글순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">검색 범위</label>
            <Select
              value={localSearchIn}
              onValueChange={(value) => {
                setLocalSearchIn(value)
                setTimeout(updateFilters, 0)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="검색 범위" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="title">제목만</SelectItem>
                <SelectItem value="content">내용만</SelectItem>
                <SelectItem value="author">작성자</SelectItem>
                <SelectItem value="comments">댓글</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">게시물 유형</label>
            <Select
              value={localFilter}
              onValueChange={(value) => {
                setLocalFilter(value)
                setTimeout(updateFilters, 0)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="게시물 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="notice">공지사항</SelectItem>
                <SelectItem value="regular">일반 게시물</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">기관</label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <Select
                value={localInstitution}
                onValueChange={(value) => {
                  setLocalInstitution(value)
                  setTimeout(updateFilters, 0)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="기관 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id.toString()}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
    </div>
  )
}