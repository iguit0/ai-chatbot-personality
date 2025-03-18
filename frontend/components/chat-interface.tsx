"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { usePersonality } from "./personality-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, RefreshCw, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { ChatbotDevButton } from "./chatbot-dev-button";

// Define message type
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  personality: string;
  created_at: string;
  messages: Message[];
}

interface ChatInterfaceProps {
  conversationId: string | null;
  onConversationUpdate: () => void;
}

export function ChatInterface({
  conversationId,
  onConversationUpdate,
}: ChatInterfaceProps) {
  const router = useRouter();
  const { selectedPersonality } = usePersonality();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations`
      );
      if (!response.ok) throw new Error("Failed to load conversations");
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    }
  };

  // Load messages when conversation ID changes
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadMessages = async (id: string) => {
    try {
      const response = await fetch(`/api/chat?id=${id}`);
      if (!response.ok) throw new Error("Failed to load messages");
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPersonality || !input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          personality: selectedPersonality.id.toLowerCase(),
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onConversationUpdate();
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "I'm sorry, I couldn't process your request. Please try again.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateResponse = async () => {
    if (!selectedPersonality || isLoading || messages.length < 1) return;

    let newMessages = [...messages];
    if (newMessages[newMessages.length - 1].role === "assistant") {
      newMessages = newMessages.slice(0, -1);
    }

    setIsLoading(true);

    try {
      const lastUserMessage = newMessages[newMessages.length - 1];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: lastUserMessage.content,
          personality: selectedPersonality.id.toLowerCase(),
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
      };

      setMessages([...newMessages, assistantMessage]);
      onConversationUpdate();
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "I'm sorry, I couldn't process your request. Please try again.",
      };

      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    router.push("/");
  };

  const handleConversationSelect = (conv: Conversation) => {
    router.push(`/conversation/${conv.id}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <CardTitle>Chat</CardTitle>
          <div className="flex flex-col md:flex-row gap-2">
            {selectedPersonality && (
              <ChatbotDevButton
                personalityId={selectedPersonality.id}
                onNewConversation={(id: string) =>
                  router.push(`/conversation/${id}`)
                }
              />
            )}
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              New Chat
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  History
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chat History</DialogTitle>
                  <DialogDescription>
                    Select a conversation to continue
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <Button
                        key={conv.id}
                        variant={
                          conv.id === conversationId ? "secondary" : "ghost"
                        }
                        className="w-full justify-start"
                        onClick={() => handleConversationSelect(conv)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {conv.personality}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(conv.created_at).toLocaleString()}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <CardDescription>
          {selectedPersonality ? (
            <div className="space-y-1">
              <p>
                {selectedPersonality.name} • {selectedPersonality.description}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Tone: {selectedPersonality.tone}/10</span>
                <span>•</span>
                <span>Verbosity: {selectedPersonality.verbosity}/10</span>
                <span>•</span>
                <span>Creativity: {selectedPersonality.creativity}/10</span>
                <span>•</span>
                <span>Formality: {selectedPersonality.formality}/10</span>
              </div>
            </div>
          ) : (
            "Select a personality to start chatting"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[calc(100vh-24rem)] pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Start a conversation</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  {selectedPersonality
                    ? `Chat with the "${selectedPersonality.name}" personality`
                    : "Select a personality first to begin chatting"}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-3",
                    message.role === "user" ? "bg-muted/50" : "bg-background"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    {message.role === "user" ? (
                      <>
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="prose prose-sm dark:prose-invert">
                      <p className="leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder={
              selectedPersonality
                ? "Type your message..."
                : "Select a personality first..."
            }
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={handleInputChange}
            disabled={!selectedPersonality || isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!selectedPersonality || isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
          {messages.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={regenerateResponse}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Regenerate</span>
            </Button>
          )}
        </form>
      </CardFooter>
    </Card>
  );
}
