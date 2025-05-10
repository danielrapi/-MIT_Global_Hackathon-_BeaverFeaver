// app/lib/openai.ts

// Cache for embeddings to avoid unnecessary API calls
const embeddingCache = new Map<string, number[]>()

export async function getEmbedding(text: string): Promise<number[]> {
  // Check cache first
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!
  }
  const res = await fetch("/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) throw new Error("Failed to fetch embedding")
  const data = await res.json()
  embeddingCache.set(text, data.embedding)
  return data.embedding
}