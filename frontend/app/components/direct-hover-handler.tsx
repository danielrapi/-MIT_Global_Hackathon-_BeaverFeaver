"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import type { EnhancedDetection } from "@/app/data/types"

interface DirectHoverHandlerProps {
  detections: EnhancedDetection[]
  onMarkerHover: (detection: EnhancedDetection | null) => void
}

export function DirectHoverHandler({ detections, onMarkerHover }: DirectHoverHandlerProps) {
  const map = useMap()

  useEffect(() => {
    // Add mousemove event to the map
    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      // Check if the mouse is over any marker
      const point = e.containerPoint
      let found = false

      // Get all circle markers on the map
      map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) {
          const markerPoint = map.latLngToContainerPoint(layer.getLatLng())
          const distance = point.distanceTo(markerPoint)

          // If mouse is within the marker radius
          if (distance <= layer.options.radius!) {
            // Find the detection that corresponds to this marker
            const detection = detections.find(
              (d) => d.coordinates[0] === layer.getLatLng().lat && d.coordinates[1] === layer.getLatLng().lng,
            )

            if (detection) {
              onMarkerHover(detection)
              found = true
            }
          }
        }
      })

      if (!found) {
        onMarkerHover(null)
      }
    }

    map.on("mousemove", handleMouseMove)

    return () => {
      map.off("mousemove", handleMouseMove)
    }
  }, [map, detections, onMarkerHover])

  return null
}
