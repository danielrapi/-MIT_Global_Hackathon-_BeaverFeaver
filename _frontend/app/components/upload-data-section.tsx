"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronUp, ChevronDown, Upload, Database } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export function UploadDataSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleLoadTestData = () => {
    toast({
      title: "Test data loaded",
      description: "Sample anomaly detections have been loaded successfully.",
    })
    console.log("Loading test data...")
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

    // Handle file upload logic here
    const files = Array.from(e.dataTransfer.files)
    console.log("Files dropped:", files)

    if (files.length > 0) {
      toast({
        title: "Files received",
        description: `Received ${files.length} file(s)`,
      })
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
                    console.log("Files selected:", files)

                    if (files.length > 0) {
                      toast({
                        title: "Files selected",
                        description: `Selected ${files.length} file(s)`,
                      })
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
          >
            <Database className="mr-2 h-4 w-4" />
            Load Test Data
          </Button>
        </div>
      </div>
    </div>
  )
}
