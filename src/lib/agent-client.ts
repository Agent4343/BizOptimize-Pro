export type AgentChatRole = "user" | "assistant";

export type AgentHistoryEntry = {
  role: AgentChatRole;
  content: string;
};

export interface AgentAssistantRequest {
  message: string;
  history: AgentHistoryEntry[];
  context?: Record<string, unknown>;
}

export interface AgentAssistantResponse {
  success: boolean;
  mode: "assistant";
  reply: string;
  fields?: Record<string, string | number>;
  suggestions?: string[];
}

export async function sendAgentMessage(
  payload: AgentAssistantRequest,
): Promise<AgentAssistantResponse> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "assistant",
      message: payload.message,
      history: payload.history,
      context: payload.context,
    }),
  });

  if (!response.ok) {
    throw new Error("Assistant is unavailable right now. Please try again.");
  }

  const data = (await response.json()) as AgentAssistantResponse & { error?: string };
  if (!data.success) {
    throw new Error(data.error || "Assistant could not process your request.");
  }

  return data;
}
