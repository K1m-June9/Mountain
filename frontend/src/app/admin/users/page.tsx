import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { UserList } from "@/components/admin/user-list"
import { UserStats } from "@/components/admin/user-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminUsersPage() {
  return (
    <AdminAuthCheck>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">사용자 관리</h1>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list">사용자 목록</TabsTrigger>
            <TabsTrigger value="stats">사용자 통계</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6">
            <UserList />
          </TabsContent>
          <TabsContent value="stats" className="mt-6">
            <UserStats />
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthCheck>
  )
}
