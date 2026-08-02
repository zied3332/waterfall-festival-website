export type AssistantIntent =
  | "EVENTS"
  | "TICKETS"
  | "VENUE"
  | "FAQ"
  | "CONTACT"
  | "EXPERIENCE"
  | "GENERAL"
  | "UNKNOWN";

export type AssistantHandler =
  | "RULE_BASED"
  | "HUMAN_FALLBACK";

export type AssistantSourceType =
  | "EVENT"
  | "TICKET"
  | "FAQ"
  | "SETTINGS"
  | "EXPERIENCE";

export type AssistantSource = {
  type: AssistantSourceType;
  id?: number;
  label: string;
  url?: string;
};

export type AssistantChatRequest = {
  message: string;
  conversationId?: string;
};

export type AssistantResponse = {
  answer: string;

  handledBy: AssistantHandler;

  intent: AssistantIntent;

  confidence: number;

  requiresHumanFollowUp: boolean;

  /**
   * Must be sent back with every future request
   * so the assistant remembers the conversation.
   */
  conversationId: string;

  suggestions: string[];

  sources: AssistantSource[];
};

export type AssistantMessageRole =
  | "USER"
  | "ASSISTANT";

export type AssistantChatMessage = {
  id: string;
  role: AssistantMessageRole;
  content: string;
  createdAt: string;
  suggestions?: string[];
};

export type AssistantConversation = {
  conversationId: string;
  messages: AssistantChatMessage[];
};

export function isAssistantResponse(
  value: unknown,
): value is AssistantResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  return (
    "answer" in value &&
    "conversationId" in value &&
    "handledBy" in value &&
    "intent" in value &&
    "confidence" in value &&
    "suggestions" in value &&
    "sources" in value
  );
}