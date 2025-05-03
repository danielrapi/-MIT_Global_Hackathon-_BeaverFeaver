"use client"

import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  isSearching?: boolean
  placeholder?: string
  disabled?: boolean
}

export function SearchBox({
  value,
  onChange,
  isSearching = false,
  placeholder = "Search detections...",
  disabled = false,
}: SearchBoxProps) {
  return (
    <div className="relative">
      {isSearching ? (
        <Loader2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
      ) : (
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 text-sm"
        disabled={disabled}
      />
    </div>
  )
}
