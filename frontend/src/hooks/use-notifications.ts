// src/hooks/use-notifications.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import notificationService from '@/lib/services/notification_service';
import type { Notification } from '@/lib/types/notification';

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 알림 목록 가져오기
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await notificationService.getNotifications({ limit: 10 });
      
      if (result.success && result.data) {
        // 백엔드가 배열을 직접 반환하는 경우 처리
        if (Array.isArray(result.data)) {
          setNotifications(result.data);
        } 
        // 백엔드가 PaginatedData 형식으로 반환하는 경우 처리
        else if (result.data.items) {
          setNotifications(result.data.items);
        } 
        // 기타 경우 빈 배열로 설정
        else {
          setNotifications([]);
        }
      } else {
        setError(result.error?.message || '알림을 불러오는데 실패했습니다.');
        setNotifications([]);
      }
    } catch (err) {
      setError('알림을 불러오는데 실패했습니다.');
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // 읽지 않은 알림 개수 가져오기
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      // 백엔드에 unread-count 엔드포인트가 없는 경우 대체 로직
      // 모든 알림을 가져와서 읽지 않은 알림 개수 계산
      const result = await notificationService.getUnreadCount();
      
      if (result.success && result.data) {
        setUnreadCount(result.data.count);
      } else {
        // 백엔드 엔드포인트가 없는 경우 대체 로직
        const notificationsResult = await notificationService.getNotifications();
        if (notificationsResult.success && notificationsResult.data) {
          const notifs = Array.isArray(notificationsResult.data) 
            ? notificationsResult.data 
            : notificationsResult.data.items || [];
          
          const unreadNotifications = notifs.filter(n => !n.is_read);
          setUnreadCount(unreadNotifications.length);
        }
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [isAuthenticated]);

  // 알림 읽음 처리
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      
      if (result.success) {
        // 알림 목록 업데이트
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true } 
              : notification
          )
        );
        
        // 읽지 않은 알림 개수 업데이트
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return result.success;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead();
      
      if (result.success) {
        // 알림 목록 업데이트
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        
        // 읽지 않은 알림 개수 초기화
        setUnreadCount(0);
      }
      
      return result.success;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      return false;
    }
  }, []);

  // 컴포넌트 마운트 시 알림 목록과 읽지 않은 알림 개수 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // 30초마다 읽지 않은 알림 개수 업데이트
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  };
}