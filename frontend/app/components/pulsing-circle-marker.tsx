"use client"

import { useEffect, useRef } from "react"
import { CircleMarker, useMap } from "react-leaflet"
import type L from "leaflet"

interface PulsingCircleMarkerProps {
  center: [number, number]
  radius: number
  color: string
  fillColor: string
  fillOpacity: number
  weight: number
  opacity: number
  isPulsing?: boolean
  onMouseOver?: () => void
  onMouseOut?: () => void
  onClick?: () => void
}

export function PulsingCircleMarker({
  center,
  radius,
  color,
  fillColor,
  fillOpacity,
  weight,
  opacity,
  isPulsing = false,
  onMouseOver,
  onMouseOut,
  onClick,
}: PulsingCircleMarkerProps) {
  const pulseRef = useRef<L.CircleMarker | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
  const map = useMap()

  useEffect(() => {
    if (isPulsing && pulseRef.current) {
      const pulseAnimation = () => {
        if (!pulseRef.current) return

        const el = pulseRef.current.getElement()
        if (!el) return

        // Reset animation
        el.style.animation = "none"
        // Trigger reflow
        void el.offsetWidth
        // Start animation
        el.style.animation = "pulse-opacity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      }

      pulseAnimation()
      const interval = setInterval(pulseAnimation, 2000)

      return () => clearInterval(interval)
    }
  }, [isPulsing])

  return (
    <>
      {isPulsing && (
        <CircleMarker
          ref={pulseRef}
          center={center}
          radius={radius * 2}
          pathOptions={{
            fillColor,
            color: "transparent",
            fillOpacity: 0.2,
            className: "leaflet-marker-pulsing",
          }}
        />
      )}
      <CircleMarker
        ref={markerRef}
        center={center}
        radius={radius}
        pathOptions={{
          fillColor,
          color,
          fillOpacity,
          weight,
          opacity,
        }}
        eventHandlers={{
          mouseover: onMouseOver,
          mouseout: onMouseOut,
          click: onClick,
        }}
      />
    </>
  )
}
