import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportSettings } from "@/components/admin/settings/report-settings"
import { NotificationSettings } from "@/components/admin/settings/notification-settings"
import { SiteSettings } from "@/components/admin/settings/site-settings"

export default function AdminSettingsPage() {
  return (
    <AdminAuthCheck>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">관리자 설정</h1>
        </div>

        <Tabs defaultValue="report" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="report">신고 및 제재 설정</TabsTrigger>
            <TabsTrigger value="notification">알림 설정</TabsTrigger>
            <TabsTrigger value="site">사이트 설정</TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-4">
            <ReportSettings />
          </TabsContent>

          <TabsContent value="notification" className="space-y-4">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="site" className="space-y-4">
            <SiteSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthCheck>
  )
}
