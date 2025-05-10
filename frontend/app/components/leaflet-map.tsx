"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "./map.css"
import type { EnhancedDetection } from "@/app/data/types"
import type { MapLayout, MarkerPosition } from "./map-container"

// Component to handle tile layer changes
function TileLayerWithLayout({ mapLayout }: { mapLayout: MapLayout }) {
  const map = useMap()

  // This effect will run whenever mapLayout changes
  useEffect(() => {
    // Force a resize event to ensure the map renders correctly after changing layers
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [mapLayout, map])

  return <TileLayer attribution={mapLayout.attribution} url={mapLayout.url} />
}

// Component to handle marker hover with pixel coordinates
function MarkerWithHover({
  detection,
  isFiltered,
  onHover,
  onClick,
}: {
  detection: EnhancedDetection
  isFiltered: boolean
  onHover: (markerPosition: MarkerPosition | null) => void
  onClick: (detection: EnhancedDetection) => void
}) {
  const map = useMap()
  const markerRef = useRef<L.CircleMarker>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseOver = () => {
    setIsHovered(true)
    if (markerRef.current) {
      const latLng = markerRef.current.getLatLng()
      const pixelPoint = map.latLngToContainerPoint(latLng)

      // Get the map container's position
      const mapContainer = map.getContainer()
      const rect = mapContainer.getBoundingClientRect()

      // Calculate absolute position in the viewport
      const absoluteX = rect.left + pixelPoint.x
      const absoluteY = rect.top + pixelPoint.y

      onHover({
        detection,
        pixelPosition: {
          x: absoluteX,
          y: absoluteY,
        },
      })
    }
  }

  const handleMouseOut = () => {
    setIsHovered(false)
    onHover(null)
  }

  // Determine opacity based on filtered status
  const markerOpacity = isFiltered ? 0.8 : 0.3
  const pulsingOpacity = isFiltered ? (isHovered ? 0.3 : 0.15) : 0.1

  return (
    <>
      {/* Pulsing outer circle }
      <CircleMarker
        center={detection.coordinates as [number, number]}
        radius={16}
        pathOptions={{
          fillColor: detection.hasAnomaly ? "#ef4444" : "#b8a927",
          color: "transparent",
          fillOpacity: pulsingOpacity,
          className: isFiltered ? "pulse-ring" : "",
        }}
      />

      {/* Main circle marker */}
      <CircleMarker
        ref={markerRef}
        center={detection.coordinates as [number, number]}
        radius={8}
        pathOptions={{
          fillColor: detection.hasAnomaly ? "#ef4444" : "#9c9557",
          color: detection.hasAnomaly ? "#b91c1c" : "#4b5563",
          fillOpacity: markerOpacity,
          weight: 2,
          opacity: markerOpacity,
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

// Component to handle map movement and update marker positions
function MapEventHandler({ onMapMove }: { onMapMove: () => void }) {
  useMapEvents({
    moveend: onMapMove,
    zoomend: onMapMove,
  })
  return null
}

// Component to fit map bounds to all markers
function FitBoundsToMarkers({ detections, shouldFit }: { detections: EnhancedDetection[]; shouldFit: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (shouldFit && detections.length > 0) {
      // Create bounds object
      const bounds = new L.LatLngBounds(
        detections.map((detection) => [detection.coordinates[0], detection.coordinates[1]]),
      )

      // Fit the map to these bounds with some padding
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 13, // Limit zoom level to avoid zooming in too much for single markers
      })
    }
  }, [detections, shouldFit, map])

  return null
}

interface LeafletMapProps {
  allDetections: EnhancedDetection[]
  filteredDetections: EnhancedDetection[]
  onMarkerHover: (markerPosition: MarkerPosition | null) => void
  onMarkerClick: (detection: EnhancedDetection) => void
  mapLayout: MapLayout
  shouldFitBounds: boolean
}

export function LeafletMap({
  allDetections,
  filteredDetections,
  onMarkerHover,
  onMarkerClick,
  mapLayout,
  shouldFitBounds,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [hoveredMarker, setHoveredMarker] = useState<MarkerPosition | null>(null)

  // Create a Set of filtered detection IDs for quick lookup
  const filteredDetectionIds = new Set(filteredDetections.map((d) => d.id))

  // Update marker position when map moves
  const handleMapMove = () => {
    if (hoveredMarker && mapRef.current) {
      // Re-trigger hover for the current marker to update its position
      const detection = allDetections.find((d) => d.id === hoveredMarker.detection.id)
      if (detection) {
        const latLng = L.latLng(detection.coordinates[0], detection.coordinates[1])
        const pixelPoint = mapRef.current.latLngToContainerPoint(latLng)

        // Get the map container's position
        const mapContainer = mapRef.current.getContainer()
        const rect = mapContainer.getBoundingClientRect()

        // Calculate absolute position in the viewport
        const absoluteX = rect.left + pixelPoint.x
        const absoluteY = rect.top + pixelPoint.y

        onMarkerHover({
          detection,
          pixelPosition: {
            x: absoluteX,
            y: absoluteY,
          },
        })
      }
    }
  }

  useEffect(() => {
    // Set isClient to true once component is mounted
    setIsClient(true)
  }, [])

  // Store the current hovered marker
  useEffect(() => {
    setHoveredMarker((prev) => prev)
  }, [])

  // Don't render the map during SSR
  if (!isClient) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading map...</div>
  }

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      whenReady={(map) => {
        mapRef.current = map.target
      }}
    >
      <TileLayerWithLayout mapLayout={mapLayout} />
      <MapEventHandler onMapMove={handleMapMove} />
      <FitBoundsToMarkers detections={allDetections} shouldFit={shouldFitBounds} />

      {allDetections.map((detection) => (
        <MarkerWithHover
          key={detection.id}
          detection={detection}
          isFiltered={filteredDetectionIds.has(detection.id)}
          onHover={onMarkerHover}
          onClick={onMarkerClick}
        />
      ))}
    </MapContainer>
  )
}
