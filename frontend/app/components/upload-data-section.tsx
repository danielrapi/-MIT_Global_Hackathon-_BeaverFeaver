"use client"

import type React from "react"
import type { EnhancedDetection } from "@/app/data/types"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronUp, ChevronDown, Upload, Database, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { loadTestData, enhanceDetection } from "@/app/data/test-data"

interface UploadDataSectionProps {
  onDataLoaded?: (data: EnhancedDetection[]) => void
}

export function UploadDataSection({ onDataLoaded }: UploadDataSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadTestData = async () => {
    setIsLoading(true)

    try {
      // Load the test data (with a small artificial delay for UX)
      await new Promise((resolve) => setTimeout(resolve, 800))
      const data = await loadTestData()

      if (data.length === 0) {
        throw new Error("No data loaded")
      }

      if (onDataLoaded) {
        onDataLoaded(data)
      }

      toast({
        title: "Test data loaded",
        description: `${data.length} sample anomaly detections have been loaded successfully.`,
      })

      console.log("Test data loaded:", data)
    } catch (error) {
      console.error("Error loading test data:", error)
      toast({
        title: "Error loading test data",
        description: error instanceof Error ? error.message : "An error occurred while loading test data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to handle the upload and response
  const handleImageUpload = async (file: File) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      // Call your Python endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload_image`, {
        method: 'POST',
        body: formData,
      })
      console.log("res", res)
      if (!res.ok) throw new Error('Failed to upload image')
      const data = await res.json()
      console.log("data", data)
      // Assume data.detection is a RawDetection, enhance it
      const enhanced = enhanceDetection(data.detection)
      if (data.images) {
        // Always treat as base64 data URLs
        const imageUrls: any = {}
        for (const key of ["normal", "marked", "heatmap"]) {
          const img = data.images[key]
          imageUrls[key] = img && img.startsWith("data:image") ? img : "/placeholder.svg"
        }
        (enhanced as any).imageUrls = imageUrls
      }
      if (onDataLoaded) {
        onDataLoaded([enhanced])
      }

      toast({
        title: 'Upload successful',
        description: 'New detection added.',
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred during upload.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleImageUpload(files[0])
    }
  }

  return (
    <div className="border-t">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-4 h-auto rounded-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center text-sm font-medium">
          <Upload className="mr-2 h-4 w-4" />
          Upload Data
        </span>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </Button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="p-4 space-y-4">
          {/* Drag & Drop Area */}
          <Card
            className={cn(
              "border-2 border-dashed",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drag & drop images here</p>
              <p className="text-xs text-muted-foreground mb-4">or</p>
              <Button size="sm" className="relative">
                Browse Files
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length > 0) {
                      handleImageUpload(files[0])
                    }
                  }}
                />
              </Button>
            </CardContent>
          </Card>

          {/* Load Test Data Button */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center text-sm"
            onClick={handleLoadTestData}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Load Test Data
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
