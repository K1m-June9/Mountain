import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const metadata: Metadata = {
  title: "비밀번호 찾기 - Mountain 커뮤니티",
  description: "Mountain 커뮤니티 비밀번호 찾기",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">비밀번호 찾기</CardTitle>
          <CardDescription>가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" placeholder="가입한 이메일 주소를 입력하세요" />
            </div>
            <Button type="submit" className="w-full">비밀번호 재설정 링크 받기</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}