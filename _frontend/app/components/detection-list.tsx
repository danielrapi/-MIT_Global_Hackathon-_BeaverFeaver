"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { MapPin } from "lucide-react"
import type { EnhancedDetection } from "@/app/data/dummy-data"

interface DetectionListProps {
  detections: EnhancedDetection[]
  onSelectDetection?: (detection: EnhancedDetection) => void
}

export function DetectionList({ detections, onSelectDetection }: DetectionListProps) {
  return (
    <div className="space-y-4 p-4">
      {detections.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">No detections found</p>
      ) : (
        detections.map((detection) => (
          <Card
            key={detection.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectDetection?.(detection)}
          >
            <div className="relative h-32">
              <Image
                src={detection.imageUrl || "/placeholder.svg"}
                alt={`Detection ${detection.id}`}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm tracking-tight">Detection #{detection.id}</h3>
                <Badge
                  variant={
                    detection.anomalyScore > 0.8 ? "destructive" : detection.anomalyScore > 0.5 ? "default" : "outline"
                  }
                  className="text-xs"
                >
                  {detection.anomalyScore.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                <span>
                  {detection.coordinates[0].toFixed(4)}, {detection.coordinates[1].toFixed(4)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 truncate">
                {new Date(detection.capturedAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
