import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";

import { sendAssistantMessage } from "../../services/assistant.service";

import type {
  AssistantChatMessage,
  AssistantSource,
  AssistantSourceType,
} from "../../types/assistant";

import "./floating-chat.css";

const MAX_VISIBLE_SOURCES = 3;

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

function formatMessageTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

function isExternalUrl(
  url: string,
): boolean {
  return /^https?:\/\//i.test(url);
}

function getSourcePriority(
  source: AssistantSource,
): number {
  switch (source.type) {
    case "EVENT":
      return 1;

    case "TICKET":
      return 2;

    case "FAQ":
      return 3;

    case "EXPERIENCE":
      return 4;

    case "SETTINGS":
      return 5;

    default:
      return 10;
  }
}

function getSourceActionLabel(
  source: AssistantSource,
): string {
  switch (source.type) {
    case "EVENT":
      return "View event";

    case "TICKET":
      return source.url &&
        isExternalUrl(source.url)
        ? "Buy ticket"
        : "View tickets";

    case "FAQ":
      return "Read FAQ";

    case "EXPERIENCE":
      return "Explore experience";

    case "SETTINGS":
      if (
        source.url?.includes("maps") ||
        source.url?.includes("google")
      ) {
        return "Open map";
      }

      if (source.url === "/contact") {
        return "Contact festival";
      }

      if (source.url === "/venue") {
        return "Venue information";
      }

      return "Festival information";

    default:
      return "Open link";
  }
}

function getSourceIcon(
  sourceType: AssistantSourceType,
): LucideIcon {
  switch (sourceType) {
    case "EVENT":
      return CalendarDays;

    case "TICKET":
      return Ticket;

    case "FAQ":
      return CircleHelp;

    case "SETTINGS":
      return MapPin;

    case "EXPERIENCE":
      return Sparkles;

    default:
      return ExternalLink;
  }
}

function getSourceKey(
  source: AssistantSource,
): string {
  return [
    source.type,
    source.id ?? "",
    source.url ?? "",
    source.label,
  ].join("-");
}

