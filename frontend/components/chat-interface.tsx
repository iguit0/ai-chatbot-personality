"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { usePersonality } from "./personality-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, RefreshCw, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

// Define message type
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatInterface() {
  const { selectedPersonality } = usePersonality()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPersonality || !input.trim() || isLoading) return

    // Create a new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call your custom backend API here
      const response = await fetch("/api/your-custom-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          personality: selectedPersonality,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add assistant message to chat
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting response:", error)
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't process your request. Please try again.",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const regenerateResponse = async () => {
    if (!selectedPersonality || isLoading || messages.length < 1) return

    // Remove the last assistant message if it exists
    let newMessages = [...messages]
    if (newMessages[newMessages.length - 1].role === "assistant") {
      newMessages = newMessages.slice(0, -1)
    }

    setIsLoading(true)

    try {
      // Call your custom backend API here
      const response = await fetch("/api/your-custom-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          personality: selectedPersonality,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add assistant message to chat
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
      }

      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error("Error getting response:", error)
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't process your request. Please try again.",
      }

      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Chat with AI</CardTitle>
        <CardDescription>
          {selectedPersonality
            ? `Chatting with ${selectedPersonality.name} personality`
            : "Select a personality to start chatting"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[500px] pr-4" ref={scrollAreaRef}>
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
                    message.role === "user" ? "bg-muted/50" : "bg-background",
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
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder={selectedPersonality ? "Type your message..." : "Select a personality first..."}
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={handleInputChange}
            disabled={!selectedPersonality || isLoading}
          />
          <Button type="submit" size="icon" disabled={!selectedPersonality || isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
          {messages.length > 0 && (
            <Button type="button" variant="outline" size="icon" onClick={regenerateResponse} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Regenerate</span>
            </Button>
          )}
        </form>
      </CardFooter>
    </Card>
  )
}

