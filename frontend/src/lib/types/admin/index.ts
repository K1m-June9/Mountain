// src/lib/types/admin/index.ts

// User 관련 타입 내보내기
export type {
  UserStatus,
  AdminUserDetail,
  UserActivity,
  RestrictionHistory,
  UserStatusUpdateRequest,
  UserRoleUpdateRequest,
  UserActivitiesResponse,
  AdminUserFilter
} from './user';

// Report 관련 타입 내보내기
export type {
  PostReport,
  CommentReport,
  ReportSettings,
  ReportSettingsUpdateRequest,
  AdminReportFilter,
  ReportActionResult,
  ReportStats,
  ReportDashboard,
  ReviewReportRequest
} from './report';

// Comment 관련 타입 내보내기
export type {
  AdminCommentFilter,
  AdminCommentDetail,
  AdminCommentsResponse,
  CommentVisibilityUpdateRequest,
  BulkCommentActionRequest,
  BulkCommentActionResponse,
  CommentStats,
  CommentActivityLog,
  CommentActivityLogFilter
} from './comment';

// Setting 관련 타입 내보내기
export type {
  SiteSettings,
  NotificationSettings,
  AdminSettingUpdateRequest,
  AdminSetting,
  SettingSection,
  GroupedSettings,
  SettingResetResponse,
  SettingUpdateResponse,
  SettingBackup,
  SettingBackupCreateRequest,
  SettingRestoreRequest
} from './setting';

// Institution 관련 타입 내보내기
export type {
  AdminInstitution,
  AdminInstitutionCreateRequest,
  AdminInstitutionUpdateRequest,
  AdminInstitutionFilter,
  InstitutionsUpdateStatus,
  InstitutionStats,
  InstitutionDeleteResponse,
  InstitutionBulkUpdateRequest,
  InstitutionBulkUpdateResponse
} from './institution';

// Notice 관련 타입 내보내기
export type {
  AdminNotice,
  AdminNoticeWithUser,
  AdminNoticeFilter,
  NoticeStats,
  NoticeVisibilityUpdateRequest,
  NoticePinUpdateRequest,
  NoticeImportanceUpdateRequest,
  AdminNoticeCreateRequest,
  AdminNoticeUpdateRequest,
  NoticeBulkActionRequest,
  NoticeBulkActionResponse
} from './notice';

// Post 관련 타입 내보내기
export type {
  AdminPostFilter,
  AdminPostDetail,
  PostHideRequest,
  PostUnhideRequest,
  PostDeleteRequest,
  PostBulkActionRequest,
  PostBulkActionResponse,
  PostStats,
  RecentPost,
  TrendingPost,
  PostModLog,
  PostModLogFilter,
  PostExportOptions
} from './post';

// 활동 로그 관련 타입 내보내기
export type {
  ActivityLog,
  ActivityLogFilter
} from './activity_log';

// 대시보드 관련 타입 내보내기
export type {
  DashboardStats,
  ExtendedDashboardStats,
  DashboardPeriod,
  DashboardFilter,
  ActivitySummary
} from './dashboard';