import type { EnhancedDetection } from "./types"
import { cosineSimilarity } from "./vector-utils"
import { getEmbedding } from '../lib/openai'

// Generate a more meaningful embedding from a text query
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const embedding = await getEmbedding(query)
  return embedding
}

// Search detections using vector similarity
export async function searchByVectorSimilarity(
  query: string,
  detections: any[],
  topN = 5
): Promise<any[]> {
  try {
    // Filter out detections without embeddings
    const validDetections = detections.filter(d => d.embedding && Array.isArray(d.embedding) && d.embedding.length === 1536)
    
    if (validDetections.length === 0) {
      console.warn('No valid embeddings found in detections')
      return detections.slice(0, topN)
    }

    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query)

    // Calculate similarities
    
    const similarities = validDetections.map(detection => ({
      detection,
      similarity: cosineSimilarity(queryEmbedding, detection.embedding)
    }))

    // Sort by similarity and get top N
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN)
      .map(item => item.detection)
  } catch (error) {
    console.error('Error in vector search:', error)
    // Fallback to simple text search if vector search fails
    return detections
      .filter(d => 
        d.description?.toLowerCase().includes(query.toLowerCase()) ||
        d.location?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, topN)
  }
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
