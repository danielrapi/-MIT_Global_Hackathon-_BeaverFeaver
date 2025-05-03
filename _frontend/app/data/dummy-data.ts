import type { Detection } from "@/app/types"

// Expanded detection type with additional fields
export interface EnhancedDetection extends Detection {
  hasAnomaly: boolean
  capturedAt: string
  temperatureRange: {
    min: number
    max: number
  }
  tags: string[]
  annotation: string
  confidence: {
    anomalyScore: number
    temperatureDeviation: number
    patternRecognition: number
  }
  vectorEmbedding: number[] // Simplified vector representation for search
  keywords: string[] // Keywords for search
}

// Dummy data with enhanced fields
export const dummyDetections: EnhancedDetection[] = [
  {
    id: "1",
    imageUrl: "/images/1/normal.jpg",
    anomalyScore: 0.85,
    coordinates: [51.505, -0.09],
    boundingBox: { x: 100, y: 100, width: 200, height: 150 },
    hasAnomaly: true,
    capturedAt: "2023-05-02T14:32:45Z",
    temperatureRange: {
      min: 18.2,
      max: 42.7,
    },
    tags: ["Thermal", "Electrical", "High Priority", "Building Inspection"],
    annotation:
      "Thermal imaging indicates a significant temperature anomaly in the marked region. Pattern suggests potential electrical overheating or insulation failure.",
    confidence: {
      anomalyScore: 0.85,
      temperatureDeviation: 0.78,
      patternRecognition: 0.92,
    },
    vectorEmbedding: [0.2, 0.5, 0.8, 0.3, 0.9, 0.1, 0.7],
    keywords: ["electrical", "overheating", "building", "critical", "panel"],
  },
  {
    id: "2",
    imageUrl: "/images/2/normal.jpg",
    anomalyScore: 0.65,
    coordinates: [51.51, -0.1],
    boundingBox: { x: 150, y: 120, width: 180, height: 130 },
    hasAnomaly: true,
    capturedAt: "2023-05-03T09:15:22Z",
    temperatureRange: {
      min: 20.1,
      max: 35.4,
    },
    tags: ["Thermal", "Moderate", "Roof Inspection"],
    annotation:
      "Moderate temperature variation detected on roof surface. Possible insulation degradation or minor water infiltration.",
    confidence: {
      anomalyScore: 0.65,
      temperatureDeviation: 0.59,
      patternRecognition: 0.71,
    },
    vectorEmbedding: [0.4, 0.3, 0.2, 0.6, 0.5, 0.4, 0.3],
    keywords: ["roof", "insulation", "moderate", "water", "infiltration"],
  },
  {
    id: "3",
    imageUrl: "/images/3/normal.png",
    anomalyScore: 0.92,
    coordinates: [51.49, -0.08],
    boundingBox: { x: 80, y: 90, width: 220, height: 170 },
    hasAnomaly: true,
    capturedAt: "2023-05-01T16:45:10Z",
    temperatureRange: {
      min: 15.8,
      max: 48.2,
    },
    tags: ["Thermal", "Electrical", "Critical", "Urgent"],
    annotation:
      "Critical temperature anomaly detected in electrical junction box. Immediate inspection recommended due to potential fire hazard.",
    confidence: {
      anomalyScore: 0.92,
      temperatureDeviation: 0.88,
      patternRecognition: 0.95,
    },
    vectorEmbedding: [0.9, 0.8, 0.7, 0.9, 0.8, 0.9, 0.7],
    keywords: ["critical", "junction", "fire", "hazard", "electrical", "urgent"],
  },
  {
    id: "4",
    imageUrl: "/images/4/normal.png",
    anomalyScore: 0.32,
    coordinates: [51.515, -0.12],
    boundingBox: { x: 120, y: 110, width: 160, height: 120 },
    hasAnomaly: false,
    capturedAt: "2023-05-04T11:20:33Z",
    temperatureRange: {
      min: 19.5,
      max: 26.8,
    },
    tags: ["Thermal", "Normal", "Routine"],
    annotation:
      "No significant thermal anomalies detected. Temperature distribution is within expected parameters for this structure type.",
    confidence: {
      anomalyScore: 0.32,
      temperatureDeviation: 0.28,
      patternRecognition: 0.35,
    },
    vectorEmbedding: [0.2, 0.3, 0.1, 0.2, 0.3, 0.2, 0.1],
    keywords: ["normal", "routine", "regular", "standard", "baseline"],
  },
  {
    id: "5",
    imageUrl: "/images/5/normal.png",
    anomalyScore: 0.15,
    coordinates: [51.52, -0.095],
    boundingBox: { x: 130, y: 140, width: 170, height: 110 },
    hasAnomaly: false,
    capturedAt: "2023-05-05T13:10:45Z",
    temperatureRange: {
      min: 18.9,
      max: 24.2,
    },
    tags: ["Thermal", "Normal", "Baseline"],
    annotation: "Baseline thermal scan shows normal temperature distribution. No anomalies detected in the structure.",
    confidence: {
      anomalyScore: 0.15,
      temperatureDeviation: 0.12,
      patternRecognition: 0.18,
    },
    vectorEmbedding: [0.1, 0.2, 0.1, 0.3, 0.1, 0.2, 0.1],
    keywords: ["baseline", "normal", "standard", "regular", "reference"],
  },
]

// Helper function to get image paths for a detection
export function getImagePaths(detection: EnhancedDetection) {
  const baseDir = `/images/${detection.id}`
  return {
    normal: `${baseDir}/normal.jpg`,
    marked: `${baseDir}/marked.jpg`,
    heatmap: `${baseDir}/heatmap.jpg`,
  }
}

// Simple vector search implementation
export function vectorSearch(query: string, detections: EnhancedDetection[], threshold = 0.3): EnhancedDetection[] {
  if (!query.trim()) return detections

  const queryTerms = query.toLowerCase().split(/\s+/)

  return detections.filter((detection) => {
    // Check if any keywords match the query terms
    const keywordMatches = detection.keywords.some((keyword) =>
      queryTerms.some((term) => keyword.toLowerCase().includes(term)),
    )

    // Check if ID matches
    const idMatch = detection.id.toLowerCase().includes(query.toLowerCase())

    // Check if annotation contains query terms
    const annotationMatches = queryTerms.some((term) => detection.annotation.toLowerCase().includes(term))

    // Check if tags match
    const tagMatches = detection.tags.some((tag) => queryTerms.some((term) => tag.toLowerCase().includes(term)))

    return keywordMatches || idMatch || annotationMatches || tagMatches
  })
}
