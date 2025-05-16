"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserIcon, Shield, AlertTriangle, MoreHorizontal, RefreshCw } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Pagination from "@/components/pagination"
import { useToast } from "@/hooks/use-sonner"
import adminService from "@/lib/services/admin_service"
import type { User } from "@/lib/types/user"
import type { PaginatedData } from "@/lib/types/common"

// 관리자 화면에서 사용하는 사용자 타입 정의
// User 타입을 확장하지 않고 독립적으로 정의
interface AdminUser {
  id: string
  username: string
  name?: string
  email: string
  role: "admin" | "moderator" | "user" | string
  status?: "active" | "inactive" | "suspended" | string
  created_at: string
  updated_at?: string
  last_login?: string
}

// 사용자 목록 필터 타입
interface UserListFilter {
  page: number
  limit: number
  search?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export function UserList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [role, setRole] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // 현재 페이지 번호 (URL 쿼리 파라미터에서 가져옴)
  const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page") as string) : 1
  const limit = 10

  // 사용자 목록 로드
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      try {
        // 필터 객체 생성
        const filter: UserListFilter = {
          page,
          limit,
          sortBy,
          sortOrder
        }
        
        // 선택적 필터 추가
        if (searchTerm) filter.search = searchTerm
        if (role && role !== "all") filter.role = role
        if (status && status !== "all") filter.status = status

        const result = await adminService.getUsers(filter)
        
        if (result.success && result.data) {
          // API 응답을 AdminUser 타입으로 변환
          const paginatedData = result.data as PaginatedData<any>
          const adminUsers: AdminUser[] = paginatedData.items.map((item: any) => ({
            id: item.id,
            username: item.username || '',
            name: item.name,
            email: item.email || '',
            role: item.role || 'user',
            status: item.status || 'active',
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at,
            last_login: item.last_login
          }))
          
          setUsers(adminUsers)
          setTotalUsers(paginatedData.total)
        } else {
          toast.error("사용자 목록을 불러오는 중 오류가 발생했습니다.")
        }
      } catch (error) {
        console.error("Error loading users:", error)
        toast.error("사용자 목록을 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [page, searchTerm, role, status, sortBy, sortOrder, toast])

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 검색 시 페이지를 1로 리셋
    router.push(`/admin/users?page=1&search=${searchTerm}&role=${role}&status=${status}`)
  }

  // 정렬 변경 핸들러
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      // 같은 필드를 다시 클릭하면 정렬 순서 변경
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // 다른 필드를 클릭하면 해당 필드로 정렬하고 기본 정렬 순서는 내림차순
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm("")
    setRole("")
    setStatus("")
    setSortBy("createdAt")
    setSortOrder("desc")
    router.push("/admin/users?page=1")
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">사용자 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <Input
                placeholder="이름, 사용자명 또는 이메일로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[180px]">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="역할" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 역할</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="moderator">중재자</SelectItem>
                  <SelectItem value="user">일반 사용자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[180px]">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                  <SelectItem value="suspended">정지</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button type="submit">검색</Button>
              <Button type="button" variant="outline" onClick={resetFilters}>
                초기화
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {users.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th
                      className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                      onClick={() => handleSortChange("name")}
                    >
                      사용자
                      {sortBy === "name" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </th>
                    <th
                      className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                      onClick={() => handleSortChange("role")}
                    >
                      역할
                      {sortBy === "role" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </th>
                    <th
                      className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                      onClick={() => handleSortChange("status")}
                    >
                      상태
                      {sortBy === "status" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </th>
                    <th
                      className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                      onClick={() => handleSortChange("createdAt")}
                    >
                      가입일
                      {sortBy === "createdAt" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </th>
                    <th
                      className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                      onClick={() => handleSortChange("lastActive")}
                    >
                      최근 활동
                      {sortBy === "lastActive" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">작업</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle">
                        <div className="flex items-center">
                          <div className="mr-2 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{user.username || user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {user.role === "admin" && (
                          <Badge variant="default" className="bg-red-500 hover:bg-red-600">
                            <Shield className="mr-1 h-3 w-3" />
                            관리자
                          </Badge>
                        )}
                        {user.role === "moderator" && (
                          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                            <Shield className="mr-1 h-3 w-3" />
                            중재자
                          </Badge>
                        )}
                        {user.role === "user" && (
                          <Badge variant="outline">
                            <UserIcon className="mr-1 h-3 w-3" />
                            일반 사용자
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        {user.status === "active" && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            활성
                          </Badge>
                        )}
                        {user.status === "inactive" && (
                          <Badge variant="outline" className="text-gray-600 border-gray-600">
                            비활성
                          </Badge>
                        )}
                        {user.status === "suspended" && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            정지
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 align-middle">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="p-4 align-middle">
                        {user.updated_at || user.last_login 
                          ? new Date(user.updated_at || user.last_login || "").toLocaleDateString() 
                          : "정보 없음"}
                      </td>
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">메뉴 열기</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>작업</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                              상세 정보 보기
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                // 사용자 상세 페이지의 제재 탭으로 이동
                                router.push(`/admin/users/${user.id}?tab=manage`)
                              }}
                            >
                              제재 관리
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              총 {totalUsers}명의 사용자 중 {(page - 1) * limit + 1}-{Math.min(page * limit, totalUsers)}명 표시
            </div>
            <Pagination currentPage={page} totalItems={totalUsers} itemsPerPage={limit} baseUrl="/admin/users?page=" />
          </div>
        </>
      )}
    </div>
  )
}