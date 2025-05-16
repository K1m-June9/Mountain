// src/components/institution-tabs.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import institutionService from "@/lib/services/institution_service"
import type { Institution } from "@/lib/types/institution"

interface InstitutionTabsProps {
  activeInstitution?: Institution
}

export default function InstitutionTabs({ activeInstitution }: InstitutionTabsProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInstitutions = async () => {
      setIsLoading(true)
      try {
        const response = await institutionService.getInstitutions()
        if (response.success && response.data) {
          setInstitutions(response.data.items)
        }
      } catch (error) {
        console.error("기관 목록을 불러오는데 실패했습니다:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstitutions()
  }, [])

  // 기관 변경 시 항상 1페이지로 이동하도록 링크 생성
  const createInstitutionLink = (institution?: Institution) => {
    if (institution) {
      return `/institution/${encodeURIComponent(institution.id.toString())}`
    } else {
      return `/`
    }
  }

  if (isLoading) {
    return <div className="flex flex-wrap gap-2 mb-6">
      <Button variant="outline" size="sm" disabled>로딩 중...</Button>
    </div>
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button variant={!activeInstitution ? "default" : "outline"} size="sm" asChild>
        <Link href={createInstitutionLink()}>홈</Link>
      </Button>

      {institutions.map((institution) => (
        <Button 
          key={institution.id} 
          variant={activeInstitution?.id === institution.id ? "default" : "outline"} 
          size="sm" 
          asChild
        >
          <Link href={createInstitutionLink(institution)}>{institution.name}</Link>
        </Button>
      ))}
    </div>
  )
}