"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from 'lucide-react'

export function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 로딩이 완료되고, 인증되지 않았거나 관리자가 아닌 경우 로그인 페이지로 리디렉션
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 인증되지 않았거나 관리자가 아닌 경우 아무것도 렌더링하지 않음
  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return <>{children}</>
}