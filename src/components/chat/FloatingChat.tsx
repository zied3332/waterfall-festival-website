import { useState } from "react";

import {
  MessageCircle,
  Send,
  X,
} from "lucide-react";

import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";

import "./floating-chat.css";

function FloatingChat() {
  const [open, setOpen] =
    useState(false);

  const { settings } =
    useWebsiteSettings();

  if (
    settings &&
    !settings.assistantEnabled
  ) {
    return null;
  }

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

  function toggleChat(): void {
    setOpen((current) => !current);
  }

  function closeChat(): void {
    setOpen(false);
  }

  return (
    <>
      <div
        className={`chat-window ${
          open ? "open" : ""
        }`}
        aria-hidden={!open}
      >
        <div className="chat-header">
          <div>
            <h3>{assistantName}</h3>
            <p>Online now</p>
          </div>

          <button
            type="button"
            onClick={closeChat}
            aria-label="Close assistant"
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="chat-body">
          <div className="bot-message">
            👋 {welcomeMessage}
          </div>

          <div className="bot-message">
            Ask me about tickets, events,
            parking, schedules, or the venue.
          </div>
        </div>

        <div className="chat-footer">
          <input
            type="text"
            placeholder={placeholder}
            aria-label={`Message ${assistantName}`}
          />

          <button
            type="button"
            aria-label="Send message"
          >
            <Send
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

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