export interface Detection {
  id: string
  imageUrl: string
  anomalyScore: number
  coordinates: [number, number]
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  capturedAt?: string
  temperatureRange?: {
    min: number
    max: number
  }
  tags?: string[]
  annotation?: string
}
