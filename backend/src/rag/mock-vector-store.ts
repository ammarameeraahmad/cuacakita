import { VectorStore, Document } from './types.js';

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
    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .map((term) => term.trim())
      .filter(Boolean);

    const results = this.documents
      .map((doc) => {
        const content = doc.content.toLowerCase();
        const matches = queryTerms.reduce((total, term) => total + (content.includes(term) ? 1 : 0), 0);

        return {
          ...doc,
          score: queryTerms.length === 0 ? 0.1 : matches / queryTerms.length
        };
      })
      .filter((doc) => (doc.score || 0) > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

    if (results.length > 0) {
      return results;
    }

    return this.documents
      .slice(0, limit)
      .map((doc, index) => ({
        ...doc,
        score: Math.max(0.1, 0.8 - index * 0.1)
      }));
  }
}
