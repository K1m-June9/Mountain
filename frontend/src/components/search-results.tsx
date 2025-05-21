// src/components/search-results.tsx
"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import Pagination from "@/components/pagination"
import { AlertTriangle, Search } from 'lucide-react'
import postService from "@/lib/services/post_service"
import type { PostWithDetails } from "@/lib/types/post"

interface SearchResultsProps {
  query: string
  currentPage: number
  sortBy: string
  filter: string
  institution: string
}

export default function SearchResults({
  query,
  currentPage,
  sortBy,
  filter,
  institution,
}: SearchResultsProps) {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<PostWithDetails[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const postsPerPage = 20

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setResults([])
        setTotalResults(0)
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        // 검색 파라미터 구성
        const params: Record<string, any> = {
          page: currentPage,
          limit: postsPerPage,
          sort_by: sortBy
        }
        
        if (institution && institution !== "all") {
          params.institution_id = institution;
        }

        if (filter && filter !== "all") {
          params.type = filter
        }

        // API 호출
        const response = await postService.searchPosts(query, params)
        
        if (response.success && response.data) {
          setResults(response.data.items)
          setTotalResults(response.data.total)
          setTotalPages(Math.ceil(response.data.total / postsPerPage))
        } else {
          console.error("Error searching posts:", response.error)
          setResults([])
          setTotalResults(0)
          setTotalPages(1)
        }
      } catch (error) {
        console.error("Error searching posts:", error)
        setResults([])
        setTotalResults(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [query, currentPage, sortBy, filter, institution])

  // 기관별 색상 매핑
  const institutionColors: Record<string, string> = {
    국회: "bg-blue-100 text-blue-800",
    여성가족부: "bg-pink-100 text-pink-800",
    교육부: "bg-green-100 text-green-800",
    문화체육관광부: "bg-purple-100 text-purple-800",
    고용노동부: "bg-orange-100 text-orange-800",
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500">검색 결과를 불러오는 중입니다...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
        <p className="text-gray-500 mb-4">다른 검색어나 필터 옵션을 시도해보세요.</p>
        <div className="text-sm text-gray-400">
          <p>검색 팁:</p>
          <ul className="list-disc list-inside mt-1">
            <li>철자가 정확한지 확인하세요</li>
            <li>더 일반적인 키워드를 사용해보세요</li>
            <li>필터 옵션을 변경해보세요</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        총 <span className="font-semibold">{totalResults}</span>개의 검색 결과 중
        <span className="font-semibold"> {(currentPage - 1) * postsPerPage + 1}</span>-
        <span className="font-semibold">{Math.min(currentPage * postsPerPage, totalResults)}</span>번째 결과
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60%]">제목</TableHead>
            <TableHead>글쓴이</TableHead>
            <TableHead>작성일</TableHead>
            <TableHead className="text-right">조회</TableHead>
            <TableHead className="text-right">추천</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((post) => (
            <TableRow key={post.id} className={post.is_hidden ? "bg-gray-100" : ""}>
              <TableCell className="font-medium">
                <Link href={`/posts/${post.id}`} className="hover:underline">
                  <div className="flex items-center gap-1">
                    {post.institution ? (
                      <Badge 
                        className={`mr-2 ${institutionColors[post.institution.name] || "bg-gray-100 text-gray-800"}`} 
                        variant="outline"
                      >
                        {post.institution.name}
                      </Badge>
                    ) : null}
                    {post.is_hidden && (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" aria-label="신고로 인해 숨김 처리된 게시물" />
                    )}
                    <span>{post.title}</span>
                    {post.comment_count > 0 && <span className="text-gray-500 ml-1">[{post.comment_count}]</span>}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span>{post.user.username}</span>
                  {post.user.nickname && <span className="text-gray-400 text-xs ml-1">({post.user.nickname})</span>}
                </div>
              </TableCell>
              <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">{post.view_count}</TableCell>
              <TableCell className="text-right">{post.like_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 페이지네이션 */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalItems={totalResults}
          itemsPerPage={postsPerPage}
          totalPages={totalPages}
          baseUrl={`/search?q=${query}&sort=${sortBy}&filter=${filter}&institution=${institution}&page=`}
        />
      </div>
    </div>
  )
}