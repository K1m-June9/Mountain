"use client"
// src/components/news-feed.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookmarkIcon } from 'lucide-react'
import { cn } from "@/lib/utils/cn"
import { useEffect, useState } from "react"

// 기관 이름 타입 정의
export type InstitutionName = "국회" | "여성가족부" | "교육부" | "문화체육관광부" | "고용노동부" | "공지사항";

// 뉴스 항목 인터페이스 정의
interface NewsItem {
  id: number;
  title: string;
  description: string;
  date: string;
  institution: InstitutionName;
}

// 기관별 뉴스 피드 데이터
const institutionNews: NewsItem[] = [
  // 국회 뉴스
  {
    id: 1,
    title: "국회, 새로운 법안 통과",
    description: "오늘 국회에서는 중요한 법안이 통과되었습니다. 이 법안은 많은 국민들의 관심사였던...",
    date: "2024.03.15",
    institution: "국회",
  },
  {
    id: 2,
    title: "국회 예산 심의 일정 발표",
    description: "다음 달 예정된 국회 예산 심의 일정이 발표되었습니다. 주요 안건으로는...",
    date: "2024.03.10",
    institution: "국회",
  },
  {
    id: 3,
    title: "국회의원 윤리강령 개정안 논의",
    description: "국회 윤리위원회에서 의원 윤리강령 개정안에 대한 논의가 진행 중입니다...",
    date: "2024.03.05",
    institution: "국회",
  },

  // 여성가족부 뉴스
  {
    id: 4,
    title: "여성가족부, 성평등 정책 추진 계획 발표",
    description: "여성가족부가 올해의 성평등 정책 추진 계획을 발표했습니다. 주요 내용은...",
    date: "2024.03.15",
    institution: "여성가족부",
  },
  {
    id: 5,
    title: "여성가족부, 가족 돌봄 지원 확대",
    description: "여성가족부는 가족 돌봄 지원 정책을 확대한다고 밝혔습니다. 이번 정책은...",
    date: "2024.03.08",
    institution: "여성가족부",
  },
  {
    id: 6,
    title: "여성가족부 장관, 국제 여성의 날 기념사",
    description: "여성가족부 장관이 국제 여성의 날을 맞아 발표한 기념사에서 강조한 내용은...",
    date: "2024.03.08",
    institution: "여성가족부",
  },

  // 교육부 뉴스
  {
    id: 7,
    title: "교육부, 새 학기 교육 정책 발표",
    description: "교육부가 새 학기를 맞아 새로운 교육 정책을 발표했습니다. 주요 내용으로는...",
    date: "2024.03.15",
    institution: "교육부",
  },
  {
    id: 8,
    title: "교육부, 디지털 교육 혁신 방안 제시",
    description: "교육부가 디지털 시대에 맞는 교육 혁신 방안을 제시했습니다. 주요 내용은...",
    date: "2024.03.12",
    institution: "교육부",
  },
  {
    id: 9,
    title: "교육부, 학생 정신건강 지원 강화",
    description: "교육부는 학생들의 정신건강 지원을 강화하기 위한 새로운 프로그램을 도입한다고...",
    date: "2024.03.07",
    institution: "교육부",
  },

  // 문화체육관광부 뉴스
  {
    id: 10,
    title: "문화체육관광부, 문화예술 지원 확대",
    description: "문화체육관광부가 문화예술 분야 지원을 확대한다고 발표했습니다. 이번 지원은...",
    date: "2024.03.14",
    institution: "문화체육관광부",
  },
  {
    id: 11,
    title: "문화체육관광부, 국제 스포츠 대회 유치 성공",
    description: "문화체육관광부가 주요 국제 스포츠 대회 유치에 성공했다고 발표했습니다...",
    date: "2024.03.10",
    institution: "문화체육관광부",
  },
  {
    id: 12,
    title: "문화체육관광부, 관광산업 활성화 방안 발표",
    description: "문화체육관광부가 관광산업 활성화를 위한 새로운 방안을 발표했습니다. 주요 내용은...",
    date: "2024.03.05",
    institution: "문화체육관광부",
  },

  // 고용노동부 뉴스
  {
    id: 13,
    title: "고용노동부, 일자리 창출 정책 발표",
    description: "고용노동부가 새로운 일자리 창출 정책을 발표했습니다. 이번 정책의 핵심은...",
    date: "2024.03.13",
    institution: "고용노동부",
  },
  {
    id: 14,
    title: "고용노동부, 근로환경 개선 방안 제시",
    description: "고용노동부가 근로환경 개선을 위한 새로운 방안을 제시했습니다. 주요 내용으로는...",
    date: "2024.03.09",
    institution: "고용노동부",
  },
  {
    id: 15,
    title: "고용노동부, 청년 취업 지원 프로그램 확대",
    description: "고용노동부가 청년 취업 지원 프로그램을 확대한다고 발표했습니다. 이번 프로그램은...",
    date: "2024.03.06",
    institution: "고용노동부",
  },
]

// 기관별 배지 색상 설정
const institutionColors: Record<InstitutionName, string> = {
  국회: "bg-blue-100 text-blue-800",
  여성가족부: "bg-purple-100 text-purple-800",
  교육부: "bg-green-100 text-green-800",
  문화체육관광부: "bg-orange-100 text-orange-800",
  고용노동부: "bg-red-100 text-red-800",
  공지사항: "bg-gray-100 text-gray-800",
}

interface NewsFeedProps {
  institution?: InstitutionName;
}

/**
 * 기관별 뉴스 피드 컴포넌트
 * 
 * @param institution - 표시할 특정 기관 (선택적)
 * @returns 뉴스 피드 컴포넌트
 */
export default function NewsFeed({ institution }: NewsFeedProps) {
  // 표시할 뉴스 필터링
  const filteredNews = institution
    ? institutionNews.filter((news) => news.institution === institution)
    : institutionNews

  // 클라이언트 사이드에서만 랜덤 정렬을 적용하기 위한 상태
  const [newsToShow, setNewsToShow] = useState<NewsItem[]>(
    institution ? filteredNews : filteredNews.slice(0, 6)
  );

  // 클라이언트 사이드에서만 실행되는 useEffect
  useEffect(() => {
    if (!institution) {
      // 클라이언트에서만 랜덤 정렬 적용
      setNewsToShow([...filteredNews]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6));
    }
  }, [institution, filteredNews]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">기관 소식</h2>

      {newsToShow.length > 0 ? (
        <div className="space-y-4">
          {newsToShow.map((news) => (
            <Card
              key={news.id}
              className="mb-4 border-l-4 hover:shadow-md transition-shadow duration-200"
              style={{
                borderLeftColor:
                  news.institution === "국회"
                    ? "#3b82f6"
                    : news.institution === "여성가족부"
                      ? "#8b5cf6"
                      : news.institution === "교육부"
                        ? "#10b981"
                        : news.institution === "문화체육관광부"
                          ? "#f97316"
                          : news.institution === "고용노동부"
                            ? "#ef4444"
                            : "#6b7280",
              }}
            >
              <CardHeader className="py-3 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-base font-semibold">{news.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{news.date}</CardDescription>
                </div>
                <BookmarkIcon className="h-5 w-5 text-gray-300" />
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{news.description}</p>
                <Badge className={cn("font-normal", institutionColors[news.institution])}>
                  {news.institution}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">해당 기관의 소식이 없습니다.</p>
        </div>
      )}
    </div>
  )
}