function prepareSources(
  sources: AssistantSource[] | undefined,
): AssistantSource[] {
  if (!sources?.length) {
    return [];
  }

  const uniqueSources =
    new Map<string, AssistantSource>();

  for (const source of sources) {
    if (!source.url) {
      continue;
    }

    if (
      source.type === "SETTINGS" &&
      source.url === "/"
    ) {
      continue;
    }

    const key = [
      source.type,
      source.id ?? "",
      source.url,
    ].join(":");

    if (!uniqueSources.has(key)) {
      uniqueSources.set(key, source);
    }
  }

  return [...uniqueSources.values()]
    .sort(
      (firstSource, secondSource) =>
        getSourcePriority(firstSource) -
        getSourcePriority(secondSource),
    )
    .slice(0, MAX_VISIBLE_SOURCES);
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

  const latestAssistantMessageId =
    useMemo(() => {
      return [...messages]
        .reverse()
        .find(
          (message) =>
            message.role === "ASSISTANT",
        )?.id;
    }, [messages]);

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

  async function sendMessage(
    rawMessage: string,
  ): Promise<void> {
    const message = rawMessage.trim();

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
        suggestions:
          response.suggestions,
        sources:
          response.sources,
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    await sendMessage(inputValue);
  }

  async function handleSuggestionClick(
    suggestion: string,
  ): Promise<void> {
    await sendMessage(suggestion);
  }

  function renderSourceLink(
    source: AssistantSource,
  ) {
    const SourceIcon =
      getSourceIcon(source.type);

    const content = (
      <>
        <span className="assistant-resource__icon">
          <SourceIcon
            size={17}
            aria-hidden="true"
          />
        </span>

        <span className="assistant-resource__copy">
          <strong>
            {getSourceActionLabel(source)}
          </strong>

          <small>{source.label}</small>
        </span>

        {source.url &&
        isExternalUrl(source.url) ? (
          <ExternalLink
            className="assistant-resource__arrow"
            size={15}
            aria-hidden="true"
          />
        ) : (
          <ChevronRight
            className="assistant-resource__arrow"
            size={16}
            aria-hidden="true"
          />
        )}
      </>
    );

    if (!source.url) {
      return (
        <div
          key={getSourceKey(source)}
          className="assistant-resource assistant-resource--static"
        >
          {content}
        </div>
      );
    }

    if (isExternalUrl(source.url)) {
      return (
        <a
          key={getSourceKey(source)}
          href={source.url}
          className="assistant-resource"
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        key={getSourceKey(source)}
        to={source.url}
        className="assistant-resource"
        onClick={closeChat}
      >
        {content}
      </Link>
    );
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
          <div className="chat-header__identity">
            <span
              className="chat-header__avatar"
              aria-hidden="true"
            >
              <Sparkles size={19} />
            </span>

            <div>
              <h3>{assistantName}</h3>

              <p aria-live="polite">
                <span
                  className={`chat-header__status-dot ${
                    isSending
                      ? "chat-header__status-dot--thinking"
                      : ""
                  }`}
                />

                {isSending
                  ? "Thinking..."
                  : "Online now"}
              </p>
            </div>
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
          <article className="assistant-message">
            <span
              className="assistant-message__avatar"
              aria-hidden="true"
            >
              <Sparkles size={16} />
            </span>

            <div className="assistant-message__card">
              <p className="assistant-message__answer">
                👋 {welcomeMessage}
              </p>

              <p className="assistant-message__answer assistant-message__answer--secondary">
                Ask me about tickets, events,
                parking, schedules, or the venue.
              </p>
            </div>
          </article>

          {messages.map((message) => {
            const preparedSources =
              message.role === "ASSISTANT"
                ? prepareSources(
                    message.sources,
                  )
                : [];

            const messageTime =
              formatMessageTime(
                message.createdAt,
              );

            if (message.role === "USER") {
              return (
                <div
                  key={message.id}
                  className="user-message-group"
                >
                  <div className="user-message">
                    {message.content}
                  </div>

                  {messageTime && (
                    <span className="chat-message-time chat-message-time--user">
                      {messageTime}
                    </span>
                  )}
                </div>
              );
            }

            const shouldShowSuggestions =
              message.id ===
                latestAssistantMessageId &&
              message.suggestions &&
              message.suggestions.length > 0;

            return (
              <article
                key={message.id}
                className="assistant-message"
              >
                <span
                  className="assistant-message__avatar"
                  aria-hidden="true"
                >
                  <Sparkles size={16} />
                </span>

                <div className="assistant-message__card">
                  <p className="assistant-message__answer">
                    {message.content}
                  </p>

                  {preparedSources.length >
                    0 && (
                    <div className="assistant-message__section">
                      <span className="assistant-message__section-label">
                        <ExternalLink
                          size={13}
                          aria-hidden="true"
                        />
                        Helpful links
                      </span>

                      <div className="assistant-message__resources">
                        {preparedSources.map(
                          renderSourceLink,
                        )}
                      </div>
                    </div>
                  )}

                  {shouldShowSuggestions && (
                    <div className="assistant-message__section">
                      <span className="assistant-message__section-label">
                        <CircleHelp
                          size={14}
                          aria-hidden="true"
                        />
                        You can also ask
                      </span>

                      <div
                        className="chat-suggestions"
                        aria-label="Suggested questions"
                      >
                        {message.suggestions?.map(
                          (suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              className="chat-suggestion"
                              disabled={isSending}
                              onClick={() =>
                                void handleSuggestionClick(
                                  suggestion,
                                )
                              }
                            >
                              {suggestion}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {messageTime && (
                    <span className="chat-message-time">
                      {messageTime}
                    </span>
                  )}
                </div>
              </article>
            );
          })}

          {isSending && (
            <article
              className="assistant-message"
              role="status"
            >
              <span
                className="assistant-message__avatar"
                aria-hidden="true"
              >
                <Sparkles size={16} />
              </span>

              <div className="assistant-message__card assistant-message__card--loading">
                <span>
                  Let me check that for you
                </span>

                <span
                  className="chat-typing-dots"
                  aria-hidden="true"
                >
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </article>
          )}

          {errorMessage && (
            <div
              className="chat-error-message"
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
            size={27}
            aria-hidden="true"
          />
        ) : (
          <MessageCircle
            size={26}
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}

export default FloatingChat;