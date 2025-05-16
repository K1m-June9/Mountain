"use client"

import { useState, useEffect } from "react"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, EyeOff, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils/date"
// 수정된 임포트:
import adminService from "@/lib/services/admin_service"
import { reportReasonLabels, type ReportReason } from "@/lib/types/report"
import { useToast } from "@/hooks/use-sonner"
import type { PostReport, CommentReport } from "@/lib/types/admin"
import type { ID } from "@/lib/types/common"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("posts")

  return (
    <AdminAuthCheck>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">신고 관리</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">게시글 신고</TabsTrigger>
            <TabsTrigger value="comments">댓글 신고</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <PostReportsTab />
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <CommentReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthCheck>
  )
}

function PostReportsTab() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState<PostReport | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [reports, setReports] = useState<PostReport[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // 데이터 로드
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const response = await adminService.getPostReports()
        if (response.success && response.data) {
          setReports(response.data.items)
        } else {
          toast.error(response.error?.message || "신고 목록을 불러오는데 실패했습니다.")
        }
      } catch (error) {
        console.error("Error fetching post reports:", error)
        toast.error("신고 목록을 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [toast])

  // 필터링 및 검색 적용
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.post?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.reason || "").toLowerCase().includes(searchTerm.toLowerCase())

    if (statusFilter === "all") return matchesSearch
    if (statusFilter === "pending") return report.status === "pending" && matchesSearch
    if (statusFilter === "approved") return report.status === "reviewed" && matchesSearch
    if (statusFilter === "rejected") return report.status === "rejected" && matchesSearch
    if (statusFilter === "hidden") return report.post?.is_hidden && matchesSearch

    return matchesSearch
  })

  const handleViewDetail = (report: PostReport) => {
    setSelectedReport(report)
    setIsDetailOpen(true)
  }

  const handleApprove = async (reportId: ID) => {
    setActionLoading(true)
    try {
      const response = await adminService.approveReport(reportId, "post")
      if (response.success) {
        // 상태 업데이트
        setReports(
          reports.map((report) => 
            report.id === reportId 
              ? { ...report, status: "reviewed", post: { ...report.post, is_hidden: true } } 
              : report
          )
        )
        toast.success("게시글이 숨김 처리되었습니다.")
        setIsDetailOpen(false)
      } else {
        toast.error(response.error?.message || "신고 승인 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error approving report:", error)
      toast.error("신고 승인 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (reportId: ID) => {
    setActionLoading(true)
    try {
      const response = await adminService.rejectReport(reportId, "post")
      if (response.success) {
        // 상태 업데이트
        setReports(
          reports.map((report) => 
            report.id === reportId 
              ? { ...report, status: "rejected" } 
              : report
          )
        )
        toast.success("신고가 거부되었습니다")
        setIsDetailOpen(false)
      } else {
        toast.error(response.error?.message || "신고 거부 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error rejecting report:", error)
      toast.error("신고 거부 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnhide = async (postId: ID) => {
    setActionLoading(true)
    try {
      const response = await adminService.unhidePost(postId)
      if (response.success) {
        // 상태 업데이트
        setReports(
          reports.map((report) => 
            report.post?.id === postId 
              ? { ...report, post: { ...report.post, is_hidden: false } } 
              : report
          )
        )
        toast.success("게시글 숨김이 해제되었습니다")
        setIsDetailOpen(false)
      } else {
        toast.error(response.error?.message || "게시글 숨김 해제 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error unhiding post:", error)
      toast.error("게시글 숨김 해제 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (postId: ID) => {
    setActionLoading(true)
    try {
      const response = await adminService.deletePost(postId)
      if (response.success) {
        // 상태 업데이트 - 해당 게시글 관련 신고 필터링
        setReports(reports.filter((report) => report.post?.id !== postId))
        toast.success("게시글이 삭제되었습니다")
        setIsDeleteDialogOpen(false)
        setIsDetailOpen(false)
      } else {
        toast.error(response.error?.message || "게시글 삭제 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("게시글 삭제 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">신고 목록을 불러오는 중...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>게시글 신고 목록</CardTitle>
          <CardDescription>
            사용자가 신고한 게시글 목록입니다. 신고 내용을 검토하고 적절한 조치를 취하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="게시글 제목 또는 신고 사유 검색"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="상태 필터" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 신고</SelectItem>
                  <SelectItem value="pending">대기 중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                  <SelectItem value="hidden">숨김 처리됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>게시글 제목</TableHead>
                  <TableHead>신고 사유</TableHead>
                  <TableHead>신고일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      신고된 게시글이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{report.post?.title}</div>
                        <div className="text-xs text-muted-foreground">게시글 ID: {report.post?.id}</div>
                      </TableCell>
                      <TableCell>{reportReasonLabels[report.reason as ReportReason] || report.reason}</TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <ReportStatusBadge status={report.status} isHidden={report.post?.is_hidden} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(report)}>
                          <Eye className="h-4 w-4 mr-1" />
                          상세
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

      {/* 신고 상세 정보 다이얼로그 */}
      {selectedReport && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>신고 상세 정보</DialogTitle>
              <DialogDescription>
                신고 ID: {selectedReport.id} | 게시글 ID: {selectedReport.post?.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">게시글 제목</h3>
                <p className="mt-1">{selectedReport.post?.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium">게시글 내용</h3>
                <div className="mt-1 p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
                  <p className="whitespace-pre-line">{selectedReport.post?.content}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">신고 사유</h3>
                  <p className="mt-1">{reportReasonLabels[selectedReport.reason as ReportReason] || selectedReport.reason}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">신고일</h3>
                  <p className="mt-1">{formatDate(selectedReport.created_at)}</p>
                </div>
              </div>

              {selectedReport.description && (
                <div>
                  <h3 className="text-sm font-medium">추가 설명</h3>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium">상태</h3>
                <div className="mt-1">
                  <ReportStatusBadge status={selectedReport.status} isHidden={selectedReport.post?.is_hidden} />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedReport.status === "pending" && (
                <>
                  <Button variant="outline" onClick={() => handleReject(selectedReport.id)} disabled={actionLoading}>
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    신고 거부
                  </Button>
                  <Button variant="default" onClick={() => handleApprove(selectedReport.id)} disabled={actionLoading}>
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    신고 승인
                  </Button>
                </>
              )}

              {selectedReport.post?.is_hidden && (
                <Button variant="outline" onClick={() => handleUnhide(selectedReport.post?.id)} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                  숨김 해제
                </Button>
              )}

              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={actionLoading}>
                <Trash2 className="h-4 w-4 mr-2" />
                게시글 삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {selectedReport && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>게시글 삭제 확인</DialogTitle>
              <DialogDescription>이 게시글을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">{selectedReport.post?.title}</p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedReport.post?.id)}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "삭제"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CommentReportsTab() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState<CommentReport | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [reports, setReports] = useState<CommentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // 데이터 로드
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const response = await adminService.getCommentReports()
        if (response.success && response.data) {
          setReports(response.data.items)
        } else {
          toast.error(response.error?.message || "신고 목록을 불러오는데 실패했습니다.")
        }
      } catch (error) {
        console.error("Error fetching comment reports:", error)
        toast.error("신고 목록을 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [toast])

  // 필터링 및 검색 적용
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.comment?.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.reason || "").toLowerCase().includes(searchTerm.toLowerCase())

    if (statusFilter === "all") return matchesSearch
    if (statusFilter === "pending") return report.status === "pending" && matchesSearch
    if (statusFilter === "approved") return report.status === "reviewed" && matchesSearch
    if (statusFilter === "rejected") return report.status === "rejected" && matchesSearch
    if (statusFilter === "hidden") return report.comment?.is_hidden && matchesSearch

    return matchesSearch
  })

  const handleViewDetail = (report: CommentReport) => {
    setSelectedReport(report)
    setIsDetailOpen(true)
  }

  const handleApprove = async (reportId: ID) => {
    setActionLoading(true)
    try {
      const response = await adminService.approveReport(reportId, "comment")
      if (response.success) {
        // 상태 업데이트
        setReports(
          reports.map((report) => 
            report.id === reportId 
              ? { ...report, status: "reviewed", comment: { ...report.comment, is_hidden: true } } 
              : report
          )
        )
        toast.success("신고가 승인되었습니다")
        setIsDetailOpen(false)
      } else {
        toast.error(response.error?.message || "신고 승인 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error approving report:", error)
      toast.error("신고 승인 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (reportId: ID) => {
    setActionLoading(true)
    try {
      const response = await adminService.rejectReport(reportId, "comment")
      if (response.success) {
        // 상태 업데이트
        setReports(
          reports.map((report) => 
            report.id === reportId 
              ? { ...report, status: "rejected" } 
              : report
          )
        )
        toast.success("신고가 거부되었습니다")
        setIsDetailOpen(false)
      } else {
        toast.error(response.error?.message || "신고 거부 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error rejecting report:", error)
      toast.error("신고 거부 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnhide = async (commentId: ID) => {
    setActionLoading(true)
    try {
      const response = await adminService.unhideComment(commentId)
      if (response.success) {
        // 상태 업데이트
        setReports(
          reports.map((report) => 
            report.comment?.id === commentId 
              ? { ...report, comment: { ...report.comment, is_hidden: false } } 
              : report
          )
        )
        toast.success("댓글 숨김이 해제되었습니다")
        setIsDetailOpen(false)
      } else {
        toast.error(response.error?.message || "댓글 숨김 해제 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error unhiding comment:", error)
      toast.error("댓글 숨김 해제 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (commentId: ID) => {
    setActionLoading(true)
    try {
      const response = await adminService.deleteComment(commentId)
      if (response.success) {
        // 상태 업데이트 - 해당 댓글 관련 신고 필터링
        setReports(reports.filter((report) => report.comment?.id !== commentId))
        toast.success("댓글이 삭제되었습니다")
        setIsDeleteDialogOpen(false)
        setIsDetailOpen(false)
      } else {
        toast.error(response.error?.message || "댓글 삭제 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("댓글 삭제 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">신고 목록을 불러오는 중...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>댓글 신고 목록</CardTitle>
          <CardDescription>
            사용자가 신고한 댓글 목록입니다. 신고 내용을 검토하고 적절한 조치를 취하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="댓글 내용 또는 신고 사유 검색"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="상태 필터" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 신고</SelectItem>
                  <SelectItem value="pending">대기 중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                  <SelectItem value="hidden">숨김 처리됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>댓글 내용</TableHead>
                  <TableHead>신고 사유</TableHead>
                  <TableHead>신고일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      신고된 댓글이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.id}</TableCell>
                      <TableCell>
                        <div className="font-medium line-clamp-2">{report.comment?.content}</div>
                        <div className="text-xs text-muted-foreground">
                          댓글 ID: {report.comment?.id} | 게시글 ID: {report.comment?.post_id}
                        </div>
                      </TableCell>
                      <TableCell>{reportReasonLabels[report.reason as ReportReason] || report.reason}</TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <ReportStatusBadge status={report.status} isHidden={report.comment?.is_hidden} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(report)}>
                          <Eye className="h-4 w-4 mr-1" />
                          상세
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

      {/* 신고 상세 정보 다이얼로그 */}
      {selectedReport && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>댓글 신고 상세 정보</DialogTitle>
              <DialogDescription>
                신고 ID: {selectedReport.id} | 댓글 ID: {selectedReport.comment?.id} | 게시글 ID: {selectedReport.comment?.post_id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">댓글 내용</h3>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p>{selectedReport.comment?.content}</p>
                </div>
              </div>

              {/* 게시글 제목 부분 제거 - Comment 타입에 post 속성이 없음 */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">신고 사유</h3>
                  <p className="mt-1">{reportReasonLabels[selectedReport.reason as ReportReason] || selectedReport.reason}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">신고일</h3>
                  <p className="mt-1">{formatDate(selectedReport.created_at)}</p>
                </div>
              </div>

              {selectedReport.description && (
                <div>
                  <h3 className="text-sm font-medium">추가 설명</h3>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium">상태</h3>
                <div className="mt-1">
                  <ReportStatusBadge status={selectedReport.status} isHidden={selectedReport.comment?.is_hidden} />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedReport.status === "pending" && (
                <>
                  <Button variant="outline" onClick={() => handleReject(selectedReport.id)} disabled={actionLoading}>
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    신고 거부
                  </Button>
                  <Button variant="default" onClick={() => handleApprove(selectedReport.id)} disabled={actionLoading}>
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    신고 승인
                  </Button>
                </>
              )}

              {selectedReport.comment?.is_hidden && (
                <Button
                  variant="outline"
                  onClick={() => handleUnhide(selectedReport.comment?.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                  숨김 해제
                </Button>
              )}

              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={actionLoading}>
                <Trash2 className="h-4 w-4 mr-2" />
                댓글 삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {selectedReport && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>댓글 삭제 확인</DialogTitle>
              <DialogDescription>이 댓글을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-muted rounded-md">
              <p>{selectedReport.comment?.content}</p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedReport.comment?.id)}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "삭제"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function ReportStatusBadge({ status, isHidden }: { status: string; isHidden?: boolean }) {
  if (isHidden) {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        <EyeOff className="h-3 w-3 mr-1" />
        숨김 처리됨
      </Badge>
    )
  }

  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          대기 중
        </Badge>
      )
    case "reviewed":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          승인됨
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="h-3 w-3 mr-1" />
          거부됨
        </Badge>
      )
    default:
      return null
  }
}