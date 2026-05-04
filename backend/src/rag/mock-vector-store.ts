import { VectorStore, Document } from './types';

/**
 * A basic in-memory mock implementation of a VectorStore.
 */
export class MockVectorStore implements VectorStore {
  private documents: Document[] = [];

  async addDocuments(documents: Document[]): Promise<void> {
    this.documents.push(...documents);
    console.log(`[MockVectorStore] Added ${documents.length} documents.`);
  }

  async similaritySearch(query: string, limit: number = 3): Promise<Document[]> {
    console.log(`[MockVectorStore] Searching for: "${query}"`);
    // Mock simple keyword matching instead of real embeddings
    const queryLower = query.toLowerCase();
    
    // Sort by a mock "score" based on keyword matches (just random/mocked for now)
    const results = this.documents
      .filter(doc => doc.content.toLowerCase().includes(queryLower) || true) // always return something for mock
      .map(doc => ({
        ...doc,
        score: Math.random() // mock score
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

    return results;
  }
}
