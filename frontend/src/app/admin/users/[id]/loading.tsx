import { RefreshCw } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="text-center">
        <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">사용자 상세 정보를 불러오는 중...</p>
      </div>
    </div>
  )
}
