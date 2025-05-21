"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import adminService from "@/lib/services/admin_service"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { RefreshCw, Users, UserCheck, UserX, AlertTriangle } from 'lucide-react'
import { useToast } from "@/hooks/use-sonner"

// 차트 색상
const COLORS = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ec4899", "#6b7280"]
const ROLE_COLORS = ["#ef4444", "#3b82f6", "#6b7280"]
const STATUS_COLORS = ["#10b981", "#6b7280", "#f97316"]

// 실제 API에서 반환되는 대시보드 통계 타입
interface DashboardStats {
  userCount: number
  activeUserCount: number
  // 다른 필드들은 옵셔널로 처리
  suspendedUserCount?: number
  usersByMonth?: Array<{
    month: string
    newUsers: number
    activeUsers: number
  }>
  postsByInstitution?: Array<{
    institution: string
    count: number
  }>
  usersByRole?: Array<{
    role: string
    count: number
  }>
  usersByStatus?: Array<{
    status: string
    count: number
  }>
}

// 컴포넌트에서 사용할 사용자 통계 타입
interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
  monthlyStats: Array<{
    month: string
    newUsers: number
    activeUsers: number
  }>
  institutionStats: Array<{
    institution: string
    count: number
  }>
  roleStats: Array<{
    role: string
    count: number
  }>
  statusStats: Array<{
    status: string
    count: number
  }>
}

export function UserStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
  // UserStats.tsx의 loadStats 함수 수정
  const loadStats = async () => {
    setLoading(true);
    try {
      // 새로운 메서드 사용
      const result = await adminService.getUserDashboardStats();
      
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        toast.error("통계 데이터를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("통계 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

    loadStats()
  }, [toast])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">통계 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-2 text-sm text-muted-foreground">통계 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="총 사용자" value={stats.totalUsers} icon={<Users className="h-6 w-6 text-blue-500" />} />
        <StatCard
          title="활성 사용자"
          value={stats.activeUsers}
          icon={<UserCheck className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="비활성 사용자"
          value={stats.inactiveUsers}
          icon={<UserX className="h-6 w-6 text-gray-500" />}
        />
        <StatCard
          title="정지된 사용자"
          value={stats.suspendedUsers}
          icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>월별 사용자 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats.monthlyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newUsers" name="신규 사용자" fill="#3b82f6" />
                    <Bar dataKey="activeUsers" name="활성 사용자" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">월별 통계 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>기관별 게시물 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats.institutionStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.institutionStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="institution"
                    >
                      {stats.institutionStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}개`, "게시물 수"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">기관별 통계 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>역할별 사용자 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats.roleStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.roleStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="role"
                    >
                      {stats.roleStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}명`, "사용자 수"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">역할별 통계 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>상태별 사용자 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats.statusStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                    >
                      {stats.statusStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}명`, "사용자 수"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">상태별 통계 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}