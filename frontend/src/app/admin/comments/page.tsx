"use client"

import { useState, useEffect } from "react"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, Filter, Eye, EyeOff, Trash2, MessageSquare, AlertTriangle, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/utils/date"
import adminService from "@/lib/services/admin_service"
import { useToast } from "@/hooks/use-sonner"
import Pagination from "@/components/pagination"
import type { Comment } from "@/lib/types/comment"
import type { ID } from "@/lib/types/common"

const reportReasonLabels: { [key: string]: string } = {
  hate_speech: "혐오 발언",
  spam: "스팸",
  harassment: "괴롭힘",
  inappropriate: "부적절한 내용",
  other: "기타",
}

// 확장된 Comment 타입 정의
interface CommentWithDetails extends Comment {
  author?: string;
  postTitle?: string;
  reports?: Array<{
    reason: string;
    description?: string;
  }>;
}

export default function CommentsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedComment, setSelectedComment] = useState<CommentWithDetails | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [comments, setComments] = useState<CommentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  useEffect(() => {
    fetchComments()
  }, [searchTerm, statusFilter, currentPage])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await adminService.getAllComments(
        currentPage, 
        pageSize, 
        statusFilter !== "all" ? statusFilter : "", 
        searchTerm
      )
      
      if (response.success && response.data) {
        setComments(response.data.comments as CommentWithDetails[])
        setTotalPages(response.data.totalPages)
      } else {
        toast.error(response.error?.message || "댓글을 불러오는데 실패했습니다.")
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast.error("댓글을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (comment: CommentWithDetails) => {
    setSelectedComment(comment)
    setIsDetailOpen(true)
  }

  const handleHide = async (commentId: ID) => {
    try {
      const response = await adminService.hideComment(commentId)
      if (response.success) {
        toast.success("댓글이 성공적으로 숨김 처리되었습니다.")
        setIsDetailOpen(false)
        fetchComments() // Refresh comments
      } else {
        toast.error(response.error?.message || "댓글 숨김 처리에 실패했습니다.")
      }
    } catch (error) {
      console.error("Error hiding comment:", error)
      toast.error("댓글 숨김 처리에 실패했습니다.")
    }
  }

  const handleUnhide = async (commentId: ID) => {
    try {
      const response = await adminService.unhideComment(commentId)
      if (response.success) {
        toast.success("댓글이 성공적으로 표시 처리되었습니다.")
        setIsDetailOpen(false)
        fetchComments() // Refresh comments
      } else {
        toast.error(response.error?.message || "댓글 표시 처리에 실패했습니다.")
      }
    } catch (error) {
      console.error("Error unhiding comment:", error)
      toast.error("댓글 표시 처리에 실패했습니다.")
    }
  }

  const handleDelete = async (commentId: ID) => {
    try {
      const response = await adminService.deleteComment(commentId)
      if (response.success) {
        toast.success("댓글이 성공적으로 삭제되었습니다.")
        setIsDeleteDialogOpen(false)
        setIsDetailOpen(false)
        fetchComments() // Refresh comments
      } else {
        toast.error(response.error?.message || "댓글 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("댓글 삭제에 실패했습니다.")
    }
  }

  return (
    <AdminAuthCheck>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">댓글 관리</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>댓글 목록</CardTitle>
            <CardDescription>모든 댓글을 관리합니다. 부적절한 댓글을 숨기거나 삭제할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="댓글 내용 또는 작성자 검색"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // Reset to first page on search
                  }}
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value)
                    setCurrentPage(1) // Reset to first page on filter
                  }}
                >
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
                      <SelectValue placeholder="상태 필터" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 댓글</SelectItem>
                    <SelectItem value="hidden">숨김 처리됨</SelectItem>
                    <SelectItem value="visible">표시 중</SelectItem>
                    <SelectItem value="reported">신고됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>내용</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead>작성일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" aria-hidden="true" />
                      </TableCell>
                    </TableRow>
                  ) : comments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        댓글이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    comments.map((comment) => (
                      <TableRow key={comment.id} className={comment.is_hidden ? "bg-gray-50" : ""}>
                        <TableCell>{comment.id}</TableCell>
                        <TableCell>
                          <div className="font-medium line-clamp-2">{comment.content}</div>
                          <div className="text-xs text-muted-foreground">게시글 ID: {comment.post_id}</div>
                        </TableCell>
                        <TableCell>{comment.author}</TableCell>
                        <TableCell>{formatDate(comment.created_at)}</TableCell>
                        <TableCell>
                          <CommentStatusBadge isHidden={comment.is_hidden} reportCount={comment.reports?.length || 0} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(comment)}>
                            <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                            상세
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 댓글 상세 정보 다이얼로그 */}
      {selectedComment && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>댓글 상세 정보</DialogTitle>
              <DialogDescription>
                댓글 ID: {selectedComment.id} | 게시글 ID: {selectedComment.post_id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">댓글 내용</h3>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p>{selectedComment.content}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">작성자</h3>
                  <p className="mt-1">{selectedComment.author}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">작성일</h3>
                  <p className="mt-1">{formatDate(selectedComment.created_at)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">게시글 제목</h3>
                <p className="mt-1">{selectedComment.postTitle || "게시글 정보를 불러올 수 없습니다."}</p>
              </div>

              {selectedComment.reports && selectedComment.reports.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium">신고 내역 ({selectedComment.reports.length}건)</h3>
                  <div className="mt-1 p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
                    <ul className="space-y-2">
                      {selectedComment.reports.map((report, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">신고 사유:</span> {reportReasonLabels[report.reason]}
                          {report.description && (
                            <div className="ml-4 mt-1 text-muted-foreground">
                              <span className="font-medium">추가 설명:</span> {report.description}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium">상태</h3>
                <div className="mt-1">
                  <CommentStatusBadge
                    isHidden={selectedComment.is_hidden}
                    reportCount={selectedComment.reports?.length || 0}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedComment.is_hidden ? (
                <Button variant="outline" onClick={() => handleUnhide(selectedComment.id)}>
                  <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                  숨김 해제
                </Button>
              ) : (
                <Button variant="outline" onClick={() => handleHide(selectedComment.id)}>
                  <EyeOff className="h-4 w-4 mr-2" aria-hidden="true" />
                  숨김 처리
                </Button>
              )}

              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                댓글 삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {selectedComment && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>댓글 삭제 확인</DialogTitle>
              <DialogDescription>이 댓글을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-muted rounded-md">
              <p>{selectedComment.content}</p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(selectedComment.id)}>
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminAuthCheck>
  )
}

function CommentStatusBadge({ isHidden, reportCount }: { isHidden: boolean; reportCount: number }) {
  if (isHidden) {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        <EyeOff className="h-3 w-3 mr-1" aria-hidden="true" />
        숨김 처리됨
      </Badge>
    )
  }

  if (reportCount > 0) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
        <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
        신고 {reportCount}건
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
      <MessageSquare className="h-3 w-3 mr-1" aria-hidden="true" />
      표시 중
    </Badge>
  )
}