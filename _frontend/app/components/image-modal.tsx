"use client"

import type { Detection } from "@/app/types"
import { LocationDetailCard } from "./location-detail-card"

interface ImageModalProps {
  detection: Detection | null
  isOpen: boolean
  onClose: () => void
}

export function ImageModal({ detection, isOpen, onClose }: ImageModalProps) {
  return <LocationDetailCard detection={detection} isOpen={isOpen} onClose={onClose} />
}
