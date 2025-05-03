// Calculate cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  console.log("vecA", vecA.length)
  console.log("vecB", vecB.length)
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Find top N similar items based on cosine similarity
export function findTopSimilar(
  queryEmbedding: number[],
  items: Array<{ embedding: number[]; [key: string]: any }>,
  topN = 3,
): Array<{ item: any; similarity: number }> {
  // Calculate similarity scores
  const itemsWithSimilarity = items.map((item) => ({
    item,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
  }))

  // Sort by similarity (descending)
  itemsWithSimilarity.sort((a, b) => b.similarity - a.similarity)

  // Return top N results
  return itemsWithSimilarity.slice(0, topN)
}
