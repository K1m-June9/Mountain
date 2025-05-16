"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'
import { useSettings } from "@/hooks/use-settings"
import type { SiteSettings as SiteSettingsType } from "@/hooks/use-settings"

export function SiteSettings() {
  const {
    settings,
    loading,
    saving,
    resetting,
    saveSettings,
    resetSettings,
    updateSettings
  } = useSettings<SiteSettingsType>("site")

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
        <CardTitle>사이트 설정</CardTitle>
        <CardDescription>사이트의 기본 정보 및 디자인과 관련된 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">사이트 이름</Label>
          <Input
            id="siteName"
            value={settings.siteName}
            onChange={(e) => updateSettings({ siteName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteDescription">사이트 설명</Label>
          <Input
            id="siteDescription"
            value={settings.siteDescription}
            onChange={(e) => updateSettings({ siteDescription: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">주 색상</Label>
            <div className="flex space-x-2">
              <Input
                id="primaryColor"
                type="color"
                className="w-12 p-1 h-10"
                value={settings.primaryColor}
                onChange={(e) => updateSettings({ primaryColor: e.target.value })}
              />
              <Input
                value={settings.primaryColor}
                onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">보조 색상</Label>
            <div className="flex space-x-2">
              <Input
                id="secondaryColor"
                type="color"
                className="w-12 p-1 h-10"
                value={settings.secondaryColor}
                onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
              />
              <Input
                value={settings.secondaryColor}
                onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logoUrl">로고 URL</Label>
          <Input
            id="logoUrl"
            value={settings.logoUrl}
            onChange={(e) => updateSettings({ logoUrl: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="faviconUrl">파비콘 URL</Label>
          <Input
            id="faviconUrl"
            value={settings.faviconUrl}
            onChange={(e) => updateSettings({ faviconUrl: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="footerText">푸터 텍스트</Label>
          <Input
            id="footerText"
            value={settings.footerText}
            onChange={(e) => updateSettings({ footerText: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableDarkMode">다크 모드 활성화</Label>
              <p className="text-sm text-muted-foreground">사이트에서 다크 모드를 사용할 수 있도록 합니다.</p>
            </div>
            <Switch
              id="enableDarkMode"
              checked={settings.enableDarkMode}
              onCheckedChange={(checked) => updateSettings({ enableDarkMode: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultTheme">기본 테마</Label>
          <Select
            value={settings.defaultTheme}
            onValueChange={(value) => updateSettings({ defaultTheme: value as "light" | "dark" | "system" })}
            disabled={!settings.enableDarkMode}
          >
            <SelectTrigger id="defaultTheme">
              <SelectValue placeholder="테마 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">라이트 모드</SelectItem>
              <SelectItem value="dark">다크 모드</SelectItem>
              <SelectItem value="system">시스템 설정 따름</SelectItem>
            </SelectContent>
          </Select>
          {!settings.enableDarkMode && (
            <p className="text-sm text-muted-foreground">다크 모드가 비활성화되어 있어 이 설정은 적용되지 않습니다.</p>
          )}
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