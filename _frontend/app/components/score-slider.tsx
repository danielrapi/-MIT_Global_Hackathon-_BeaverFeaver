"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface ScoreSliderProps {
  value: number
  onChange: (value: number) => void
}

export function ScoreSlider({ value, onChange }: ScoreSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="score-filter" className="text-sm font-medium">
          Anomaly Score Filter
        </Label>
        <span className="text-sm text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <Slider
        id="score-filter"
        min={0}
        max={1}
        step={0.01}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>0.5</span>
        <span>1</span>
      </div>
    </div>
  )
}
