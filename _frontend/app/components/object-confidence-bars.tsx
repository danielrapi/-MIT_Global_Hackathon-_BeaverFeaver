"use client"

import { Progress } from "@/components/ui/progress"

interface ObjectConfidencesProps {
  confidences: Record<string, number>
}

export function ObjectConfidenceBars({ confidences }: ObjectConfidencesProps) {
  // Sort confidences by value (descending)
  const sortedConfidences = Object.entries(confidences)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .filter(([, value]) => value > 0.05) // Filter out very low confidence values

  return (
    <div className="space-y-3">
      {sortedConfidences.map(([object, confidence]) => (
        <div key={object} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm capitalize">{object}</span>
            <span className="text-sm font-medium">{(confidence * 100).toFixed(0)}%</span>
          </div>
          <Progress value={confidence * 100} className="h-2" />
        </div>
      ))}
    </div>
  )
}
