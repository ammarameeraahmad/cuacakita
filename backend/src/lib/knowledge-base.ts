import { Document } from '../rag/types.js';
import { MockVectorStore } from '../rag/mock-vector-store.js';

const INITIAL_DOCS: Document[] = [
  {
    id: 'bmkg-el-nino',
    content: 'El Nino increases drought risk in Indonesia and can reduce rainfall during the dry season.',
    metadata: { source: 'BMKG_report' },
  },
  {
    id: 'bmkg-la-nina',
    content: 'La Nina brings heavier rainfall to the region and increases flood risk in low-lying areas.',
    metadata: { source: 'BMKG_report' },
  },
  {
    id: 'ipcc-sea-level',
    content: 'Rising sea levels threaten coastal cities like Jakarta and other Indonesian coastal villages.',
    metadata: { source: 'IPCC' },
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __climsightKnowledgeStore: MockVectorStore | undefined;
}

const vectorStore = globalThis.__climsightKnowledgeStore ?? new MockVectorStore();

if (!globalThis.__climsightKnowledgeStore) {
  globalThis.__climsightKnowledgeStore = vectorStore;
  void vectorStore.addDocuments(INITIAL_DOCS);
}

export function getKnowledgeStore() {
  return vectorStore;
}

export async function searchClimateKnowledge(query: string, limit: number = 3): Promise<Document[]> {
  return vectorStore.similaritySearch(query, limit);
}

export async function addClimateDocuments(documents: Document[]): Promise<void> {
  await vectorStore.addDocuments(documents);
}
