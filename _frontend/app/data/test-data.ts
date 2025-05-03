import type { EnhancedDetection, RawDetection } from "./types"

// Function to load a single JSON file
async function loadJsonFile(id: string): Promise<RawDetection | null> {
  try {
    const response = await fetch(`/test_data/json/${id}_summary.json`)
    if (!response.ok) {
      throw new Error(`Failed to load JSON file for id ${id}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error loading JSON file for id ${id}:`, error)
    return null
  }
}

// Function to convert RawDetection to EnhancedDetection
function enhanceDetection(raw: RawDetection): EnhancedDetection {
  return {
    id: raw.id,
    anomalyScore: raw.pred_score,
    coordinates: [raw.latitude, raw.longitude],
    hasAnomaly: raw.pred_label === 1,
    capturedAt: new Date().toISOString(), // You might want to add actual timestamps to the JSON files
    tags: raw.annotation?.anomalies?.flatMap(a => a.possible_objects) || [],
    annotation: raw.annotation?.scene_description || "",
    anomalies: raw.annotation?.anomalies?.map(a => ({
      boxId: a.box_id,
      location: a.approximate_location,
      object_confidences: a.object_confidences,
      features: a.notable_features,
      reasoning: a.anomaly_reasoning
    })) || [],
    embedding: raw.embedding || [],
    locationType: raw.annotation?.location_type || "unknown"
  }
}

// Function to get image paths for a detection
export function getImagePaths(detection: EnhancedDetection): { normal: string; marked: string; heatmap: string } {
  const basePath = `/test_data/images copy/${detection.id}`
  return {
    normal: `${basePath}/${detection.id}_image.png`,
    marked: `${basePath}/${detection.id}_mask.png`,
    heatmap: `${basePath}/${detection.id}_heatmap.png`
  }
}

// Function to load all test data
export async function loadTestData(): Promise<EnhancedDetection[]> {
  const detections: EnhancedDetection[] = []
  
  // We'll load a fixed set of IDs since we can't list files in the public directory
  const ids = Array.from({ length: 60 }, (_, i) => i.toString().padStart(3, '0'))
  
  for (const id of ids) {
    const rawDetection = await loadJsonFile(id)
    if (rawDetection) {
      detections.push(enhanceDetection(rawDetection))
    }
  }
  
  return detections
}

// Function to perform vector search
export function vectorSearch(query: string, detections: EnhancedDetection[], topN = 3): EnhancedDetection[] {
  // This is a placeholder - you might want to implement actual vector search
  return detections.slice(0, topN)
} 