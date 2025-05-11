import type { Metadata } from "next"
import RegisterForm from "@/components/register-form"

export const metadata: Metadata = {
  title: "회원가입 - Mountain 커뮤니티",
  description: "Mountain 커뮤니티에 가입하세요.",
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <RegisterForm />
    </div>
  )
}