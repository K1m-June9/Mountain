"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { STORAGE_KEYS, getLocalStorage, setLocalStorage } from "@/lib/utils/storage"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  // 컴포넌트가 마운트된 후에만 클라이언트 사이드 코드 실행
  useEffect(() => {
    setMounted(true)
    
    // 로컬 스토리지에서 테마 설정 불러오기
    const storedTheme = getLocalStorage<Theme>(STORAGE_KEYS.THEME, null)
    
    if (storedTheme) {
      setTheme(storedTheme)
    } else if (typeof window !== 'undefined' && 
               window.matchMedia && 
               window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // 시스템 설정이 다크 모드인 경우
      setTheme("dark")
    }
  }, [])

  // 테마 변경 시 HTML 요소에 클래스 추가/제거 및 로컬 스토리지에 저장
  useEffect(() => {
    if (!mounted) return
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // 로컬 스토리지에 테마 설정 저장
    setLocalStorage(STORAGE_KEYS.THEME, theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  // 서버 사이드 렌더링 시 초기 상태만 반환
  if (!mounted) {
    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}