// src/components/notification-dropdown.tsx
"use client"

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Notification } from '@/lib/types/notification'

export default function NotificationDropdown() {
  const { 
    notifications = [], // 기본값으로 빈 배열 설정
    unreadCount = 0, // 기본값으로 0 설정
    isLoading, 
    markAsRead, 
    markAllAsRead,
    fetchNotifications
  } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  // 드롭다운 열릴 때 알림 목록 새로고침
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      fetchNotifications()
    }
  }

  // 알림 클릭 시 읽음 처리
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    // 관련 페이지로 이동 로직 (필요한 경우)
    setIsOpen(false)
  }

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await markAllAsRead()
  }

  // 알림 타입에 따른 스타일 및 텍스트
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'report_status':
        return { icon: '🚨', className: 'text-amber-500' }
      case 'admin_message':
        return { icon: '👋', className: 'text-blue-500' }
      default:
        return { icon: '📢', className: 'text-gray-500' }
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">알림</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between py-2 px-3">
          <DropdownMenuLabel className="text-base">알림</DropdownMenuLabel>
          {notifications && notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs h-7"
            >
              모두 읽음
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="py-6 text-center text-muted-foreground">
            알림을 불러오는 중...
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            알림이 없습니다
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => {
              const style = getNotificationStyle(notification.type)
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start py-3 px-4 cursor-pointer ${!notification.is_read ? 'bg-accent/30' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <span className="text-lg">{style.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${style.className}`}>
                        {notification.type === 'report_status' ? '신고 처리 결과' : '관리자 메시지'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true,
                          locale: ko 
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}