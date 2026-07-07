import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import "./floating-chat.css";

function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat Window */}

      <div className={`chat-window ${open ? "open" : ""}`}>
        <div className="chat-header">
          <div>
            <h3>Festival Assistant</h3>
            <p>Online now</p>
          </div>

          <button onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="chat-body">
          <div className="bot-message">
            👋 Hi! I'm your Waterfall Festival assistant.
          </div>

          <div className="bot-message">
            Ask me about tickets, events, parking, schedules or the venue.
          </div>
        </div>

        <div className="chat-footer">
          <input
            type="text"
            placeholder="Ask something..."
          />

          <button>
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Floating Button */}

      <button
        className="chat-button"
        onClick={() => setOpen(!open)}
      >
        <MessageCircle size={28} />
      </button>
    </>
  );
}

export default FloatingChat;