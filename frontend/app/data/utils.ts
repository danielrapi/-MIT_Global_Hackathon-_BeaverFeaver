import type { EnhancedDetection } from "./types"

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
