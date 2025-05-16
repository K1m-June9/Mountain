"use client"

import { useState, useEffect } from "react"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Building, Loader2 } from 'lucide-react'
import adminService from "@/lib/services/admin_service"
import { useToast } from "@/hooks/use-sonner"
import type { Institution } from "@/lib/types/institution"

// 확장된 Institution 타입 (color 필드 포함)
interface InstitutionWithColor extends Institution {
  color?: string;
}

export default function InstitutionsPage() {
  const { toast } = useToast()
  const [institutions, setInstitutions] = useState<InstitutionWithColor[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionWithColor | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6", // 기본 색상
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // 데이터 로드
  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoading(true)
      try {
        const response = await adminService.getInstitutions()
        if (response.success && response.data) {
          // 타입 안전성을 위해 필터링
          const items = response.data.items.filter((item): item is InstitutionWithColor => !!item);
          setInstitutions(items)
        } else {
          toast.error(response.error?.message || "기관 목록을 불러오는데 실패했습니다.")
        }
      } catch (error) {
        console.error("Error fetching institutions:", error)
        toast.error("기관 목록을 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchInstitutions()
  }, [toast])

  const handleAddClick = () => {
    setFormData({
      name: "",
      description: "",
      color: "#3b82f6",
    })
    setIsAddDialogOpen(true)
  }

  const handleEditClick = (institution: InstitutionWithColor) => {
    setSelectedInstitution(institution)
    setFormData({
      name: institution.name,
      description: institution.description || "",
      color: institution.color || "#3b82f6",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (institution: InstitutionWithColor) => {
    setSelectedInstitution(institution)
    setIsDeleteDialogOpen(true)
  }

  const handleAddSubmit = async () => {
    if (!formData.name.trim()) return

    setActionLoading(true)
    try {
      const response = await adminService.addInstitution({
        name: formData.name,
        description: formData.description,
        color: formData.color
      })
      
      if (response.success && response.data) {
        // 타입 캐스팅을 사용하여 color 필드 추가
        const newInstitution: InstitutionWithColor = {
          ...response.data,
          color: formData.color
        };
        setInstitutions([...institutions, newInstitution])
        toast.success("기관이 추가되었습니다")
        setIsAddDialogOpen(false)
      } else {
        toast.error(response.error?.message || "기관 추가 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error adding institution:", error)
      toast.error("기관 추가 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!formData.name.trim() || !selectedInstitution) return

    setActionLoading(true)
    try {
      const response = await adminService.updateInstitution(
        selectedInstitution.id,
        {
          name: formData.name,
          description: formData.description,
          color: formData.color
        }
      )
      
      if (response.success && response.data) {
        // 타입 캐스팅을 사용하여 color 필드 추가
        const updatedInstitution: InstitutionWithColor = {
          ...response.data,
          color: formData.color
        };
        
        setInstitutions(institutions.map((inst) => 
          inst.id === selectedInstitution.id ? updatedInstitution : inst
        ))
        toast.success("기관 정보가 수정되었습니다")
        setIsEditDialogOpen(false)
      } else {
        toast.error(response.error?.message || "기관 정보 수정 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error updating institution:", error)
      toast.error("기관 정보 수정 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedInstitution) return

    setActionLoading(true)
    try {
      const response = await adminService.deleteInstitution(selectedInstitution.id)
      
      if (response.success) {
        setInstitutions(institutions.filter((inst) => inst.id !== selectedInstitution.id))
        toast.success("기관이 삭제되었습니다")
        setIsDeleteDialogOpen(false)
      } else {
        toast.error(response.error?.message || "기관 삭제 중 문제가 발생했습니다.")
      }
    } catch (error) {
      console.error("Error deleting institution:", error)
      toast.error("기관 삭제 중 문제가 발생했습니다.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminAuthCheck>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">기관 관리</h1>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">기관 목록을 불러오는 중...</span>
            </CardContent>
          </Card>
        </div>
      </AdminAuthCheck>
    )
  }

  return (
    <AdminAuthCheck>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">기관 관리</h1>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            기관 추가
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>기관 목록</CardTitle>
            <CardDescription>
              커뮤니티에서 사용되는 기관 정보를 관리합니다. 기관 정보를 수정하거나 새로운 기관을 추가할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>기관명</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>색상</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        등록된 기관이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    institutions.map((institution) => (
                      <TableRow key={institution.id}>
                        <TableCell>{institution.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span className="font-medium">{institution.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{institution.description || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: institution.color || "#3b82f6" }}
                            />
                            <span>{institution.color || "#3b82f6"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(institution)}
                            className="mr-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">수정</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(institution)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">삭제</span>
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

      {/* 기관 추가 다이얼로그 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기관 추가</DialogTitle>
            <DialogDescription>새로운 기관 정보를 입력하세요. 기관명은 필수 항목입니다.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">기관명 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="기관명을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="기관에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">색상</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 p-1 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#HEX"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={actionLoading}>
              취소
            </Button>
            <Button onClick={handleAddSubmit} disabled={!formData.name.trim() || actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기관 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기관 수정</DialogTitle>
            <DialogDescription>기관 정보를 수정하세요. 기관명은 필수 항목입니다.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">기관명 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="기관명을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="기관에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-color">색상</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 p-1 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#HEX"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={actionLoading}>
              취소
            </Button>
            <Button onClick={handleEditSubmit} disabled={!formData.name.trim() || actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기관 삭제 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기관 삭제 확인</DialogTitle>
            <DialogDescription>
              이 기관을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 관련된 게시글에 영향을 줄 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          {selectedInstitution && (
            <div className="py-4">
              <p className="font-medium">{selectedInstitution.name}</p>
              {selectedInstitution.description && (
                <p className="text-sm text-muted-foreground mt-1">{selectedInstitution.description}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminAuthCheck>
  )
}