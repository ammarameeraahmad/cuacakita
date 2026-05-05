import { Message, Tool, AgentState, AgentResponse } from './types.js';
import { AGENTIC_RAG_SYSTEM_PROMPT } from './prompts.js';
import { callGroqChatCompletion } from '../lib/groq.js';

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
  maxSteps: number = 5,
  conversationHistory: Message[] = [],
  userContext: string = ''
): Promise<AgentResponse> {

  const validHistory: Message[] = conversationHistory
    .slice(-5)
    .filter(msg => ['system', 'user', 'assistant', 'tool'].includes(msg.role))
    .map((msg): Message => ({ role: msg.role as 'system' | 'user' | 'assistant' | 'tool', content: msg.content }));

  const messages: Message[] = [
    { role: 'system', content: AGENTIC_RAG_SYSTEM_PROMPT },
    ...validHistory, // Include last 5 valid messages as context
    { role: 'user', content: userTask + userContext }
  ];

  console.log('=== MESSAGES SENT TO GROQ ===');
  console.log(JSON.stringify(messages, null, 2));
  console.log('==============================');

  const state: AgentState = {
    messages,
    status: 'running',
    maxSteps,
    currentStep: 0
  };

  while (state.currentStep < state.maxSteps && state.status === 'running') {
    state.currentStep++;

    const toolOutputs: string[] = [];

    for (const tool of tools) {
      try {
        const output = await tool.execute(userTask);
        toolOutputs.push(`${tool.name}: ${output}`);
      } catch (error: any) {
        toolOutputs.push(`${tool.name}: Error executing tool - ${error.message}`);
      }
    }

    const responseText = await callGroqChatCompletion([
      { role: 'system', content: `${AGENTIC_RAG_SYSTEM_PROMPT}\n\nGunakan konteks cuaca BMKG dan hasil pencarian pengetahuan di bawah ini untuk menjawab dengan jelas, ringkas, dan natural dalam Bahasa Indonesia.` },
      { role: 'user', content: `Pertanyaan pengguna: ${userTask}\n\nKonteks alat:\n${toolOutputs.join('\n\n') || 'Tidak ada konteks alat yang tersedia.'}` },
    ]);

    state.messages.push({
      role: 'assistant',
      content: responseText,
    });
    state.status = 'success';
    break;
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
