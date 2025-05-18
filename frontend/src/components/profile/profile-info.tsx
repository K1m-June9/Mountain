"use client"

import type React from "react"
import { User } from "@/lib/types/user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfileInfoProps {
  user: User
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
        <CardDescription>사용자 정보를 확인할 수 있습니다.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">아이디</Label>
            <Input id="username" value={user.username} disabled />
            <p className="text-sm text-muted-foreground">아이디는 변경할 수 없습니다.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" value={user.email} disabled />
            <p className="text-sm text-muted-foreground">이메일은 변경할 수 없습니다.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}