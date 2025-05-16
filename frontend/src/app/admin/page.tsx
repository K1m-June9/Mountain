// app/admin/page.tsx
import { Suspense } from "react"
import Link from "next/link"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag, MessageSquare, Building, Users, AlertTriangle } from 'lucide-react'
import adminService from "@/lib/services/admin_service"
import { ExtendedDashboardStats } from "@/lib/types/admin"
import { InstitutionsUpdateStatus } from "@/lib/types/admin"
import reportService from "@/lib/services/report_service"
import type { Report } from "@/lib/types/report"
import { formatDate } from "@/lib/utils/date"

export default function AdminDashboard() {
  return (
    <AdminAuthCheck>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>

        <Suspense fallback={<AdminDashboardStatsSkeleton />}>
          <AdminDashboardStatsContent />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Suspense fallback={<RecentReportsCardSkeleton />}>
            <RecentReportsCardContent />
          </Suspense>
          <Suspense fallback={<PendingActionsCardSkeleton />}>
            <PendingActionsCardContent />
          </Suspense>
        </div>
      </div>
    </AdminAuthCheck>
  )
}

// 스켈레톤 로딩 UI 컴포넌트
function AdminDashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array(4).fill(0).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// 실제 데이터를 가져오는 서버 컴포넌트
async function AdminDashboardStatsContent() {
  // 확장된 대시보드 통계 API 사용
  const statsResult = await adminService.getDashboardExtended();
  
  // 기본값 설정
  const stats: ExtendedDashboardStats = statsResult.success && statsResult.data ? statsResult.data : {
    userCount: 0,
    postCount: 0,
    commentCount: 0,
    reportCount: 0,
    pendingReportCount: 0,
    hiddenPostCount: 0,
    hiddenCommentCount: 0,
    activeUserCount: 0,
    newUserCount: 0,
    newPostCount: 0,
    newCommentCount: 0
  };

  const statCards = [
    {
      title: "대기 중인 신고",
      value: stats.pendingReportCount,
      icon: <Flag className="h-8 w-8 text-red-500" />,
      href: "/admin/reports?status=pending",
    },
    {
      title: "숨김 처리된 게시글",
      value: stats.hiddenPostCount,
      icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
      href: "/admin/reports?type=post&status=approved",
    },
    {
      title: "숨김 처리된 댓글",
      value: stats.hiddenCommentCount,
      icon: <MessageSquare className="h-8 w-8 text-amber-500" />,
      href: "/admin/reports?type=comment&status=approved",
    },
    {
      title: "총 사용자 수",
      value: stats.userCount,
      icon: <Users className="h-8 w-8 text-blue-500" />,
      href: "/admin/users",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Link href={stat.href} key={index}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

// 스켈레톤 로딩 UI 컴포넌트
function RecentReportsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 신고</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {Array(4).fill(0).map((_, index) => (
            <li key={index} className="flex items-start gap-3 border-b pb-3 last:border-0">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mt-0.5"></div>
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// 실제 데이터를 가져오는 서버 컴포넌트
async function RecentReportsCardContent() {
  // 최근 신고 데이터 가져오기 (최신순으로 정렬)
  const reportsResult = await reportService.getReports({ 
    limit: 4,
    // 백엔드에서 기본적으로 최신순 정렬을 제공하므로 별도의 정렬 파라미터는 필요 없음
  });

  // 기본값 설정
  const recentReports: Report[] = reportsResult.success && reportsResult.data?.items ? 
    reportsResult.data.items : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>최근 신고</CardTitle>
        <Link 
          href="/admin/reports" 
          className="text-sm text-primary hover:underline"
        >
          모두 보기
        </Link>
      </CardHeader>
      <CardContent>
        {recentReports.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">최근 신고 내역이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {recentReports.map((report) => (
              <li key={report.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                {report.post_id ? (
                  <Flag className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <MessageSquare className="h-5 w-5 text-amber-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {report.post_id ? "게시글" : "댓글"} 신고 #{report.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    사유: {report.reason} • {formatDate(report.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// 스켈레톤 로딩 UI 컴포넌트
function PendingActionsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>대기 중인 작업</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {Array(3).fill(0).map((_, index) => (
            <li key={index} className="flex items-start gap-3 border-b pb-3 last:border-0">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mt-0.5"></div>
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// 실제 데이터를 가져오는 서버 컴포넌트
async function PendingActionsCardContent() {
  // 대시보드 통계 가져오기
  const statsResult = await adminService.getDashboardExtended();
  
  // 기관 정보 업데이트 필요 여부 확인
  const institutionsNeedUpdateResult = await adminService.checkInstitutionsNeedUpdate();
  
  // 기본값 설정
  const stats: ExtendedDashboardStats = statsResult.success && statsResult.data ? statsResult.data : {
    userCount: 0,
    postCount: 0,
    commentCount: 0,
    reportCount: 0,
    pendingReportCount: 0,
    hiddenPostCount: 0,
    hiddenCommentCount: 0,
    activeUserCount: 0,
    newUserCount: 0,
    newPostCount: 0,
    newCommentCount: 0
  };
  
  const institutionsNeedUpdate: InstitutionsUpdateStatus = institutionsNeedUpdateResult.success && 
    institutionsNeedUpdateResult.data ? institutionsNeedUpdateResult.data : {
      needsUpdate: false,
      incompleteCount: 0,
      outdatedCount: 0
    };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>대기 중인 작업</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-start gap-3 border-b pb-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <Link href="/admin/reports?status=pending" className="font-medium hover:underline">
                신고 검토 필요
              </Link>
              <p className="text-sm text-muted-foreground">
                {stats.pendingReportCount > 0 
                  ? `${stats.pendingReportCount}개의 신고가 검토 대기 중입니다.` 
                  : "검토 대기 중인 신고가 없습니다."}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 border-b pb-3">
            <Building className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <Link href="/admin/institutions" className="font-medium hover:underline">
                기관 정보 업데이트
              </Link>
              <p className="text-sm text-muted-foreground">
                {institutionsNeedUpdate.needsUpdate 
                  ? `${institutionsNeedUpdate.incompleteCount}개의 기관 정보가 불완전하고, ${institutionsNeedUpdate.outdatedCount}개의 기관 정보가 오래되었습니다.` 
                  : "모든 기관 정보가 최신 상태입니다."}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Users className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <Link href="/admin/settings" className="font-medium hover:underline">
                시스템 상태
              </Link>
              <p className="text-sm text-muted-foreground">
                시스템이 정상적으로 운영 중입니다.
              </p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}