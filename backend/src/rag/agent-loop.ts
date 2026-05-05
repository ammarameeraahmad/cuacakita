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

  // Build conversation context from history (last 5 messages)
  let historyText = '';
  if (conversationHistory.length > 0) {
    historyText = '\n\nRiwayat percakapan:\n';
    const recentHistory = conversationHistory.slice(-5);
    recentHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'Pengguna' : msg.role === 'assistant' ? 'Asisten' : msg.role;
      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
      historyText += `${role}: ${content}\n`;
    });
  }

  // Execute tools to get BMKG and knowledge base data
  const toolOutputs: string[] = [];
  for (const tool of tools) {
    try {
      const output = await tool.execute(userTask);
      toolOutputs.push(`${tool.name}: ${output}`);
    } catch (error: any) {
      toolOutputs.push(`${tool.name}: Error executing tool - ${error.message}`);
    }
  }

  // Log tool outputs
  console.log('=== TOOL OUTPUTS ===');
  toolOutputs.forEach((output, index) => {
    console.log(`Tool ${index}:`, output.substring(0, 500));
  });
  console.log('====================');

  // Build a CLEAN plain-text prompt (no JSON, no image references)
  const bmkgData = toolOutputs.join('\n\n');
  const fullPrompt = `${AGENTIC_RAG_SYSTEM_PROMPT}${historyText}\n\nData BMKG dan pengetahuan:\n${bmkgData}\n\nPertanyaan pengguna: ${userTask}${userContext}`;

  // Log the complete prompt
  console.log('=== COMPLETE PROMPT TO GROQ ===');
  console.log(fullPrompt.substring(0, 2000));
  console.log('=================================');

  const state: AgentState = {
    messages: [{ role: 'user', content: fullPrompt }],
    status: 'running',
    maxSteps,
    currentStep: 0
  };

  while (state.currentStep < state.maxSteps && state.status === 'running') {
    state.currentStep++;

    try {
      const responseText = await callGroqChatCompletion([
        { role: 'user', content: fullPrompt }
      ]);

      state.messages.push({
        role: 'assistant',
        content: responseText,
      });
      state.status = 'success';
      break;
    } catch (error: any) {
      console.error('Error in agent loop:', error);
      if (state.currentStep >= state.maxSteps - 1) {
        state.status = 'failed';
      }
    }
  }

  if (state.status !== 'success') {
    console.warn("Agent loop reached maximum steps without completing.");
  }

  return {
    finalAnswer: state.messages[state.messages.length - 1]?.content || 'Maaf, terjadi kesalahan.',
    conversationHistory: state.messages,
    totalSteps: state.currentStep
  };
}
