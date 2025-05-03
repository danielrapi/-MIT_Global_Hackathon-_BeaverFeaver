// Raw detection data from JSON files
export interface RawDetection {
  id: string
  pred_score: number
  pred_label: number
  latitude: number
  longitude: number
  annotation: {
    scene_description: string
    anomalies: Array<{
      box_id: number
      approximate_location: string
      possible_objects: string[]
      object_confidences: Record<string, number>
      notable_features: string
      anomaly_reasoning: string
    }>
    overall_objects_detected: Array<{
      label: string
      count: number
    }>
    location_type: string
  }
  embedding: number[]
}

// Enhanced detection format used by the application
export interface EnhancedDetection {
  id: string
  anomalyScore: number
  coordinates: [number, number]
  hasAnomaly: boolean
  capturedAt: string
  tags: string[]
  annotation: string
  anomalies: Array<{
    boxId: number
    location: string
    object_confidences: Record<string, number>
    features: string
    reasoning: string
  }>
  embedding: number[]
  locationType: string
}
