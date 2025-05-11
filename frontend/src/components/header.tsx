// components/header.tsx

'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mountain, Search, User, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const { user, isAuthenticated, logout } = useAuth()
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b shadow-sm h-16 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 max-w-[1400px] w-full">
        <div className="flex items-center justify-between w-full">
          {/* 좌측: Mountain 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
              <Mountain className="h-6 w-6" />
              <span className="dark:text-white">Mountain</span>
            </Link>
          </div>

          {/* 중앙: 검색창 */}
          <form onSubmit={handleSearch} className="hidden md:flex w-full max-w-md mx-4">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                className="w-full pr-10 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-3">
                <Search className="h-4 w-4" />
                <span className="sr-only">검색</span>
              </Button>
            </div>
          </form>

          {/* 우측: 로그인/회원가입 버튼 또는 사용자 메뉴 */}
          <div className="flex items-center">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.nickname}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">프로필</Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">관리자 페이지</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">로그인</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">회원가입</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 모바일 화면에서 검색창 */}
        <form onSubmit={handleSearch} className="mt-2 md:hidden">
          <Input
            type="search"
            placeholder="검색어를 입력하세요"
            className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  )
}