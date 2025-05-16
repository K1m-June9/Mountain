// src/lib/services/settings_service.ts
import adminService from "@/lib/services/admin_service"

/**
 * 설정 관련 서비스 함수들을 제공하는 클래스
 */
export class SettingsService {
  /**
   * 모든 설정 가져오기
   */
  async getSettings() {
    const result = await adminService.getSettings()
    if (!result.success) {
      throw new Error(result.error?.message || "설정을 불러오는데 실패했습니다.")
    }
    return result.data
  }

  /**
   * 설정 업데이트
   */
  async updateSettings(section: string, data: any) {
    const result = await adminService.updateSettings(section, data)
    if (!result.success) {
      throw new Error(result.error?.message || "설정 저장에 실패했습니다.")
    }
    return result.data
  }

  /**
   * 설정 초기화
   */
  async resetSettings(section: string) {
    const result = await adminService.resetSettings(section)
    if (!result.success) {
      throw new Error(result.error?.message || "설정 초기화에 실패했습니다.")
    }
    return result.data
  }
}

// 싱글톤 인스턴스 생성
const settingsService = new SettingsService()
export default settingsService