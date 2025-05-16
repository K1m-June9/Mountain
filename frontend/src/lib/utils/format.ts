// src/lib/utils/format.ts

/**
 * 포맷팅 관련 유틸리티 함수
 * 숫자, 텍스트 등의 포맷팅 기능을 제공합니다.
 */

/**
 * 숫자에 천 단위 구분자(,) 추가
 * @param value - 포맷팅할 숫자 또는 숫자 문자열
 * @returns 포맷팅된 문자열
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    console.warn('Invalid number provided to formatNumber:', value);
    return '';
  }
  
  return num.toLocaleString('ko-KR');
}

/**
 * 금액 포맷팅 (천 단위 구분자 + 원화 기호)
 * @param value - 포맷팅할 금액
 * @param currency - 통화 기호 (기본값: '₩')
 * @returns 포맷팅된 금액 문자열
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = '₩'
): string {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    console.warn('Invalid number provided to formatCurrency:', value);
    return '';
  }
  
  return `${currency}${num.toLocaleString('ko-KR')}`;
}

/**
 * 텍스트 길이 제한 (말줄임표 추가)
 * @param text - 제한할 텍스트
 * @param maxLength - 최대 길이
 * @param ellipsis - 말줄임표 문자열 (기본값: '...')
 * @returns 제한된 텍스트 문자열
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.slice(0, maxLength)}${ellipsis}`;
}

/**
 * 파일 크기 포맷팅 (B, KB, MB, GB 단위로 변환)
 * @param bytes - 바이트 단위 파일 크기
 * @param decimals - 소수점 자릿수 (기본값: 2)
 * @returns 포맷팅된 파일 크기 문자열
 */
export function formatFileSize(
  bytes: number | null | undefined,
  decimals: number = 2
): string {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * HTML 이스케이프 처리
 * @param html - 이스케이프 처리할 HTML 문자열
 * @returns 이스케이프 처리된 문자열
 */
export function escapeHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 사용자 이름 포맷팅 (첫 글자만 표시하고 나머지는 *로 마스킹)
 * @param name - 마스킹할 이름
 * @returns 마스킹된 이름 문자열
 */
export function maskUsername(name: string | null | undefined): string {
  if (!name) return '';
  
  if (name.length <= 1) return name;
  
  return `${name.charAt(0)}${'*'.repeat(name.length - 1)}`;
}