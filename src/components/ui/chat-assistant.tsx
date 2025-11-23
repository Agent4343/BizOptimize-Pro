"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatAssistantProps {
  businessType: "construction" | "trucking" | "restaurant";
  contextData?: any;
}

export function ChatAssistant({ businessType, contextData }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your AI business optimization assistant. I can help you with questions about ${businessType} optimization, cost savings, best practices, and more. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          businessType: businessType,
          optimizationType: 'chat',
          context: contextData,
          isQuestion: true
        })
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.success ? data.result : "I'm sorry, I couldn't process your question. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = {
    construction: [
      "How can I reduce material costs?",
      "What are the best practices for project estimation?",
      "How do I optimize labor costs?",
      "What building code compliance tips can you share?"
    ],
    trucking: [
      "How can I reduce fuel costs?",
      "What's the best way to optimize routes?",
      "How do I reduce empty miles?",
      "What maintenance practices save money?"
    ],
    restaurant: [
      "How can I reduce food waste?",
      "What's the ideal food cost percentage?",
      "How do I optimize inventory management?",
      "What menu items are most profitable?"
    ]
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:scale-110 transition-transform"
        >
          <span className="text-2xl">💬</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="border-2 shadow-2xl h-[600px] flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>🤖</span>
              AI Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-green-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === "user" ? "text-white/70" : "text-gray-500"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-75">●</span>
                    <span className="animate-bounce delay-150">●</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 border-t">
              <div className="text-xs text-gray-500 mb-2 mt-2">Suggested questions:</div>
              <div className="space-y-2">
                {suggestedQuestions[businessType].slice(0, 2).map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(question);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="text-xs text-left w-full p-2 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask me anything about optimization..."
                className="flex-1"
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {loading ? "..." : "→"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

