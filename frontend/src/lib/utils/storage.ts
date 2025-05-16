// src/lib/utils/storage.ts

/**
 * 로컬 스토리지 관련 유틸리티 함수
 * 브라우저 스토리지(localStorage, sessionStorage)를 안전하게 사용하기 위한 기능을 제공합니다.
 */

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

/**
 * 로컬 스토리지에 데이터 저장
 * @param key - 저장할 키
 * @param value - 저장할 값 (객체도 가능)
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') return;
    
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error saving to localStorage (key: ${key}):`, error);
  }
}

/**
 * 로컬 스토리지에서 데이터 가져오기
 * @param key - 가져올 키
 * @param defaultValue - 기본값 (데이터가 없을 경우 반환)
 * @returns 저장된 값 또는 기본값
 */
export function getLocalStorage<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    if (typeof window === 'undefined') return defaultValue;
    
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) return defaultValue;
    
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return defaultValue;
  }
}

/**
 * 로컬 스토리지에서 데이터 삭제
 * @param key - 삭제할 키
 */
export function removeLocalStorage(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
  }
}

/**
 * 세션 스토리지에 데이터 저장
 * @param key - 저장할 키
 * @param value - 저장할 값 (객체도 가능)
 */
export function setSessionStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') return;
    
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error saving to sessionStorage (key: ${key}):`, error);
  }
}

/**
 * 세션 스토리지에서 데이터 가져오기
 * @param key - 가져올 키
 * @param defaultValue - 기본값 (데이터가 없을 경우 반환)
 * @returns 저장된 값 또는 기본값
 */
export function getSessionStorage<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    if (typeof window === 'undefined') return defaultValue;
    
    const serializedValue = sessionStorage.getItem(key);
    if (serializedValue === null) return defaultValue;
    
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error(`Error reading from sessionStorage (key: ${key}):`, error);
    return defaultValue;
  }
}

/**
 * 세션 스토리지에서 데이터 삭제
 * @param key - 삭제할 키
 */
export function removeSessionStorage(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from sessionStorage (key: ${key}):`, error);
  }
}

/**
 * 로컬 스토리지 전체 비우기
 */
export function clearLocalStorage(): void {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * 세션 스토리지 전체 비우기
 */
export function clearSessionStorage(): void {
  try {
    if (typeof window === 'undefined') return;
    
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
}

/**
 * 로컬 스토리지에 데이터 저장 (만료 시간 포함)
 * @param key - 저장할 키
 * @param value - 저장할 값
 * @param expiryInMinutes - 만료 시간 (분 단위)
 */
export function setLocalStorageWithExpiry<T>(
  key: string,
  value: T,
  expiryInMinutes: number
): void {
  try {
    if (typeof window === 'undefined') return;
    
    const now = new Date();
    const item = {
      value,
      expiry: now.getTime() + expiryInMinutes * 60 * 1000,
    };
    
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error saving to localStorage with expiry (key: ${key}):`, error);
  }
}

/**
 * 로컬 스토리지에서 데이터 가져오기 (만료 시간 확인)
 * @param key - 가져올 키
 * @param defaultValue - 기본값 (데이터가 없거나 만료된 경우 반환)
 * @returns 저장된 값 또는 기본값
 */
export function getLocalStorageWithExpiry<T>(
  key: string,
  defaultValue: T | null = null
): T | null {
  try {
    if (typeof window === 'undefined') return defaultValue;
    
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return defaultValue;
    
    const item = JSON.parse(itemStr);
    const now = new Date();
    
    // 만료 시간 확인
    if (now.getTime() > item.expiry) {
      // 만료된 아이템 삭제
      localStorage.removeItem(key);
      return defaultValue;
    }
    
    return item.value as T;
  } catch (error) {
    console.error(`Error reading from localStorage with expiry (key: ${key}):`, error);
    return defaultValue;
  }
}