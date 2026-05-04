# Agentic RAG Reference Template

This folder contains a portable, standalone template for an Agentic Retrieval-Augmented Generation (RAG) system. It is designed to be easily copied into any project without breaking existing architectures.

## What is Agentic RAG?

Standard RAG simply retrieves documents based on a user query and passes them to a Language Model. **Agentic RAG** enhances this by giving the LLM agency. The LLM acts as an agent that can:
1.  **Reason**: Decide *if* it needs to retrieve information, *what* to search for, and *how* to synthesize the retrieved data.
2.  **Act**: Use tools (such as vector store search, web search, or calculation tools) to gather information dynamically.
3.  **Observe**: Analyze the output of its actions and decide whether it has enough information to answer the user or if it needs to act again.

## Files included

- `types.ts`: Core TypeScript interfaces defining the structure of Documents, Tools, Messages, and the Vector Store.
- `vector-store.ts`: A generic interface for vector databases and a mock implementation to show how a retriever fits in.
- `prompts.ts`: Example system instructions for guiding the agent to use tools effectively.
- `agent-loop.ts`: A reference implementation of the ReAct (Reason, Act, Observe) loop.

## How to integrate

1.  **Copy the folder**: Move this directory into your project.
2.  **Implement your specific Vector Store**: Replace the `MockVectorStore` in `vector-store.ts` with an actual connection to your database (e.g., Pinecone, Qdrant, Milvus, Postgres/pgvector).
3.  **Connect your LLM**: Implement the LLM completion function inside `agent-loop.ts` (using OpenAI, Anthropic, Gemini, local models, etc.).
4.  **Define real Tools**: Map your actual system functions (including the vector store search) to the `Tool` interface.
5.  **Run the loop**: Call `runAgentLoop` with the user's task and your tools.
