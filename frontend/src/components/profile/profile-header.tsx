import { useState } from "react"
import { User } from "@/lib/types/user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/date"
import userService from "@/lib/services/user_service"
import { useApi } from "@/lib/api/hooks"
import { getErrorMessage } from "@/lib/api/utils"

interface ProfileHeaderProps {
  user: User
}

interface UserStats {
  postCount: number;
  commentCount: number;
  likeCount: number;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [stats, setStats] = useState<UserStats>({
    postCount: 0,
    commentCount: 0,
    likeCount: 0
  })

  // 사용자 통계 정보 가져오기
  const { isLoading, error } = useApi(
    () => userService.getUserStats(user.id),
    {
      onSuccess: (data) => {
        if (data) {
          setStats({
            postCount: data.post_count || 0,
            commentCount: data.comment_count || 0,
            likeCount: data.like_count || 0
          })
        }
      },
      onError: (error) => {
        console.error("Failed to fetch user stats:", getErrorMessage(error))
      }
    }
  )

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage
              src={`/abstract-geometric-shapes.png?key=dvnei&height=96&width=96&query=${user.username || "/placeholder.svg"}`}
              alt={user.username}
            />
            <AvatarFallback className="text-2xl">{user.username[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
            <p className="mt-2 text-sm">가입일: {formatDate(user.created_at)}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.postCount}</p>
              <p className="text-sm text-muted-foreground">게시글</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.commentCount}</p>
              <p className="text-sm text-muted-foreground">댓글</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.likeCount}</p>
              <p className="text-sm text-muted-foreground">좋아요</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}