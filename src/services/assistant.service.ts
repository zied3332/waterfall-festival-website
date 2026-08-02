import { api } from "./api.service";

import type {
  AssistantChatRequest,
  AssistantResponse,
} from "../types/assistant";

const ASSISTANT_CHAT_ENDPOINT =
  "/assistant/chat";

export function sendAssistantMessage(
  request: AssistantChatRequest,
): Promise<AssistantResponse> {
  return api.post<AssistantResponse>(
    ASSISTANT_CHAT_ENDPOINT,
    request,
  );
}