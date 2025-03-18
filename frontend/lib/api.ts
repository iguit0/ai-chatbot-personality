// ... existing code ...

export interface ChatResponse {
  response: string;
  conversation_id: string;
}

export interface ChatbotPrompt {
  id: string;
  prompt: string;
  category: string;
}

export interface ChatbotPromptsResponse {
  prompts: ChatbotPrompt[];
}

export async function getChatbotPrompts(): Promise<ChatbotPromptsResponse> {
  const response = await fetch("/api/prompts/chatbot-development");
  if (!response.ok) {
    throw new Error("Failed to fetch chatbot prompts");
  }
  return response.json();
}

export async function chatWithRandomPrompt(
  personalityId: string
): Promise<ChatResponse> {
  const response = await fetch(`/api/chat/random-prompt/${personalityId}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to start random prompt chat");
  }
  return response.json();
}

// ... rest of the existing code ...
