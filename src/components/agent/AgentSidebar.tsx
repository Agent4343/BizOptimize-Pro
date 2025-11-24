import { useState } from "react";
import { cn } from "@/lib/utils";

type AgentChatRole = "user" | "assistant";

export type AgentChatMessage = {
  id: string;
  role: AgentChatRole;
  content: string;
  fields?: Record<string, string | number>;
};

interface AgentSidebarProps {
  messages: AgentChatMessage[];
  suggestions: string[];
  loading: boolean;
  onSend: (message: string) => Promise<void> | void;
  onApplyFields: (fields: Record<string, string | number>) => void;
  title?: string;
}

export function AgentSidebar({
  messages,
  suggestions,
  loading,
  onSend,
  onApplyFields,
  title = "BizOptimize Agent",
}: AgentSidebarProps) {
  const [input, setInput] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || loading) {
      return;
    }
    const current = input.trim();
    setInput("");
    await onSend(current);
  };

  const handleSuggestion = async (suggestion: string) => {
    setInput("");
    await onSend(suggestion);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-4">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">Ask about labour codes, wire sizing, or ROI.</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <AgentBubble key={message.id} message={message} onApplyFields={onApplyFields} />
        ))}
        {!messages.length && (
          <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
            Start a conversation to get tailored guidance for this estimate.
          </div>
        )}
      </div>
      <div className="border-t p-4">
        {suggestions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-blue-200 hover:text-blue-600"
                onClick={() => handleSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask me anything about this build..."
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-300"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={cn(
              "w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700",
              (loading || !input.trim()) && "cursor-not-allowed opacity-60",
            )}
          >
            {loading ? "Thinking..." : "Ask BizOptimize AI"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AgentBubble({
  message,
  onApplyFields,
}: {
  message: AgentChatMessage;
  onApplyFields: (fields: Record<string, string | number>) => void;
}) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "rounded-2xl px-3 py-2 text-sm shadow-sm",
        isAssistant ? "bg-blue-50 text-blue-900" : "bg-gray-100 text-gray-900",
      )}
    >
      <p className="whitespace-pre-wrap">{message.content}</p>
      {isAssistant && message.fields && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-blue-700">
          <span>Suggested updates detected.</span>
          <button
            type="button"
            onClick={() => onApplyFields(message.fields as Record<string, string | number>)}
            className="rounded-full border border-blue-300 px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            Apply to form
          </button>
        </div>
      )}
    </div>
  );
}
