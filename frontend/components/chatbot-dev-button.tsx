import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { chatWithRandomPrompt } from "@/lib/api";

interface ChatbotDevButtonProps {
  personalityId: string;
  onNewConversation: (conversationId: string) => void;
}

export function ChatbotDevButton({
  personalityId,
  onNewConversation,
}: ChatbotDevButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const response = await chatWithRandomPrompt(personalityId);
      onNewConversation(response.conversation_id);
    } catch (error) {
      console.error("Failed to start chatbot development chat:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        "Random Dev Question"
      )}
    </Button>
  );
}
