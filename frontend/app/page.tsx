"use client"

import { useState, useEffect, useCallback } from "react"
import { MapContainer } from "./components/map-container"
import { Sidebar } from "./components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from "next-themes"
import type { EnhancedDetection } from "./data/types"
import { LocationDetailCard } from "./components/location-detail-card"
import { ThemeToggle } from "./components/theme-toggle"

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedDetection, setSelectedDetection] = useState<EnhancedDetection | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [filteredDetections, setFilteredDetections] = useState<EnhancedDetection[]>([])
  const [allDetections, setAllDetections] = useState<EnhancedDetection[]>([])
  const [dataJustLoaded, setDataJustLoaded] = useState(false)

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSelectDetection = (detection: EnhancedDetection) => {
    setSelectedDetection(detection)
    setIsDetailOpen(true)
  }

  const handleDataLoaded = useCallback((data: EnhancedDetection[]) => {
    setAllDetections((prev) => [...prev, ...data])
    setFilteredDetections((prev) => [...prev, ...data])
    setDataJustLoaded(true)
  }, [])

  const handleMapFitted = () => {
    setDataJustLoaded(false)
  }

  return (
    <main className="flex flex-col h-screen">
      <nav className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-medium tracking-tight">ThermoTrace</h1>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/danielrapi/global_mit_hackathon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline"
          >
            GitHub Repo
          </a>
          {mounted && <ThemeToggle />}
        </div>
      </nav>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onSelectDetection={handleSelectDetection}
          onFilteredDetectionsChange={setFilteredDetections}
          onDataLoaded={handleDataLoaded}
        />
        <MapContainer
          filteredDetections={filteredDetections}
          allDetections={allDetections}
          dataJustLoaded={dataJustLoaded}
          onMapFitted={handleMapFitted}
        />
      </div>
      <LocationDetailCard detection={selectedDetection} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
      <Toaster />
    </main>
  )
}
