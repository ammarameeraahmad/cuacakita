import { Message, Tool, AgentState, AgentResponse } from './types.js';
import { AGENTIC_RAG_SYSTEM_PROMPT } from './prompts.js';

/**
 * Placeholder for your actual LLM call logic.
 * In a real implementation, this would connect to OpenAI, Anthropic, Gemini, etc.
 */
async function callLLM(messages: Message[], tools: Tool[]): Promise<any> {
  // Mock LLM Response: Return a tool call or final text
  console.log("Mock LLM called with", messages.length, "messages.");
  
  // Example mock heuristic: If tool isn't used, use it; otherwise, answer.
  const hasToolCall = messages.some(m => m.role === 'tool');
  if (!hasToolCall) {
    return {
      type: 'tool_call',
      toolName: tools[0]?.name || 'unknown',
      toolInput: 'example query'
    };
  }

  return {
    type: 'text',
    content: 'Based on the context retrieved, here is the final answer...'
  };
}

/**
 * The core Agentic RAG ReAct (Reason, Act, Observe) loop.
 * 
 * @param userTask - The question or task from the user.
 * @param tools - Available tools (should include a Vector Search tool).
 * @param maxSteps - Limits the loop to prevent infinite recursion.
 * @returns The final response and conversation history.
 */
export async function runAgentLoop(
  userTask: string,
  tools: Tool[],
  maxSteps: number = 5
): Promise<AgentResponse> {
  
  const state: AgentState = {
    messages: [
      { role: 'system', content: AGENTIC_RAG_SYSTEM_PROMPT },
      { role: 'user', content: userTask }
    ],
    status: 'running',
    maxSteps,
    currentStep: 0
  };

  while (state.currentStep < state.maxSteps && state.status === 'running') {
    state.currentStep++;
    console.log(`--- Step ${state.currentStep} ---`);

    // 1. Reason: Ask the LLM what to do next
    const llmResponse = await callLLM(state.messages, tools);

    // 2. Act: Execute tool if requested
    if (llmResponse.type === 'tool_call') {
      console.log(`[Agent] Calling tool: ${llmResponse.toolName}`);
      
      const toolToRun = tools.find(t => t.name === llmResponse.toolName);
      let toolResult = '';

      if (toolToRun) {
        try {
          toolResult = await toolToRun.execute(llmResponse.toolInput);
        } catch (error: any) {
          toolResult = `Error executing tool: ${error.message}`;
        }
      } else {
        toolResult = `Tool ${llmResponse.toolName} not found.`;
      }

      // 3. Observe: Add tool output to history so the LLM can process it next iteration
      state.messages.push({
        role: 'assistant',
        content: `Thought: I need to use ${llmResponse.toolName}.`,
        toolCallId: 'mock-call-id',
        name: llmResponse.toolName
      });
      state.messages.push({
        role: 'tool',
        content: toolResult,
        toolCallId: 'mock-call-id',
        name: llmResponse.toolName
      });

    } else if (llmResponse.type === 'text') {
      // Agent has concluded and provided a final answer
      console.log(`[Agent] Final Answer generated.`);
      state.messages.push({
        role: 'assistant',
        content: llmResponse.content
      });
      state.status = 'success';
      break;
    }
  }

  if (state.status !== 'success') {
    console.warn("Agent loop reached maximum steps without completing.");
  }

  return {
    finalAnswer: state.messages[state.messages.length - 1]?.content || '',
    conversationHistory: state.messages,
    totalSteps: state.currentStep
  };
}
