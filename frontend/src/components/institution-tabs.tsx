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
        console.log('Institution response:', response); // 디버깅용 로그 추가
        
        if (response.success && response.data) {
          // 데이터가 PaginatedData 형식인지 확인
          if (response.data.items) {
            setInstitutions(response.data.items);
          } else if (Array.isArray(response.data)) {
            // 백엔드가 직접 배열을 반환하는 경우를 대비
            setInstitutions(response.data);
          } else {
            console.error('Unexpected data format:', response.data);
            setInstitutions([]);
          }
        } else {
          setInstitutions([]);
        }
      } catch (error) {
        console.error("기관 목록을 불러오는데 실패했습니다:", error)
        setInstitutions([]);
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