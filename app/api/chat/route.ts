import { groq } from '@ai-sdk/groq';
import { createOllama } from 'ollama-ai-provider-v2';
import { streamText, tool, convertToModelMessages, UIMessage, createIdGenerator, validateUIMessages, ToolSet } from 'ai';
import { z } from 'zod';
import { loadChat, saveChat } from '@/lib/chat-store';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { message, chatId, provider, model }: {
      message?: UIMessage
      chatId: string
      provider: 'groq' | 'ollama'
      model?: string
    } = await req.json();

    // Validate provider and chatId
    if (!provider) {
      return new Response('Provider is required', { status: 400 });
    }

    if (!chatId) {
      return new Response('Chat ID is required', { status: 400 });
    }

    // Load previous messages from storage
    const previousMessages = await loadChat(chatId);

    // Append new message if provided
    let messages: UIMessage[] = previousMessages;
    if (message) {
      messages = [...previousMessages, message];
    }

    // Initialize the appropriate provider
    let selectedModel;

    if (provider === 'groq') {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        return new Response('GROQ_API_KEY not configured', { status: 500 });
      }
      // Use models that support tool calling
      selectedModel = groq(model || 'llama-3.3-70b-versatile');
    } else if (provider === 'ollama') {
      const ollama = createOllama({
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api',
      });
      // Default to llama3.1 for Ollama
      selectedModel = ollama(model || 'llama3.1');
    } else {
      return new Response('Invalid provider', { status: 400 });
    }

    // Define SQL generation tool
    const tools = {
      generateSQL: tool({
        description: 'Generate a SQL query based on user requirements and table schema',
        inputSchema: z.object({
          query: z.string().describe('The SQL query to execute'),
          explanation: z.string().describe('Explanation of what the query does'),
          tableUsed: z.string().describe('The main table being queried'),
        }),
        execute: async ({ query, explanation, tableUsed }) => {

          return {
            success: true,
            query,
            explanation,
            tableUsed,
          };
        },
      }),
      getTableInfo: tool({
        description: 'Get information about available tables and their schemas',
        inputSchema: z.object({
          tableName: z.string().optional().describe('Specific table to get info about, or omit for all tables'),
        }),
        execute: async ({ tableName }) => {

          // This is a placeholder - in real implementation, this would query the database
          return {
            message: tableName
              ? `To get schema for table "${tableName}", please make sure the table is loaded in the analytics interface.`
              : 'Please load your data files in the analytics interface to see available tables and schemas.',
          };
        },
      }),
    } satisfies ToolSet;


    const validatedMessages = messages;

    const result = streamText({
      model: selectedModel,
      messages: convertToModelMessages(validatedMessages),
      system: `You are a helpful SQL assistant for a DuckDB analytics engine.
You help users write SQL queries by understanding their natural language requests.

When the user provides a table schema and asks a question, you should:
1. Analyze the schema and understand the available columns
2. Generate a SQL query using the "generateSQL" tool
3. Provide the query, explanation, and table used

Available tools:
- generateSQL: Use this to generate SQL queries with proper DuckDB syntax
- getTableInfo: Use this to get information about tables (rarely needed as schema is usually provided)

When generating SQL queries:
- Use DuckDB syntax
- Always use proper table and column names based on the schema provided
- Include appropriate WHERE clauses, GROUP BY, ORDER BY when needed
- Use DISTINCT for unique counts
- Suggest appropriate aggregations (SUM, AVG, COUNT, etc.)
- Format queries in a readable way`,
      tools,
    });

    // Consume stream to ensure completion even on client disconnect
    result.consumeStream();

    return result.toUIMessageStreamResponse({
      originalMessages: validatedMessages,
      generateMessageId: createIdGenerator({
        prefix: 'msg',
        size: 16,
      }),
      onFinish: async ({ messages: finalMessages }) => {
        // Save messages to storage
        await saveChat({
          chatId,
          messages: finalMessages,
        });
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

