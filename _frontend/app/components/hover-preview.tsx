"use client"

import type { EnhancedDetection } from "@/app/data/types"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, MapPin, Calendar } from "lucide-react"
import { getImagePaths } from "@/app/data/test-data"

interface HoverPreviewProps {
  detection: EnhancedDetection
}

export function HoverPreview({ detection }: HoverPreviewProps) {
  const { anomalyScore, hasAnomaly } = detection
  const imagePaths = getImagePaths(detection)

  return (
    <div className="relative">
      <Card className="w-56 shadow-lg overflow-hidden">
        <div className="relative w-full h-56">
          <Image
            src={imagePaths.normal || "/placeholder.svg"}
            alt="Anomaly preview"
            fill
            className="object-contain"
            priority
          />
          {hasAnomaly && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Anomaly
            </Badge>
          )}
        </div>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Detection #{detection.id}</h3>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span>{(anomalyScore * 100).toFixed(0)}%</span>
            </div>
            <Progress value={anomalyScore * 100} className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">
                {detection.coordinates[0].toFixed(4)}, {detection.coordinates[1].toFixed(4)}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span className="truncate">{new Date(detection.capturedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Triangle pointer at the bottom */}
      <div
        className="absolute left-1/2 bottom-0 w-4 h-4 bg-card transform -translate-x-1/2 translate-y-1/2 rotate-45 border-r border-b border-border"
        style={{ zIndex: -1 }}
      ></div>
    </div>
  )
}
