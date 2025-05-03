import type { EnhancedDetection } from "./types"
import { cosineSimilarity } from "./vector-utils"

// Mock function to generate a simple embedding from a text query
// In a real application, this would call an API to generate embeddings
function generateQueryEmbedding(query: string, dimension = 768): number[] {
  // This is a very simplistic mock that just creates a random embedding
  // In a real application, you would use a proper embedding model
  const embedding = new Array(dimension).fill(0)

  // Seed the embedding with some values based on the query string
  const seed = query.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  for (let i = 0; i < dimension; i++) {
    // Generate a pseudo-random value based on the seed and position
    embedding[i] = Math.sin(seed * (i + 1)) / 2
  }

  return embedding
}

// Search detections using vector similarity
export function searchByVectorSimilarity(
  query: string,
  detections: EnhancedDetection[],
  topN = 3,
): EnhancedDetection[] {
  if (!query.trim() || detections.length === 0) {
    return detections
  }

  // Check if detections have embeddings
  if (!detections[0].embedding || detections[0].embedding.length === 0) {
    console.warn("Detections don't have embeddings, falling back to text search")
    return textSearch(query, detections)
  }

  // Generate query embedding (in a real app, this would call an API)
  const queryEmbedding = generateQueryEmbedding(query, detections[0].embedding.length)

  // Calculate similarity scores
  const detectionsWithScores = detections.map((detection) => ({
    detection,
    score: cosineSimilarity(queryEmbedding, detection.embedding),
  }))

  // Sort by similarity score (descending)
  detectionsWithScores.sort((a, b) => b.score - a.score)

  // Return top N results
  return detectionsWithScores.slice(0, topN).map((item) => item.detection)
}

// Fallback text search function
function textSearch(query: string, detections: EnhancedDetection[]): EnhancedDetection[] {
  const queryLower = query.toLowerCase()

  return detections.filter(
    (detection) =>
      detection.annotation.toLowerCase().includes(queryLower) ||
      detection.id.toLowerCase().includes(queryLower) ||
      detection.locationType.toLowerCase().includes(queryLower) ||
      detection.tags.some((tag) => tag.toLowerCase().includes(queryLower)) ||
      (detection.anomalies &&
        detection.anomalies.some(
          (anomaly) =>
            anomaly.features.toLowerCase().includes(queryLower) || anomaly.reasoning.toLowerCase().includes(queryLower),
        )),
  )
}
