"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, Send } from "lucide-react"
import { useEffect, useState } from "react"

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  onSearch: (value: string) => void
  isSearching?: boolean
  placeholder?: string
  disabled?: boolean
  resetSignal?: number // increment this to force input reset
}

export function SearchBox({
  value,
  onChange,
  onSearch,
  isSearching = false,
  placeholder = "Search detections...",
  disabled = false,
  resetSignal,
}: SearchBoxProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue("")
  }, [resetSignal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localValue)
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex">
      {isSearching ? (
        <Loader2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
      ) : (
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value)
          onChange(e.target.value)
        }}
        className="pl-8 text-sm rounded-r-none"
        disabled={disabled}
      />
      <Button
        type="submit"
        variant="default"
        size="icon"
        className="rounded-l-none border-l-0 h-10 w-10 flex items-center justify-center"
        disabled={disabled || isSearching}
        aria-label="Search"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  )
}
