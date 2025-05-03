"use client"

import { useRef, useState } from "react"
import { CircleMarker } from "react-leaflet"
import type { EnhancedDetection } from "@/app/data/dummy-data"

interface CustomMarkerProps {
  detection: EnhancedDetection
  onHover: (detection: EnhancedDetection | null) => void
  onClick: (detection: EnhancedDetection) => void
}

export function CustomMarker({ detection, onHover, onClick }: CustomMarkerProps) {
  const [isHovered, setIsHovered] = useState(false)
  const markerRef = useRef(null)

  const handleMouseOver = () => {
    setIsHovered(true)
    onHover(detection)
  }

  const handleMouseOut = () => {
    setIsHovered(false)
    onHover(null)
  }

  return (
    <>
      {/* Pulsing outer circle */}
      <CircleMarker
        center={detection.coordinates as [number, number]}
        radius={16}
        pathOptions={{
          fillColor: detection.hasAnomaly ? "#ef4444" : "#6b7280",
          color: "transparent",
          fillOpacity: isHovered ? 0.3 : 0.15,
        }}
      />

      {/* Main circle marker */}
      <CircleMarker
        ref={markerRef}
        center={detection.coordinates as [number, number]}
        radius={8}
        pathOptions={{
          fillColor: detection.hasAnomaly ? "#ef4444" : "#6b7280",
          color: detection.hasAnomaly ? "#b91c1c" : "#4b5563",
          fillOpacity: 0.8,
          weight: 2,
          opacity: 0.8,
        }}
        eventHandlers={{
          mouseover: handleMouseOver,
          mouseout: handleMouseOut,
          click: () => onClick(detection),
        }}
      />
    </>
  )
}
