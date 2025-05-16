"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { useSettings } from "@/hooks/use-settings"
import type { NotificationSettings as NotificationSettingsType } from "@/hooks/use-settings"

export function NotificationSettings() {
  const {
    settings,
    loading,
    saving,
    resetting,
    saveSettings,
    resetSettings,
    updateSettings
  } = useSettings<NotificationSettingsType>("notification")

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!settings) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>사용자 및 관리자 알림과 관련된 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyUserOnSanction">제재 시 사용자 알림</Label>
              <p className="text-sm text-muted-foreground">사용자가 제재를 받으면 해당 사용자에게 알림을 보냅니다.</p>
            </div>
            <Switch
              id="notifyUserOnSanction"
              checked={settings.notifyUserOnSanction}
              onCheckedChange={(checked) => updateSettings({ notifyUserOnSanction: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyUserOnReportResult">신고 결과 알림</Label>
              <p className="text-sm text-muted-foreground">신고 처리 결과를 신고자에게 알립니다.</p>
            </div>
            <Switch
              id="notifyUserOnReportResult"
              checked={settings.notifyUserOnReportResult}
              onCheckedChange={(checked) => updateSettings({ notifyUserOnReportResult: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyAdminOnHighPriorityReport">우선순위 신고 알림</Label>
              <p className="text-sm text-muted-foreground">우선순위가 높은 신고가 접수되면 관리자에게 즉시 알립니다.</p>
            </div>
            <Switch
              id="notifyAdminOnHighPriorityReport"
              checked={settings.notifyAdminOnHighPriorityReport}
              onCheckedChange={(checked) => updateSettings({ notifyAdminOnHighPriorityReport: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableInAppNotifications">앱 내 알림 활성화</Label>
              <p className="text-sm text-muted-foreground">사이트 내에서 알림을 표시합니다.</p>
            </div>
            <Switch
              id="enableInAppNotifications"
              checked={settings.enableInAppNotifications}
              onCheckedChange={(checked) => updateSettings({ enableInAppNotifications: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableBrowserNotifications">브라우저 알림 활성화</Label>
              <p className="text-sm text-muted-foreground">브라우저 푸시 알림을 활성화합니다. (사용자 동의 필요)</p>
            </div>
            <Switch
              id="enableBrowserNotifications"
              checked={settings.enableBrowserNotifications}
              onCheckedChange={(checked) => updateSettings({ enableBrowserNotifications: checked })}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetSettings} disabled={resetting}>
          {resetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          기본값으로 초기화
        </Button>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          설정 저장
        </Button>
      </CardFooter>
    </Card>
  )
}