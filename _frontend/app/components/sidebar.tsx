"use client"

import { useState, useEffect } from "react"
import { ScoreSlider } from "./score-slider"
import { SearchBox } from "./search-box"
import { DetectionList } from "./detection-list"
import { UploadDataSection } from "./upload-data-section"
import type { EnhancedDetection } from "@/app/data/dummy-data"
import { vectorSearch, dummyDetections } from "@/app/data/dummy-data"

interface SidebarProps {
  onSelectDetection?: (detection: EnhancedDetection) => void
  onFilteredDetectionsChange?: (detections: EnhancedDetection[]) => void
}

export function Sidebar({ onSelectDetection, onFilteredDetectionsChange }: SidebarProps) {
  const [minScore, setMinScore] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<EnhancedDetection[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [filteredDetections, setFilteredDetections] = useState<EnhancedDetection[]>(dummyDetections)

  // Filter detections based on score and search query
  useEffect(() => {
    // First filter by score
    let filtered = dummyDetections.filter((detection) => detection.anomalyScore >= minScore)

    // Then apply search if there's a query
    if (searchQuery.trim()) {
      filtered = vectorSearch(searchQuery, filtered)
    }

    setFilteredDetections(filtered)

    // Notify parent component about filtered detections
    if (onFilteredDetectionsChange) {
      onFilteredDetectionsChange(filtered)
    }
  }, [minScore, searchQuery, searchResults, onFilteredDetectionsChange])

  // Simulate vector search with a delay to mimic real-world behavior
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        const results = vectorSearch(searchQuery, dummyDetections)
        setSearchResults(results)
        setIsSearching(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium tracking-tight mb-4">Filters</h2>
        <div className="space-y-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            isSearching={isSearching}
            placeholder="Search by keywords, tags..."
          />
          <ScoreSlider value={minScore} onChange={setMinScore} />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <DetectionList detections={filteredDetections} onSelectDetection={onSelectDetection} />
      </div>
      <UploadDataSection />
    </div>
  )
}
