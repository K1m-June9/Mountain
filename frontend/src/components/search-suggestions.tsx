// src/components/search-suggestions.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import postService from "@/lib/services/post_service"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Calendar, User } from 'lucide-react'

interface SearchSuggestionsProps {
  query: string
  onSelect?: (postId: number) => void
  className?: string
}

export default function SearchSuggestions({ query, onSelect, className }: SearchSuggestionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const commandRef = useRef<HTMLDivElement>(null)

  // 검색어가 변경될 때 제안 가져오기
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([])
        setOpen(false)
        return
      }

      setLoading(true)
      try {
        const response = await postService.getSuggestions(debouncedQuery)
        if (response.success && response.data) {
          setSuggestions(response.data)
          setOpen(true)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  // 제안 항목 클릭 처리
  const handleSelect = (postId: number) => {
    setOpen(false)
    if (onSelect) {
      onSelect(postId)
    } else {
      router.push(`/posts/${postId}`)
    }
  }

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!query) return null

  return (
    <div className={`relative ${className}`} ref={commandRef}>
      {open && (
        <Command className="absolute top-0 left-0 w-full rounded-lg border shadow-md z-50 bg-white">
          <CommandList>
            {loading ? (
              <CommandEmpty>검색 제안을 불러오는 중...</CommandEmpty>
            ) : suggestions.length === 0 ? (
              <CommandEmpty>검색 제안이 없습니다</CommandEmpty>
            ) : (
              <CommandGroup heading="검색 제안">
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.id}
                    onSelect={() => handleSelect(suggestion.id)}
                    className="flex flex-col items-start py-2"
                  >
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {suggestion.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      )}
    </div>
  )
}