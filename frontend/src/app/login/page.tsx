// app/login/page.tsx
import Header from "@/components/header"
import Footer from "@/components/footer"
import LoginForm from "@/components/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "로그인 - Mountain 커뮤니티",
  description: "Mountain 커뮤니티에 로그인하세요.",
}

/**
 * 로그인 페이지 컴포넌트
 * 
 * 이 페이지는 서버 컴포넌트로, 로그인 폼을 렌더링합니다.
 * 실제 로그인 로직과 인증 상태 확인은 클라이언트 컴포넌트인 LoginForm에서 처리됩니다.
 */
export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <LoginForm />
      </main>
      <Footer />
    </div>
  )
}