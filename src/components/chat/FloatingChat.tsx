import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MessageCircle,
  Send,
  X,
} from "lucide-react";

import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";

import { sendAssistantMessage } from "../../services/assistant.service";

import type {
  AssistantChatMessage,
} from "../../types/assistant";

import "./floating-chat.css";

function createMessageId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function FloatingChat() {
  const [open, setOpen] =
    useState(false);

  const [inputValue, setInputValue] =
    useState("");

  const [messages, setMessages] =
    useState<AssistantChatMessage[]>([]);

  const [conversationId, setConversationId] =
    useState<string | undefined>(
      undefined,
    );

  const [isSending, setIsSending] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const inputRef =
    useRef<HTMLInputElement>(null);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const { settings } =
    useWebsiteSettings();

  const festivalName =
    settings?.festivalName?.trim() ||
    "Waterfall Festival";

  const assistantName =
    settings?.assistantName?.trim() ||
    "Festival Assistant";

  const welcomeMessage =
    settings?.assistantWelcomeMessage?.trim() ||
    `Hi! I am your ${festivalName} assistant.`;

  const placeholder =
    settings?.assistantPlaceholder?.trim() ||
    "Ask something...";

  const offlineMessage =
    settings?.assistantOfflineMessage?.trim() ||
    "The assistant is unavailable right now. Please try again later.";

  useEffect(() => {
    if (!open) {
      return;
    }

    const animationFrame =
      window.requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [
    open,
    messages,
    isSending,
    errorMessage,
  ]);

  useEffect(() => {
    if (!open || isSending) {
      return;
    }

    const animationFrame =
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [open, isSending]);

  if (
    settings &&
    !settings.assistantEnabled
  ) {
    return null;
  }

  function toggleChat(): void {
    setOpen((current) => !current);
  }

  function closeChat(): void {
    setOpen(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const message = inputValue.trim();

    if (
      message.length < 2 ||
      isSending
    ) {
      return;
    }

    const userMessage: AssistantChatMessage = {
      id: createMessageId(),
      role: "USER",
      content: message,
      createdAt: new Date().toISOString(),
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setInputValue("");
    setErrorMessage("");
    setIsSending(true);

    try {
      const response =
        await sendAssistantMessage({
          message,
          ...(conversationId && {
            conversationId,
          }),
        });

      setConversationId(
        response.conversationId,
      );

      const assistantMessage:
        AssistantChatMessage = {
        id: createMessageId(),
        role: "ASSISTANT",
        content: response.answer,
        createdAt:
          new Date().toISOString(),
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (error: unknown) {
      console.error(
        "Unable to send assistant message:",
        error,
      );

      const resolvedErrorMessage =
        error instanceof Error &&
        error.message.trim()
          ? error.message
          : offlineMessage;

      setErrorMessage(
        resolvedErrorMessage,
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <section
        className={`chat-window ${
          open ? "open" : ""
        }`}
        role="dialog"
        aria-label={`${assistantName} chat`}
        aria-hidden={!open}
      >
        <header className="chat-header">
          <div>
            <h3>{assistantName}</h3>

            <p aria-live="polite">
              {isSending
                ? "Thinking..."
                : "Online now"}
            </p>
          </div>

          <button
            type="button"
            onClick={closeChat}
            aria-label="Close assistant"
            tabIndex={open ? 0 : -1}
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </header>

        <div
          className="chat-body"
          aria-live="polite"
          aria-relevant="additions text"
        >
          <div className="bot-message">
            👋 {welcomeMessage}
          </div>

          <div className="bot-message">
            Ask me about tickets, events,
            parking, schedules, or the venue.
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "USER"
                  ? "user-message"
                  : "bot-message"
              }
            >
              {message.content}
            </div>
          ))}

          {isSending && (
            <div
              className="bot-message chat-loading-message"
              role="status"
            >
              {assistantName} is preparing an
              answer...
            </div>
          )}

          {errorMessage && (
            <div
              className="bot-message chat-error-message"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div
            ref={messagesEndRef}
            className="chat-messages-end"
            aria-hidden="true"
          />
        </div>

        <form
          className="chat-footer"
          onSubmit={(event) =>
            void handleSubmit(event)
          }
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder={placeholder}
            aria-label={`Message ${assistantName}`}
            autoComplete="off"
            maxLength={1000}
            disabled={!open || isSending}
            tabIndex={open ? 0 : -1}
            onChange={(event) => {
              setInputValue(
                event.target.value,
              );

              if (errorMessage) {
                setErrorMessage("");
              }
            }}
          />

          <button
            type="submit"
            aria-label="Send message"
            tabIndex={open ? 0 : -1}
            disabled={
              !open ||
              isSending ||
              inputValue.trim().length < 2
            }
          >
            <Send
              size={18}
              aria-hidden="true"
            />
          </button>
        </form>
      </section>

      <button
        type="button"
        className="chat-button"
        onClick={toggleChat}
        aria-label={
          open
            ? `Close ${assistantName}`
            : `Open ${assistantName}`
        }
        aria-expanded={open}
      >
        {open ? (
          <X
            size={28}
            aria-hidden="true"
          />
        ) : (
          <MessageCircle
            size={28}
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}

export default FloatingChat;