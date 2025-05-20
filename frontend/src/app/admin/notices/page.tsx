"use client"

import { useState, useEffect } from "react"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Pin } from 'lucide-react'
import { formatDate } from "@/lib/utils/date"
import adminService from "@/lib/services/admin_service"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Notice, NoticeWithUser, NoticeCreateRequest, NoticeUpdateRequest } from "@/lib/types/notice"
import type { ID } from "@/lib/types/common"
import { useToast } from "@/hooks/use-sonner";
// 공지사항 표시용 인터페이스
interface NoticeDisplay {
  id: ID;
  title: string;
  content: string;
  author?: string;
  date?: string;
  expiryDate?: string;
  isHidden?: boolean;
  isPinned?: boolean;
  user_id?: ID;
  created_at?: string;
  updated_at?: string;
}

export default function NoticesPage() {
  const { user } = useAuth()
  const [notices, setNotices] = useState<NoticeDisplay[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<NoticeDisplay | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    expiryDate: "",
    isPinned: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast();

  // 공지사항 목록 가져오기
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const result = await adminService.getNotices()
        if (result.success && result.data) {
          // API 응답을 NoticeDisplay 형식으로 변환
          const noticesList: NoticeDisplay[] = result.data.items.map(notice => ({
            id: notice.id,
            title: notice.title,
            content: notice.content,
            user_id: notice.user_id,
            created_at: notice.created_at,
            updated_at: notice.updated_at,
            author: "관리자", // 백엔드 응답에 따라 조정 필요
            date: notice.created_at,
            isPinned: notice.is_important,
            isHidden: 'is_hidden' in notice ? Boolean(notice.is_hidden) : false
          }));
          setNotices(noticesList)
        } else {
          console.error("공지사항 목록을 가져오는데 실패했습니다:", result.error)
        }
      } catch (error) {
        console.error("공지사항 목록을 가져오는 중 오류 발생:", error)
      }
    }

    fetchNotices()
  }, [])

  // 검색 필터링
  const filteredNotices = notices.filter((notice) => 
    notice.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 공지사항 추가 다이얼로그 열기
  const handleAddClick = () => {
    setFormData({
      title: "",
      content: "",
      expiryDate: "",
      isPinned: false,
    })
    setError(null)
    setSuccess(null)
    setIsAddDialogOpen(true)
  }

  // 공지사항 수정 다이얼로그 열기
  const handleEditClick = (notice: NoticeDisplay) => {
    setSelectedNotice(notice)
    setFormData({
      title: notice.title,
      content: notice.content || "",
      expiryDate: notice.expiryDate || "",
      isPinned: notice.isPinned || false,
    })
    setError(null)
    setSuccess(null)
    setIsEditDialogOpen(true)
  }

  // 공지사항 삭제 다이얼로그 열기
  const handleDeleteClick = (notice: NoticeDisplay) => {
    setSelectedNotice(notice)
    setError(null)
    setIsDeleteDialogOpen(true)
  }

  // 공지사항 상세 보기 다이얼로그 열기
  const handleViewClick = (notice: NoticeDisplay) => {
    setSelectedNotice(notice)
    setIsViewDialogOpen(true)
  }

  // 공지사항 추가 제출
  const handleAddSubmit = async () => {
    if (!formData.title.trim()) {
      setError("제목을 입력해주세요.")
      return
    }

    if (!formData.content.trim()) {
      setError("내용을 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // NoticeCreateRequest 형식으로 변환
      const noticeData: NoticeCreateRequest = {
        title: formData.title,
        content: formData.content,
        is_important: formData.isPinned
      }

      const result = await adminService.addNotice(noticeData)

      if (result.success && result.data) {
        setSuccess("공지사항이 성공적으로 추가되었습니다.")
        
        // 새 공지사항을 목록에 추가
        const newNotice: NoticeDisplay = {
          id: result.data.id,
          title: result.data.title,
          content: result.data.content,
          user_id: result.data.user_id,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at,
          author: user?.nickname || "관리자",
          date: result.data.created_at,
          isPinned: result.data.is_important,
          isHidden: false
        }
        
        setNotices([newNotice, ...notices])

        // 3초 후 다이얼로그 닫기
        setTimeout(() => {
          setIsAddDialogOpen(false)
          setSuccess(null)
        }, 2000)
      } else {
        setError(result.error?.message || "공지사항 추가에 실패했습니다.")
      }
    } catch (err) {
      console.error("공지사항 추가 중 오류:", err)
      setError("공지사항 추가 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 공지사항 수정 제출
  const handleEditSubmit = async () => {
    if (!selectedNotice) return
    
    if (!formData.title.trim()) {
      setError("제목을 입력해주세요.")
      return
    }

    if (!formData.content.trim()) {
      setError("내용을 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // NoticeUpdateRequest 형식으로 변환
      const updateData: NoticeUpdateRequest = {
        title: formData.title,
        content: formData.content,
        is_important: formData.isPinned
      }

      const result = await adminService.updateNotice(selectedNotice.id, updateData)

      if (result.success && result.data) {
        setSuccess("공지사항이 성공적으로 수정되었습니다.")
        
        // 목록에서 해당 공지사항 업데이트
        setNotices(notices.map(notice => 
          notice.id === selectedNotice.id 
            ? {
                ...notice,
                title: formData.title,
                content: formData.content,
                isPinned: formData.isPinned,
                updated_at: new Date().toISOString()
              } 
            : notice
        ))

        // 3초 후 다이얼로그 닫기
        setTimeout(() => {
          setIsEditDialogOpen(false)
          setSuccess(null)
        }, 2000)
      } else {
        setError(result.error?.message || "공지사항 수정에 실패했습니다.")
      }
    } catch (err) {
      console.error("공지사항 수정 중 오류:", err)
      setError("공지사항 수정 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 공지사항 삭제 제출
  const handleDeleteSubmit = async () => {
    if (!selectedNotice) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await adminService.deleteNotice(selectedNotice.id)
      
      if (result.success) {
        // 목록에서 해당 공지사항 제거
        setNotices(notices.filter(notice => notice.id !== selectedNotice.id))
        setIsDeleteDialogOpen(false)
      } else {
        setError(result.error?.message || "공지사항 삭제에 실패했습니다.")
      }
    } catch (err) {
      console.error("공지사항 삭제 중 오류:", err)
      setError("공지사항 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 공지사항 표시/숨김 토글 함수 수정
  const handleToggleVisibility = async (notice: NoticeDisplay) => {
    try {
      // 현재 상태의 반대로 업데이트
      if (notice.isHidden) {
        // 숨김 해제
        const result = await adminService.unhideNotice(notice.id)
        if (result.success && result.data) {
          setNotices(notices.map(n => 
            n.id === notice.id ? { ...n, isHidden: false } : n
          ))
          
          // 운세 메시지 토스트 표시
          if ('message' in result.data) {
            toast.info("🔮 오늘의 운세", {
              description: result.data.message,
              duration: 5000
            });
          }
        }
      } else {
        // 숨김 처리
        const result = await adminService.hideNotice(notice.id)
        if (result.success && result.data) {
          setNotices(notices.map(n => 
            n.id === notice.id ? { ...n, isHidden: true } : n
          ))
          
          // 명언 토스트 표시
          if ('message' in result.data) {
            toast.success("✨ 오늘의 명언", {
              description: result.data.message,
              duration: 5000
            });
          }
        }
      }
    } catch (err) {
      console.error("공지사항 상태 변경 중 오류:", err)
      toast.error("공지사항 상태 변경 중 오류가 발생했습니다.");
    }
  }

  // 공지사항 고정 토글
  const handleTogglePinned = async (notice: NoticeDisplay) => {
    try {
      // 현재 상태의 반대로 업데이트
      if (notice.isPinned) {
        // 고정 해제
        const result = await adminService.unpinNotice(notice.id)
        if (result.success && result.data) {
          setNotices(notices.map(n => 
            n.id === notice.id ? { ...n, isPinned: false } : n
          ))
        }
      } else {
        // 고정 처리
        const result = await adminService.pinNotice(notice.id)
        if (result.success && result.data) {
          setNotices(notices.map(n => 
            n.id === notice.id ? { ...n, isPinned: true } : n
          ))
        }
      }
    } catch (err) {
      console.error("공지사항 고정 상태 변경 중 오류:", err)
    }
  }

  return (
    <AdminAuthCheck>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">공지사항 관리</h1>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            공지사항 작성
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>공지사항 목록</CardTitle>
            <CardDescription>
              웹사이트 공지사항을 관리합니다. 공지사항을 추가, 수정, 삭제하거나 표시 여부를 설정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="공지사항 제목 검색"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>상태</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead>작성일</TableHead>
                    <TableHead>만료일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        등록된 공지사항이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotices.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {notice.isPinned && (
                              <Badge variant="outline" className="bg-primary/20 text-primary">
                                <Pin className="h-3 w-3 mr-1" />
                                고정
                              </Badge>
                            )}
                            {notice.isHidden ? (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                <EyeOff className="h-3 w-3 mr-1" />
                                숨김
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                <Eye className="h-3 w-3 mr-1" />
                                표시중
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{notice.title}</div>
                        </TableCell>
                        <TableCell>{notice.author}</TableCell>
                        <TableCell>{notice.date ? formatDate(notice.date) : '-'}</TableCell>
                        <TableCell>
                          {notice.expiryDate ? (
                            formatDate(notice.expiryDate)
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVisibility(notice)}
                            className="mr-1"
                            title={notice.isHidden ? "공개하기" : "숨기기"}
                          >
                            {notice.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePinned(notice)}
                            className="mr-1"
                            title={notice.isPinned ? "고정 해제" : "고정하기"}
                          >
                            <Pin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(notice)}
                            className="mr-1"
                            title="상세 보기"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(notice)}
                            className="mr-1"
                            title="수정"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(notice)} title="삭제">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 공지사항 추가 다이얼로그 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>공지사항 작성</DialogTitle>
            <DialogDescription>새로운 공지사항을 작성합니다. 제목과 내용은 필수 항목입니다.</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="공지사항 내용을 입력하세요"
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">만료일 (선택사항)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                만료일을 설정하면 해당 날짜 이후에는 공지사항이 자동으로 숨겨집니다.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPinned"
                checked={formData.isPinned}
                onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
              />
              <Label htmlFor="isPinned">중요 공지사항으로 고정</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddSubmit} disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 공지사항 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
            <DialogDescription>공지사항을 수정합니다. 제목과 내용은 필수 항목입니다.</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">제목 *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">내용 *</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="공지사항 내용을 입력하세요"
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-expiryDate">만료일 (선택사항)</Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                만료일을 설정하면 해당 날짜 이후에는 공지사항이 자동으로 숨겨집니다.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isPinned"
                checked={formData.isPinned}
                onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
              />
              <Label htmlFor="edit-isPinned">중요 공지사항으로 고정</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 공지사항 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공지사항 삭제 확인</DialogTitle>
            <DialogDescription>이 공지사항을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {selectedNotice && (
            <div className="py-4">
              <p className="font-medium">{selectedNotice.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                작성자: {selectedNotice.author} | 작성일: {selectedNotice.date ? formatDate(selectedNotice.date) : '-'}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isSubmitting}>
              {isSubmitting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 공지사항 상세 보기 다이얼로그 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>공지사항 상세 보기</DialogTitle>
          </DialogHeader>

          {selectedNotice && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-xl font-bold">{selectedNotice.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>작성자: {selectedNotice.author}</span>
                  <span>|</span>
                  <span>작성일: {selectedNotice.date ? formatDate(selectedNotice.date) : '-'}</span>
                  {selectedNotice.expiryDate && (
                    <>
                      <span>|</span>
                      <span>만료일: {formatDate(selectedNotice.expiryDate)}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {selectedNotice.isPinned && (
                    <Badge variant="outline" className="bg-primary/20 text-primary">
                      <Pin className="h-3 w-3 mr-1" />
                      고정
                    </Badge>
                  )}
                  {selectedNotice.isHidden ? (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      <EyeOff className="h-3 w-3 mr-1" />
                      숨김
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <Eye className="h-3 w-3 mr-1" />
                      표시중
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-md min-h-[200px] whitespace-pre-line">
                {selectedNotice.content}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              닫기
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                if (selectedNotice) {
                  handleEditClick(selectedNotice)
                }
              }}
            >
              수정하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminAuthCheck>
  )
}