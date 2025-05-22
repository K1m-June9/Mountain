"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  FileText,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  RefreshCw,
  Check,
  X,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Pagination from "@/components/pagination"
import adminService from "@/lib/services/admin_service"
import { useToast } from "@/hooks/use-sonner"
import type { AdminUserDetail, UserActivity, RestrictionHistory, UserStatusUpdateRequest } from "@/lib/types/admin"

interface UserDetailProps {
  userId: string
}

export function UserDetail({ userId }: UserDetailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [restrictionHistory, setRestrictionHistory] = useState<RestrictionHistory[]>([])
  const [activityType, setActivityType] = useState("")
  const [activityPage, setActivityPage] = useState(1)
  const [totalActivities, setTotalActivities] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // 제재 관련 상태
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [suspendDuration, setSuspendDuration] = useState<string>("3")
  const [suspendReason, setSuspendReason] = useState("")

  // 역할 변경 관련 상태
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"user" | "moderator" | "admin">("user")

  // 탭 상태 (URL 쿼리 파라미터에서 가져옴)
  const tab = searchParams.get("tab") || "all"

  // 사용자 데이터 로드
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      try {
        const result = await adminService.getUserById(Number(userId))

        if (result.success && result.data) {
          setUser(result.data)
          setSelectedRole(result.data.role)

          // 제재 이력 로드
          const historyResult = await adminService.getUserRestrictionHistory(Number(userId))
          if (historyResult.success && historyResult.data) {
            setRestrictionHistory(historyResult.data)
          }
        } else {
          toast.error("사용자 정보를 불러오는 중 오류가 발생했습니다.")
        }
      } catch (error) {
        console.error("Error loading user:", error)
        toast.error("사용자 정보를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [userId, toast])

  // 사용자 활동 데이터 로드
  useEffect(() => {
    if (!user) return

    setActivityLoading(true)

    const loadData = async () => {
      try {
        const skip = (activityPage - 1) * 10
        let result

        // 좋아요/싫어요 탭인 경우 getUserReactions 호출
        if (activityType === "like" || activityType === "dislike") {
          result = await adminService.getUserReactions(Number(userId), skip, 10, activityType)
        } else {
          // 백엔드에서 필터링된 결과를 직접 사용
          result = await adminService.getUserActivities(Number(userId), skip, 10, activityType || undefined)
        }

        if (result.success && result.data) {
          setActivities(result.data.activities)
          setTotalActivities(result.data.total)
        } else {
          toast.error("활동 내역을 불러오는 중 오류가 발생했습니다.")
        }
      } catch (error) {
        console.error("Error loading activities:", error)
        toast.error("활동 내역을 불러오는 중 오류가 발생했습니다.")
      } finally {
        setActivityLoading(false)
      }
    }

    loadData()
  }, [userId, user, activityType, activityPage, toast])

  // 사용자 제재 처리
  const handleSuspendUser = async () => {
    if (!user) return

    try {
      setActionLoading(true)

      // 제재 기간 계산
      let suspendedUntil: string | null = null
      const days = suspendDuration === "permanent" ? null : Number.parseInt(suspendDuration)

      if (days) {
        const date = new Date()
        date.setDate(date.getDate() + days)
        suspendedUntil = date.toISOString()
      }

      // 상태 업데이트 (제재 사유 포함)
      const data: UserStatusUpdateRequest = {
        status: "suspended",
        suspended_until: suspendedUntil,
        reason: suspendReason,
        duration: days,
      }

      const result = await adminService.updateUserStatus(Number(userId), data)

      if (result.success && result.data) {
        // 사용자 정보 다시 로드
        const userResult = await adminService.getUserById(Number(userId))
        if (userResult.success && userResult.data) {
          setUser(userResult.data)
        }

        // 제재 이력 다시 로드
        const historyResult = await adminService.getUserRestrictionHistory(Number(userId))
        if (historyResult.success && historyResult.data) {
          setRestrictionHistory(historyResult.data)
        }

        toast.success(days ? `사용자가 ${days}일 동안 제재되었습니다.` : "사용자가 무기한 정지되었습니다.")

        // 대화상자 닫기
        setSuspendDialogOpen(false)
        setSuspendReason("")
      } else {
        toast.error("사용자 제재 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error suspending user:", error)
      toast.error("사용자 제재 중 오류가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  // 사용자 제재 해제 처리
  const handleUnsuspendUser = async () => {
    if (!user) return

    try {
      setActionLoading(true)

      // 상태 업데이트 (제재 해제 사유: "관리자에 의한 제재 해제")
      const data: UserStatusUpdateRequest = {
        status: "active",
        suspended_until: null,
        reason: "관리자에 의한 제재 해제",
      }

      const result = await adminService.updateUserStatus(Number(userId), data)

      if (result.success && result.data) {
        // 사용자 정보 다시 로드
        const userResult = await adminService.getUserById(Number(userId))
        if (userResult.success && userResult.data) {
          setUser(userResult.data)
        }

        // 제재 이력 다시 로드
        const historyResult = await adminService.getUserRestrictionHistory(Number(userId))
        if (historyResult.success && historyResult.data) {
          setRestrictionHistory(historyResult.data)
        }

        toast.success("사용자 계정이 다시 활성화되었습니다.")
      } else {
        toast.error("사용자 제재 해제 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error unsuspending user:", error)
      toast.error("사용자 제재 해제 중 오��가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  // 사용자 역할 변경 처리
  const handleRoleChange = async () => {
    if (!user) return

    try {
      setActionLoading(true)
      const result = await adminService.updateUserRole(Number(userId), selectedRole)

      if (result.success && result.data) {
        // 사용자 정보 다시 로드
        const userResult = await adminService.getUserById(Number(userId))
        if (userResult.success && userResult.data) {
          setUser(userResult.data)
        }

        toast.success(
          `사용자 역할이 ${
            selectedRole === "admin" ? "관리자" : selectedRole === "moderator" ? "중재자" : "일반 사용자"
          }(으)로 변경되었습니다.`,
        )

        // 대화상자 닫기
        setRoleDialogOpen(false)
      } else {
        toast.error("사용자 역할을 변경하는 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("사용자 역할을 변경하는 중 오류가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-2 text-lg font-medium">사용자를 찾을 수 없습니다</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            사용자 목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  // 현재 제재 정보 (가장 최근 제재 기록)
  const currentRestriction =
    user.status === "suspended" && restrictionHistory.length > 0
      ? restrictionHistory.find((r) => r.type === "suspend")
      : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          사용자 목록으로 돌아가기
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full">
                <Image
                  src="/abstract-geometric-shapes.png"
                  alt={user.username || "사용자 프로필"}
                  fill
                  className="object-cover"
                />
              </div>

              <h2 className="mt-4 text-xl font-bold">{user.username}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-2">
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
                    <User className="mr-1 h-3 w-3" />
                    일반 사용자
                  </Badge>
                )}
              </div>

              <div className="mt-2">
                {user.status === "active" && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Check className="mr-1 h-3 w-3" />
                    활성
                  </Badge>
                )}
                {user.status === "inactive" && (
                  <Badge variant="outline" className="text-gray-600 border-gray-600">
                    <X className="mr-1 h-3 w-3" />
                    비활성
                  </Badge>
                )}
                {user.status === "suspended" && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    정지
                    {user.suspended_until && (
                      <span className="ml-1 text-xs">({new Date(user.suspended_until).toLocaleDateString()}까지)</span>
                    )}
                  </Badge>
                )}
              </div>

              <div className="mt-6 w-full space-y-2 text-left">
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>가입일: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    최근 활동: {user.last_active ? new Date(user.last_active).toLocaleDateString() : "정보 없음"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>사용자 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {/* 첫 번째 줄: 게시물 관련 통계 및 좋아요 */}
              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <span className="mt-2 text-2xl font-bold">{user.post_count}</span>
                <span className="text-xs text-muted-foreground">게시글</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <FileText className="h-8 w-8 text-green-500" />
                <span className="mt-2 text-2xl font-bold">{user.created_post_count || user.post_count}</span>
                <span className="text-xs text-muted-foreground">생성한 게시글</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <FileText className="h-8 w-8 text-red-500" />
                <span className="mt-2 text-2xl font-bold">{user.deleted_post_count || 0}</span>
                <span className="text-xs text-muted-foreground">삭제한 게시글</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <ThumbsUp className="h-8 w-8 text-amber-500" />
                <span className="mt-2 text-2xl font-bold">{user.like_count}</span>
                <span className="text-xs text-muted-foreground">좋아요</span>
              </div>

              {/* 두 번째 줄: 댓글 관련 통계 및 싫어요 */}
              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <span className="mt-2 text-2xl font-bold">{user.comment_count}</span>
                <span className="text-xs text-muted-foreground">댓글</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <MessageSquare className="h-8 w-8 text-green-500" />
                <span className="mt-2 text-2xl font-bold">{user.created_comment_count || user.comment_count}</span>
                <span className="text-xs text-muted-foreground">생성한 댓글</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <MessageSquare className="h-8 w-8 text-red-500" />
                <span className="mt-2 text-2xl font-bold">{user.deleted_comment_count || 0}</span>
                <span className="text-xs text-muted-foreground">삭제한 댓글</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                <ThumbsDown className="h-8 w-8 text-red-500" />
                <span className="mt-2 text-2xl font-bold">{user.dislike_count}</span>
                <span className="text-xs text-muted-foreground">싫어요</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>활동 및 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tab}>
            <TabsList className="grid w-full max-w-md grid-cols-6">
              <TabsTrigger
                value="all"
                onClick={() => {
                  setActivityType("")
                  setActivityPage(1)
                  router.push(`/admin/users/${userId}?tab=all`)
                }}
              >
                전체
              </TabsTrigger>
              <TabsTrigger
                value="post"
                onClick={() => {
                  setActivityType("post")
                  setActivityPage(1)
                  router.push(`/admin/users/${userId}?tab=post`)
                }}
              >
                게시글
              </TabsTrigger>
              <TabsTrigger
                value="comment"
                onClick={() => {
                  setActivityType("comment")
                  setActivityPage(1)
                  router.push(`/admin/users/${userId}?tab=comment`)
                }}
              >
                댓글
              </TabsTrigger>
              <TabsTrigger
                value="like"
                onClick={() => {
                  setActivityType("like")
                  setActivityPage(1)
                  router.push(`/admin/users/${userId}?tab=like`)
                }}
              >
                좋아요
              </TabsTrigger>
              <TabsTrigger
                value="dislike"
                onClick={() => {
                  setActivityType("dislike")
                  setActivityPage(1)
                  router.push(`/admin/users/${userId}?tab=dislike`)
                }}
              >
                싫어요
              </TabsTrigger>
              <TabsTrigger
                value="manage"
                onClick={() => {
                  router.push(`/admin/users/${userId}?tab=manage`)
                }}
              >
                관리
              </TabsTrigger>
            </TabsList>

            {/* 활동 이력 탭 컨텐츠 */}
            <TabsContent value="all">{renderActivityContent()}</TabsContent>
            <TabsContent value="post">{renderActivityContent()}</TabsContent>
            <TabsContent value="comment">{renderActivityContent()}</TabsContent>
            <TabsContent value="like">{renderActivityContent()}</TabsContent>
            <TabsContent value="dislike">{renderActivityContent()}</TabsContent>

            {/* 관리 탭 컨텐츠 */}
            <TabsContent value="manage">
              <div className="space-y-6">
                {/* 현재 제재 상태 표시 */}
                {user.status === "suspended" && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-amber-800">이 사용자는 현재 제재 상태입니다</h3>
                          <p className="text-sm text-amber-700 mt-1">
                            {user.suspended_until
                              ? `제재 기간: ${new Date(user.suspended_until).toLocaleDateString()}까지`
                              : "무기한 정지"}
                          </p>
                          {currentRestriction && (
                            <p className="text-sm text-amber-700 mt-1">제재 사유: {currentRestriction.reason}</p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 bg-white"
                            onClick={handleUnsuspendUser}
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="mr-2 h-3 w-3" />
                            )}
                            제재 해제
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 사용자 관리 액션 */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">사용자 제재</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        커뮤니티 가이드라인을 위반한 사용자를 제재할 수 있습니다.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => setSuspendDialogOpen(true)}
                        disabled={user.status === "suspended" || actionLoading}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        사용자 제재
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">역할 관리</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        사용자의 역할을 변경하여 권한을 조정할 수 있습니다.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRole(user.role)
                          setRoleDialogOpen(true)
                        }}
                        disabled={actionLoading}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        역할 변경
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* 제재 이력 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">제재 이력</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {restrictionHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground">제재 이력이 없습니다.</p>
                    ) : (
                      <div className="space-y-4">
                        {restrictionHistory.map((restriction) => (
                          <div key={restriction.id} className="flex items-start gap-3 border-b pb-4 last:border-0">
                            {restriction.type === "suspend" ? (
                              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium">
                                {restriction.type === "suspend" ? "계정 제재" : "제재 해제"}
                              </p>
                              <p className="mt-1 text-sm">{restriction.reason}</p>
                              {restriction.type === "suspend" && restriction.duration && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  제재 기간: {restriction.duration}일
                                </p>
                              )}
                              <p className="mt-1 text-xs text-muted-foreground">
                                {new Date(restriction.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 제재 대화상자 */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 제재</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>제재 기간</Label>
              <RadioGroup
                value={suspendDuration}
                onValueChange={setSuspendDuration}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="duration-3" />
                  <Label htmlFor="duration-3">3일</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="7" id="duration-7" />
                  <Label htmlFor="duration-7">7일</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="15" id="duration-15" />
                  <Label htmlFor="duration-15">15일</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30" id="duration-30" />
                  <Label htmlFor="duration-30">30일</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="permanent" id="duration-permanent" />
                  <Label htmlFor="duration-permanent">무기한</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">제재 사유</Label>
              <Textarea
                id="suspend-reason"
                placeholder="제재 사유를 입력하세요"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleSuspendUser} disabled={!suspendReason.trim() || actionLoading}>
              {actionLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              제재하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 역할 변경 대화상자 */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>역할 변경</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>사용자 역할</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as "user" | "moderator" | "admin")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="role-user" />
                  <Label htmlFor="role-user">일반 사용자</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderator" id="role-moderator" />
                  <Label htmlFor="role-moderator">중재자</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="role-admin" />
                  <Label htmlFor="role-admin">관리자</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleRoleChange} disabled={selectedRole === user.role || actionLoading}>
              {actionLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              변경하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // 활동 이력 렌더링 함수
  function renderActivityContent() {
    if (activityLoading) {
      return (
        <div className="flex h-[200px] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (activities.length === 0) {
      return (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-muted-foreground">활동 이력이 없습니다.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 border-b pb-4 last:border-0">
            {/* 게시물 생성 아이콘 */}
            {activity.action_type === "create_post" && <FileText className="h-5 w-5 text-blue-500 mt-0.5" />}

            {/* 게시물 삭제 아이콘 - 빨간색으로 변경 */}
            {activity.action_type === "delete_post" && <FileText className="h-5 w-5 text-red-500 mt-0.5" />}

            {/* 댓글 생성 아이콘 */}
            {activity.action_type === "create_comment" && <MessageSquare className="h-5 w-5 text-green-500 mt-0.5" />}

            {/* 댓글 삭제 아이콘 - 빨간색으로 변경 */}
            {activity.action_type === "delete_comment" && <MessageSquare className="h-5 w-5 text-red-500 mt-0.5" />}

            {/* 기존 아이콘들 */}
            {activity.action_type === "like" && <ThumbsUp className="h-5 w-5 text-amber-500 mt-0.5" />}
            {activity.action_type === "dislike" && <ThumbsDown className="h-5 w-5 text-red-500 mt-0.5" />}
            {activity.action_type === "report" && <Flag className="h-5 w-5 text-purple-500 mt-0.5" />}
            {!["create_post", "delete_post", "create_comment", "delete_comment", "like", "dislike", "report"].includes(
              activity.action_type,
            ) && <Clock className="h-5 w-5 text-gray-500 mt-0.5" />}

            <div>
              <p className="font-medium">
                {activity.action_type === "create_post" && "게시글 작성"}
                {activity.action_type === "create_comment" && "댓글 작성"}
                {activity.action_type === "update_post" && "게시글 수정"}
                {activity.action_type === "update_comment" && "댓글 수정"}
                {activity.action_type === "delete_post" && "게시글 삭제"}
                {activity.action_type === "delete_comment" && "댓글 삭제"}
                {activity.action_type === "like" && "좋아요"}
                {activity.action_type === "dislike" && "싫어요"}
                {activity.action_type === "report" && "신고"}
                {activity.action_type === "login" && "로그인"}
                {activity.action_type === "update_profile" && "프로필 수정"}
                {![
                  "create_post",
                  "create_comment",
                  "update_post",
                  "update_comment",
                  "delete_post",
                  "delete_comment",
                  "like",
                  "dislike",
                  "report",
                  "login",
                  "update_profile",
                ].includes(activity.action_type) && activity.action_type}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}

        {totalActivities > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={activityPage}
              itemsPerPage={10}
              totalItems={totalActivities}
              baseUrl={`/admin/users/${userId}?tab=${tab}&page=`}
              onPageChange={(page) => setActivityPage(page)}
            />
          </div>
        )}
      </div>
    )
  }
}
