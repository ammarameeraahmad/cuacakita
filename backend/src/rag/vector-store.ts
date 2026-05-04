import { Document, VectorStore } from './types';

/**
 * A generic Mock Vector Store implementation for reference.
 * In a real implementation, you would swap this logic out with 
 * Pinecone, Weaviate, Milvus, pgvector, etc.
 */
export class MockVectorStore implements VectorStore {
  private storage: Document[] = [];

  constructor() {}

  /**
   * Add documents to the knowledge base.
   */
  async addDocuments(documents: Document[]): Promise<void> {
    this.storage.push(...documents);
    console.log(`[MockVectorStore] Added ${documents.length} documents.`);
  }

  /**
   * Search for semantically similar documents based on the query.
   * Note: This mock just returns a static document to simulate retrieval.
   */
  async similaritySearch(query: string, limit: number = 3): Promise<Document[]> {
    console.log(`[MockVectorStore] Searching for: "${query}" (limit: ${limit})`);
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock search logic: return up to 'limit' generic documents
    return Array.from({ length: limit }).map((_, i) => ({
      id: `doc-${Date.now()}-${i}`,
      content: `This is a mock retrieved context related to: ${query}. (Mock chunk ${i + 1})`,
      metadata: { source: 'mock-database' },
      score: 0.95 - (i * 0.05)
    }));
  }
}
