import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { UserDetail } from "@/components/admin/user-detail"

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminAuthCheck>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">사용자 상세 정보</h1>
        <UserDetail userId={String(params.id)} />
      </div>
    </AdminAuthCheck>
  )
}
