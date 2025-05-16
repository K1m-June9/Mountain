// src/lib/utils/validation.ts

/**
 * 유효성 검사 관련 유틸리티 함수
 * 이메일, 비밀번호, 사용자명 등의 유효성 검사 기능을 제공합니다.
 */

/**
 * 이메일 유효성 검사
 * @param email - 검사할 이메일
 * @returns 유효한 이메일인지 여부
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  // 기본 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 사용자명 유효성 검사
 * 영문, 숫자, 밑줄(_)만 허용, 3-50자
 * @param username - 검사할 사용자명
 * @returns 유효한 사용자명인지 여부
 */
export function isValidUsername(username: string | null | undefined): boolean {
  if (!username) return false;
  
  // 영문, 숫자, 밑줄(_)만 허용, 3-50자
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
}

/**
 * 비밀번호 유효성 검사
 * 최소 8자, 최소 하나의 문자, 하나의 숫자 포함
 * @param password - 검사할 비밀번호
 * @returns 유효한 비밀번호인지 여부
 */
export function isValidPassword(password: string | null | undefined): boolean {
  if (!password) return false;
  
  // 최소 8자, 최소 하나의 문자, 하나의 숫자
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * 비밀번호 강도 검사
 * @param password - 검사할 비밀번호
 * @returns 비밀번호 강도 (0-4, 높을수록 강함)
 */
export function getPasswordStrength(password: string | null | undefined): number {
  if (!password) return 0;
  
  let strength = 0;
  
  // 길이 검사
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // 문자 종류 검사
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  // 최대 4점으로 제한
  return Math.min(4, strength);
}

/**
 * URL 유효성 검사
 * @param url - 검사할 URL
 * @returns 유효한 URL인지 여부
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 숫자 유효성 검사
 * @param value - 검사할 값
 * @returns 유효한 숫자인지 여부
 */
export function isValidNumber(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  return !isNaN(Number(value));
}

/**
 * 정수 유효성 검사
 * @param value - 검사할 값
 * @returns 유효한 정수인지 여부
 */
export function isValidInteger(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num);
}

/**
 * 양의 정수 유효성 검사
 * @param value - 검사할 값
 * @returns 유효한 양의 정수인지 여부
 */
export function isValidPositiveInteger(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
}

/**
 * 빈 값 검사 (null, undefined, 빈 문자열, 빈 배열, 빈 객체)
 * @param value - 검사할 값
 * @returns 빈 값인지 여부
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  
  if (typeof value === 'string') return value.trim() === '';
  
  if (Array.isArray(value)) return value.length === 0;
  
  if (typeof value === 'object') return Object.keys(value).length === 0;
  
  return false;
}

/**
 * 필수 입력값 검사
 * @param value - 검사할 값
 * @returns 필수 입력값이 있는지 여부
 */
export function isRequired(value: any): boolean {
  return !isEmpty(value);
}