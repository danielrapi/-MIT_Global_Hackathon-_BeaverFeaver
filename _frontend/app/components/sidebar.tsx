"use client"

import { useState, useEffect } from "react"
import { ScoreSlider } from "./score-slider"
import { SearchBox } from "./search-box"
import { DetectionList } from "./detection-list"
import { UploadDataSection } from "./upload-data-section"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import type { EnhancedDetection } from "@/app/data/types"
import { searchByVectorSimilarity } from "@/app/data/vector-search"

interface SidebarProps {
  onSelectDetection?: (detection: EnhancedDetection) => void
  onFilteredDetectionsChange?: (detections: EnhancedDetection[]) => void
  onDataLoaded?: (data: EnhancedDetection[]) => void
}

export function Sidebar({ onSelectDetection, onFilteredDetectionsChange, onDataLoaded }: SidebarProps) {
  const [minScore, setMinScore] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [allDetections, setAllDetections] = useState<EnhancedDetection[]>([])
  const [filteredDetections, setFilteredDetections] = useState<EnhancedDetection[]>([])
  const [hasData, setHasData] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)
  const [mapResetKey, setMapResetKey] = useState(0)

  // Reset filters function
  const resetFilters = () => {
    setMinScore(0)
    setSearchQuery("")
    setFilteredDetections([...allDetections])
    setResetSignal((s) => s + 1)
    setMapResetKey((k) => k + 1)
    if (onFilteredDetectionsChange) {
      onFilteredDetectionsChange([...allDetections])
    }
  }

  // Handle data loading
  const handleDataLoaded = (data: EnhancedDetection[]) => {
    setAllDetections(data)
    setFilteredDetections(data)
    setHasData(data.length > 0)

    if (onDataLoaded) {
      onDataLoaded(data)
    }

    if (onFilteredDetectionsChange) {
      onFilteredDetectionsChange(data)
    }
  }

  // Filter detections based on score and search query
  useEffect(() => {
    if (!hasData) return

    // First filter by score
    let filtered = allDetections.filter((detection) => detection.anomalyScore >= minScore)

    setFilteredDetections(filtered)

    // Notify parent component about filtered detections
    if (onFilteredDetectionsChange) {
      onFilteredDetectionsChange(filtered)
    }
  }, [minScore, allDetections, onFilteredDetectionsChange, hasData])

  // Handle search submission
  const handleSearch = async (query: string) => {
    if (!hasData || !query.trim()) {
      return
    }

    setIsSearching(true)
    try {
      // First filter by score
      let filtered = allDetections.filter((detection) => detection.anomalyScore >= minScore)
      
      // Then apply search if there's a query
      filtered = await searchByVectorSimilarity(query, filtered, 5)

      setFilteredDetections(filtered)

      // Notify parent component about filtered detections
      if (onFilteredDetectionsChange) {
        onFilteredDetectionsChange(filtered)
      }
    } catch (error) {
      console.error('Error during search:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium tracking-tight">Filters</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="flex items-center gap-1"
            disabled={!hasData}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
        <div className="space-y-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            isSearching={isSearching}
            placeholder="Search by keywords, tags..."
            disabled={!hasData}
            resetSignal={resetSignal}
          />
          <ScoreSlider value={minScore} onChange={setMinScore} disabled={!hasData} />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {hasData ? (
          <DetectionList detections={filteredDetections} onSelectDetection={onSelectDetection} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
            <p>No data loaded</p>
            <p className="text-sm mt-1">Click "Load Test Data" below to get started</p>
          </div>
        )}
      </div>
      <UploadDataSection onDataLoaded={handleDataLoaded} />
    </div>
  )
}
