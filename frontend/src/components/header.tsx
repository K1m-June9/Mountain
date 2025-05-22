"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mountain, Search, LogOut, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User } from "@/lib/types/user"
import SearchSuggestions from "@/components/search-suggestions"
import NotificationDropdown from "@/components/notificaion-dropdown"

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
    <header className="sticky top-0 z-10 bg-background border-b shadow-sm h-16 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 max-w-[1400px] w-full">
        <div className="flex items-center justify-between w-full">
          {/* 좌측: Mountain 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
              <Mountain className="h-6 w-6" />
              <span>Mountain</span>
            </Link>
          </div>

          {/* 중앙: 검색창 */}
          <form onSubmit={handleSearch} className="hidden md:flex w-full max-w-md mx-4">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-3">
                <Search className="h-4 w-4" />
                <span className="sr-only">검색</span>
              </Button>
              
              {/* 검색 제안 추가 */}
              <SearchSuggestions 
                query={searchQuery} 
                className="absolute top-full left-0 w-full mt-1 z-50" 
                onSelect={(postId) => {
                  // 게시물로 이동
                  router.push(`/posts/${postId}`);
                }}
              />
            </div>
          </form>

          {/* 우측: 로그인/회원가입 버튼 또는 사용자 메뉴 */}
          <div className="flex items-center">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>

        {/* 모바일 화면에서 검색창 */}
        <form onSubmit={handleSearch} className="mt-2 md:hidden">
          <Input
            type="search"
            placeholder="검색어를 입력하세요"
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  )
}

interface UserMenuProps {
  user: User
  onLogout: () => void
}

function UserMenu({ user, onLogout }: UserMenuProps) {
  const isAdmin = user.role === "admin"
  
  return (
    <div className="flex items-center space-x-2 ml-2">
      {isAdmin && (
        <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
          <Link href="/admin">
            <Settings className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline-block">관리자</span>
          </Link>
        </Button>
      )}
      {/* 알림 드롭다운 추가 */}
      <NotificationDropdown />
      <Link href="/profile">
        <Avatar className="h-8 w-8 cursor-pointer bg-primary text-primary-foreground">
          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
        </Avatar>
      </Link>
      <span className="hidden md:inline-block text-sm font-medium">{user.nickname || user.username}</span>
      <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center gap-1">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline-block">로그아웃</span>
      </Button>
    </div>
  )
}

function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">로그인</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/register">회원가입</Link>
      </Button>
    </div>
  )
}

// 사용자 이니셜 생성 함수
function getUserInitials(user: User): string {
  if (user.nickname) {
    return user.nickname.charAt(0).toUpperCase()
  }
  
  return user.username.charAt(0).toUpperCase()
}