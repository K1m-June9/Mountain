// src/hooks/use-settings.ts
"use client"
// src/hooks/use-settings.ts
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-sonner"
import adminService from "@/lib/services/admin_service"

// 설정 타입 정의
export interface NotificationSettings {
  notifyUserOnSanction: boolean
  notifyUserOnReportResult: boolean
  notifyAdminOnHighPriorityReport: boolean
  enableInAppNotifications: boolean
  enableBrowserNotifications: boolean
}

export interface ReportSettings {
  autoHideThreshold: number
  defaultSanctionPeriod: number
  enableAutoSanction: boolean
  notifyAdminOnReport: boolean
  sanctionReasonRequired: boolean
}

export interface SiteSettings {
  siteName: string
  siteDescription: string
  primaryColor: string
  secondaryColor: string
  logoUrl: string
  faviconUrl: string
  footerText: string
  enableDarkMode: boolean
  defaultTheme: "light" | "dark" | "system"
}

export type SettingsType = "notification" | "report" | "site"
export type Settings = NotificationSettings | ReportSettings | SiteSettings

// 설정 관리 커스텀 훅
export function useSettings<T extends Settings>(settingType: SettingsType) {
  const { toast } = useToast()
  const [settings, setSettings] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      try {
        const result = await adminService.getSettings()
        if (result.success && result.data) {
          setSettings(result.data[settingType] as T)
        } else {
          toast.error("설정을 불러오는데 실패했습니다.")
        }
      } catch (error) {
        console.error(`Failed to load ${settingType} settings:`, error)
        toast.error("설정을 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [settingType, toast])

  // 설정 저장
  const saveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const result = await adminService.updateSettings(settingType, settings)
      if (result.success) {
        toast.success("설정이 저장되었습니다.")
      } else {
        toast.error("설정 저장에 실패했습니다.")
      }
    } catch (error) {
      console.error(`Failed to save ${settingType} settings:`, error)
      toast.error("설정 저장에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  // 설정 초기화
  const resetSettings = async () => {
    setResetting(true)
    try {
      const result = await adminService.resetSettings(settingType)
      if (result.success && result.data) {
        setSettings(result.data[settingType] as T)
        toast.success("설정이 초기화되었습니다.")
      } else {
        toast.error("설정 초기화에 실패했습니다.")
      }
    } catch (error) {
      console.error(`Failed to reset ${settingType} settings:`, error)
      toast.error("설정 초기화에 실패했습니다.")
    } finally {
      setResetting(false)
    }
  }

  // 설정 업데이트
  const updateSettings = (newSettings: Partial<T>) => {
    if (settings) {
      setSettings({ ...settings, ...newSettings })
    }
  }

  return {
    settings,
    loading,
    saving,
    resetting,
    saveSettings,
    resetSettings,
    updateSettings
  }
}