import type { Metadata } from "next"
import LoginForm from "@/components/login-form"

export const metadata: Metadata = {
  title: "로그인 - Mountain 커뮤니티",
  description: "Mountain 커뮤니티에 로그인하세요.",
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoginForm />
    </div>
  )
}