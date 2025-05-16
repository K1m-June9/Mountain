import Header from "@/components/header"
import Footer from "@/components/footer"
import RegisterForm from "@/components/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "회원가입 - Mountain 커뮤니티",
  description: "Mountain 커뮤니티에 가입하세요.",
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <RegisterForm />
      </main>
      <Footer />
    </div>
  )
}
