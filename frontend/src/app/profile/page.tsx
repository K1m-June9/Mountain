import Header from "@/components/header"
import Footer from "@/components/footer"
import ProfilePage from "@/components/profile/profile-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "내 프로필 - Mountain 커뮤니티",
  description: "Mountain 커뮤니티 프로필 관리",
}

export default function Profile() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <ProfilePage />
      </main>
      <Footer />
    </div>
  )
}
