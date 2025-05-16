"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileHeader from "@/components/profile/profile-header"
import ProfileInfo from "@/components/profile/profile-info"
import ProfilePosts from "@/components/profile/profile-posts"
import ProfileComments from "@/components/profile/profile-comments"
import ProfileLikes from "@/components/profile/profile-likes"
import ProfileSettings from "@/components/profile/profile-settings"
import { Loader2 } from 'lucide-react'
import type { User } from "@/lib/types/user"
import type { ID } from "@/lib/types/common"

// 탭 타입 정의
type ProfileTab = "info" | "posts" | "comments" | "likes" | "settings";

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>("info")

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // 로딩 중일 때 표시할 컴포넌트
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 사용자 정보가 없을 때 처리
  if (!user) {
    return null
  }

  return (
    <div className="container max-w-6xl mx-auto px-4">
      <ProfileHeader user={user} />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProfileTab)} className="mt-8">
        <TabsList className="grid grid-cols-5 md:w-[600px] w-full">
          <TabsTrigger value="info">기본 정보</TabsTrigger>
          <TabsTrigger value="posts">작성 글</TabsTrigger>
          <TabsTrigger value="comments">작성 댓글</TabsTrigger>
          <TabsTrigger value="likes">좋아요</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <ProfileInfo user={user} />
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <ProfilePosts userId={user.id} />
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <ProfileComments userId={user.id} />
        </TabsContent>

        <TabsContent value="likes" className="mt-6">
          <ProfileLikes userId={user.id} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ProfileSettings user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}