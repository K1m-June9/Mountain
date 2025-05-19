// src/lib/types/admin/setting.ts

import { ID, Timestamps } from '../common';
import { Setting, SettingUpdateRequest } from '../setting';

/**
 * 관리자 설정 관련 타입 정의
 */

/**
 * 사이트 설정
 */
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
}

/**
 * 신고 설정
 */
export interface ReportSettings {
  autoHideThreshold: number;
  requireReasonForReport: boolean;
  allowAnonymousReports: boolean;
  notifyAdminsOnReport: boolean;
}

/**
 * 알림 설정
 */
export interface NotificationSettings {
  enableEmailNotifications: boolean;
  enableBrowserNotifications: boolean;
  adminEmailNotifications: boolean;
  notifyOnNewUser: boolean;
  notifyOnNewReport: boolean;
}

/**
 * 관리자 설정 업데이트 요청
 */
export interface AdminSettingUpdateRequest extends SettingUpdateRequest {
  section?: string;
}

/**
 * 관리자 설정 응답
 */
export interface AdminSetting extends Setting {
  section: string;
  is_system: boolean;
}

/**
 * 설정 섹션 타입
 */
export type SettingSection = 'site' | 'report' | 'notification' | 'security' | 'system';

/**
 * 설정 섹션별 그룹화된 응답
 */
export interface GroupedSettings {
  site: SiteSettings;
  report: ReportSettings;
  notification: NotificationSettings;
  security: Record<string, any>;
  system: Record<string, any>;
}

/**
 * 설정 초기화 응답
 */
export interface SettingResetResponse {
  success: boolean;
  section: SettingSection;
  message: string;
  settings: AdminSetting[];
}

/**
 * 설정 업데이트 응답
 */
export interface SettingUpdateResponse {
  success: boolean;
  section: SettingSection;
  settings: AdminSetting[];
}

/**
 * 설정 백업 정보
 */
export interface SettingBackup extends Timestamps {
  id: ID;
  created_by: ID;
  backup_data: string;
  description: string;
}

/**
 * 설정 백업 생성 요청
 */
export interface SettingBackupCreateRequest {
  description: string;
}

/**
 * 설정 복원 요청
 */
export interface SettingRestoreRequest {
  backup_id: ID;
}