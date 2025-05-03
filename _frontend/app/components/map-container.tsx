"use client"

import { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { HoverPreview } from "./hover-preview"
import { LocationDetailCard } from "./location-detail-card"
import { Button } from "@/components/ui/button"
import { Map, ChevronDown, Database } from "lucide-react"
import { useClickOutside } from "../hooks/use-click-outside"
import type { EnhancedDetection } from "@/app/data/types"

// Dynamically import the LeafletMap component with SSR disabled
const LeafletMap = dynamic(() => import("./leaflet-map").then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading map...</div>,
})

// Map layout definitions
export type MapLayout = {
  name: string
  url: string
  attribution: string
}

export const mapLayouts: Record<string, MapLayout> = {
  standard: {
    name: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  terrain: {
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  dark: {
    name: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
}

export interface MarkerPosition {
  detection: EnhancedDetection
  pixelPosition: { x: number; y: number }
}

interface MapContainerProps {
  filteredDetections: EnhancedDetection[]
  allDetections: EnhancedDetection[]
  dataJustLoaded?: boolean
  onMapFitted?: () => void
}

export function MapContainer({
  filteredDetections,
  allDetections,
  dataJustLoaded = false,
  onMapFitted,
}: MapContainerProps) {
  const [hoveredMarker, setHoveredMarker] = useState<MarkerPosition | null>(null)
  const [selectedDetection, setSelectedDetection] = useState<EnhancedDetection | null>(null)
  const [currentLayout, setCurrentLayout] = useState<string>("satellite")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [shouldFitBounds, setShouldFitBounds] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const hasData = allDetections.length > 0

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => {
    if (isDropdownOpen) setIsDropdownOpen(false)
  })

  // Handle data loading to fit bounds
  useEffect(() => {
    if (dataJustLoaded && hasData) {
      setShouldFitBounds(true)
    }
  }, [dataJustLoaded, hasData])

  // Reset shouldFitBounds after it's been used
  useEffect(() => {
    if (shouldFitBounds) {
      const timer = setTimeout(() => {
        setShouldFitBounds(false)
        if (onMapFitted) {
          onMapFitted()
        }
      }, 1000) // Give enough time for the map to fit bounds
      return () => clearTimeout(timer)
    }
  }, [shouldFitBounds, onMapFitted])

  const handleMarkerClick = (detection: EnhancedDetection) => {
    setSelectedDetection(detection)
    setIsDetailOpen(true)
  }

  return (
    <div className="relative flex-1">
      {/* Map style dropdown */}
      {hasData && (
        <div className="absolute top-4 right-4 z-[1000]" ref={dropdownRef}>
          <div className="relative">
            <Button
              variant="outline"
              className="w-48 justify-between bg-background/90 backdrop-blur-sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="flex items-center">
                <Map className="mr-2 h-4 w-4" />
                {mapLayouts[currentLayout]?.name || "Map Style"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 rounded-md bg-background shadow-lg ring-1 ring-border focus:outline-none z-[1001]">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Map Style</div>
                  <div className="h-px bg-border my-1"></div>
                  {Object.entries(mapLayouts).map(([key, layout]) => (
                    <button
                      key={key}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-accent"
                      onClick={() => {
                        setCurrentLayout(key)
                        setIsDropdownOpen(false)
                      }}
                    >
                      <span>{layout.name}</span>
                      {currentLayout === key && <span className="text-primary">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hasData ? (
        <>
          <LeafletMap
            allDetections={allDetections}
            filteredDetections={filteredDetections}
            onMarkerHover={setHoveredMarker}
            onMarkerClick={handleMarkerClick}
            mapLayout={mapLayouts[currentLayout]}
            shouldFitBounds={shouldFitBounds}
          />

          {/* Hover preview positioned relative to marker */}
          {hoveredMarker && (
            <div
              className="pointer-events-none fixed z-[9999]"
              style={{
                left: `${hoveredMarker.pixelPosition.x}px`,
                top: `${hoveredMarker.pixelPosition.y - 20}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <HoverPreview detection={hoveredMarker.detection} />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full bg-muted/10">
          <div className="text-center p-8 max-w-md">
            <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-medium mb-2">No Data Loaded</h2>
            <p className="text-muted-foreground mb-6">
              To view the anomaly map, please load test data using the "Load Test Data" button in the sidebar.
            </p>
            <div className="flex items-center justify-center">
              <div className="animate-pulse flex items-center text-sm text-muted-foreground">
                <span className="mr-2">←</span>
                Click "Load Test Data" in the sidebar
              </div>
            </div>
          </div>
        </div>
      )}

      <LocationDetailCard detection={selectedDetection} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
    </div>
  )
}
