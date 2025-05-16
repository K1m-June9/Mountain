"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Flag, MessageSquare, Building, Users, Settings, LogOut, Pin } from 'lucide-react'
import { useAuth } from "@/contexts/auth-context"

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const menuItems = [
    {
      title: "대시보드",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "공지사항 관리",
      href: "/admin/notices",
      icon: <Pin className="h-5 w-5" />,
    },
    {
      title: "신고 관리",
      href: "/admin/reports",
      icon: <Flag className="h-5 w-5" />,
    },
    {
      title: "댓글 관리",
      href: "/admin/comments",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "기관 관리",
      href: "/admin/institutions",
      icon: <Building className="h-5 w-5" />,
    },
    {
      title: "사용자 관리",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "설정",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              pathname === item.href ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          로그아웃
        </Button>
      </div>
    </div>
  )
}