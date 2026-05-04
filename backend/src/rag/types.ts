/**
 * Represents a generic document retrieved from the knowledge base.
 */
export interface Document {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  score?: number; // Relevance score if provided by the retriever
}

/**
 * Represents an actionable tool the agent can use.
 */
export interface Tool {
  name: string;
  description: string;
  execute: (input: string) => Promise<string>;
}

/**
 * Standard chat message format.
 */
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  name?: string; // e.g., tool name
}

/**
 * Interface for any Vector Store integration.
 */
export interface VectorStore {
  addDocuments(documents: Document[]): Promise<void>;
  similaritySearch(query: string, limit?: number): Promise<Document[]>;
}

/**
 * The internal state of the agent during execution.
 */
export interface AgentState {
  messages: Message[];
  status: 'idle' | 'running' | 'success' | 'failed';
  maxSteps: number;
  currentStep: number;
}

/**
 * Response structure for the agent loop.
 */
export interface AgentResponse {
  finalAnswer: string;
  conversationHistory: Message[];
  totalSteps: number;
}
