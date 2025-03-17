"use client";

import { ChatInterface } from "./chat-interface";

interface ChatWrapperProps {
  conversationId: string | null;
}

export function ChatWrapper({ conversationId }: ChatWrapperProps) {
  return (
    <ChatInterface
      conversationId={conversationId}
      onConversationUpdate={() => {}}
    />
  );
}
