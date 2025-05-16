"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'
import { useSettings } from "@/hooks/use-settings"
import type { ReportSettings as ReportSettingsType } from "@/hooks/use-settings"

export function ReportSettings() {
  const {
    settings,
    loading,
    saving,
    resetting,
    saveSettings,
    resetSettings,
    updateSettings
  } = useSettings<ReportSettingsType>("report")

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
        <CardTitle>신고 및 제재 설정</CardTitle>
        <CardDescription>신고 처리 및 사용자 제재와 관련된 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoHideThreshold">자동 숨김 임계값</Label>
            <div className="w-[180px]">
              <Select
                value={settings.autoHideThreshold.toString()}
                onValueChange={(value) => updateSettings({ autoHideThreshold: Number.parseInt(value) })}
              >
                <SelectTrigger id="autoHideThreshold">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1회</SelectItem>
                  <SelectItem value="2">2회</SelectItem>
                  <SelectItem value="3">3회</SelectItem>
                  <SelectItem value="5">5회</SelectItem>
                  <SelectItem value="10">10회</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            게시물이나 댓글이 이 횟수 이상 신고되면 자동으로 숨김 처리됩니다.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="defaultSanctionPeriod">기본 제재 기간</Label>
            <div className="w-[180px]">
              <Select
                value={settings.defaultSanctionPeriod.toString()}
                onValueChange={(value) => updateSettings({ defaultSanctionPeriod: Number.parseInt(value) })}
              >
                <SelectTrigger id="defaultSanctionPeriod">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1일</SelectItem>
                  <SelectItem value="3">3일</SelectItem>
                  <SelectItem value="7">7일</SelectItem>
                  <SelectItem value="15">15일</SelectItem>
                  <SelectItem value="30">30일</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">사용자 제재 시 기본으로 설정되는 제재 기간입니다.</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableAutoSanction">자동 제재 활성화</Label>
              <p className="text-sm text-muted-foreground">임계값을 초과한 신고를 받은 사용자를 자동으로 제재합니다.</p>
            </div>
            <Switch
              id="enableAutoSanction"
              checked={settings.enableAutoSanction}
              onCheckedChange={(checked) => updateSettings({ enableAutoSanction: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyAdminOnReport">신고 시 관리자 알림</Label>
              <p className="text-sm text-muted-foreground">신고가 접수되면 관리자에게 알림을 보냅니다.</p>
            </div>
            <Switch
              id="notifyAdminOnReport"
              checked={settings.notifyAdminOnReport}
              onCheckedChange={(checked) => updateSettings({ notifyAdminOnReport: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sanctionReasonRequired">제재 사유 필수화</Label>
              <p className="text-sm text-muted-foreground">사용자 제재 시 제재 사유 입력을 필수로 합니다.</p>
            </div>
            <Switch
              id="sanctionReasonRequired"
              checked={settings.sanctionReasonRequired}
              onCheckedChange={(checked) => updateSettings({ sanctionReasonRequired: checked })}
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