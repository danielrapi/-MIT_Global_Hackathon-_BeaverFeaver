"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X, MapPin, Calendar, Clock, AlertTriangle, BarChart3, ImageIcon, Maximize2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { EnhancedDetection } from "@/app/data/types"
import { getImagePaths } from "@/app/data/test-data"
import { ObjectConfidenceBars } from "./object-confidence-bars"

interface LocationDetailCardProps {
  detection: EnhancedDetection | null
  isOpen: boolean
  onClose: () => void
}

export function LocationDetailCard({ detection, isOpen, onClose }: LocationDetailCardProps) {
  const [mounted, setMounted] = useState(false)
  const [animationClass, setAnimationClass] = useState("translate-x-full")
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null)
  const firstRender = useRef(true)

  // Handle mounting and animation
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      if (isOpen) {
        setMounted(true)
        // Small delay to ensure DOM is ready before animation
        setTimeout(() => {
          setAnimationClass("translate-x-0")
        }, 10)
      }
      return
    }

    if (isOpen) {
      setMounted(true)
      // Small delay to ensure DOM is ready before animation
      setTimeout(() => {
        setAnimationClass("translate-x-0")
      }, 10)
    } else {
      setAnimationClass("translate-x-full")
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setMounted(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <>
      {/* Full screen image overlay */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[10001] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullScreenImage(null)}
        >
          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            <Image
              src={fullScreenImage}
              alt="Full screen image"
              fill
              className="object-contain"
              priority
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
              onClick={() => setFullScreenImage(null)}
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sliding panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[10000] h-full w-full max-w-md border-l bg-background shadow-xl transition-transform duration-300 ease-in-out",
          animationClass,
        )}
      >
        {detection ? (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-medium">Detection Details</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 space-y-6">
              {/* Image with view selector */}
              <Card className="overflow-hidden">
                <Tabs defaultValue="normal" className="w-full">
                  <div className="relative aspect-square w-full group">
                    <TabsContent value="normal" className="m-0 p-0">
                      <Image
                        src={getImagePaths(detection).normal || "/placeholder.svg"}
                        alt="Detection image"
                        fill
                        className="object-contain cursor-pointer"
                        onClick={() => setFullScreenImage(getImagePaths(detection).normal)}
                      />
                    </TabsContent>
                    <TabsContent value="marked" className="m-0 p-0">
                      <Image
                        src={getImagePaths(detection).marked || "/placeholder.svg"}
                        alt="Detection image with anomaly marked"
                        fill
                        className="object-contain cursor-pointer"
                        onClick={() => setFullScreenImage(getImagePaths(detection).marked)}
                      />
                    </TabsContent>
                    <TabsContent value="heatmap" className="m-0 p-0">
                      <Image
                        src={getImagePaths(detection).heatmap || "/placeholder.svg"}
                        alt="Detection heatmap"
                        fill
                        className="object-contain cursor-pointer"
                        onClick={() => setFullScreenImage(getImagePaths(detection).heatmap)}
                      />
                    </TabsContent>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const currentImage = getImagePaths(detection)
                        const activeTab = document.querySelector('[role="tab"][data-state="active"]')?.getAttribute('data-value')
                        if (activeTab === 'normal') setFullScreenImage(currentImage.normal)
                        else if (activeTab === 'marked') setFullScreenImage(currentImage.marked)
                        else if (activeTab === 'heatmap') setFullScreenImage(currentImage.heatmap)
                      }}
                    >
                      <Maximize2 className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                  <div className="border-t p-2">
                    <TabsList className="w-full">
                      <TabsTrigger value="normal" className="flex-1">
                        Normal
                      </TabsTrigger>
                      <TabsTrigger value="marked" className="flex-1">
                        Anomaly Marked
                      </TabsTrigger>
                      <TabsTrigger value="heatmap" className="flex-1">
                        Heatmap
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
              </Card>

              {/* Confidence scores */}
              {detection.anomalies && detection.anomalies.length > 0 ? (
                <>
                  <div className="space-y-4">
                    <h3 className="text-base font-medium flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Object Confidences
                    </h3>
                    {detection.anomalies[0].object_confidences && (
                      <ObjectConfidenceBars confidences={detection.anomalies[0].object_confidences} />
                    )}
                  </div>

                  {/* Image annotation */}
                  <div className="space-y-2">
                    <h3 className="text-base font-medium flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Anomaly Annotation
                    </h3>
                    <Card className="p-3 text-sm">
                      <p>{detection.annotation}</p>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-base font-medium flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Anomaly Status
                  </h3>
                  <Card className="p-3 text-sm">
                    <p>No anomaly detected</p>
                  </Card>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-4">
                <h3 className="text-base font-medium flex items-center">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Image Metadata
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Coordinates</div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-1 h-3 w-3" />
                      <span>
                        {detection.coordinates[0].toFixed(6)}, {detection.coordinates[1].toFixed(6)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Date Captured</div>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>{new Date(detection.capturedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Time</div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{new Date(detection.capturedAt).toLocaleTimeString()} UTC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              <Button className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p>No detection selected</p>
          </div>
        )}
      </div>
    </>
  )
}
