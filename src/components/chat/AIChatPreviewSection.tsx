import { Link } from "react-router-dom";

import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";

import "./ai-chat-preview.css";

const questions = [
  "How do I get to the venue?",
  "Which ticket should I buy?",
  "What should I bring?",
  "Is there parking?",
];

function AIChatPreviewSection() {
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
    "Guardian Assistant";

  const welcomeMessage =
    settings?.assistantWelcomeMessage?.trim() ||
    `Hi! I can help you plan your ${festivalName} experience.`;

  return (
    <section className="ai-preview">
      <div className="ai-preview__container">
        <div className="ai-preview__content">
          <p className="ai-preview__label">
            AI Assistant
          </p>

          <h2 className="ai-preview__title">
            Need help planning your night?
          </h2>

          <p className="ai-preview__description">
            Ask the {festivalName} assistant
            about tickets, venue, travel,
            schedules, rules, and everything you
            need before arriving.
          </p>

          <div className="ai-preview__questions">
            {questions.map((question) => (
              <span key={question}>
                {question}
              </span>
            ))}
          </div>

          <Link
            to="/chat"
            className="ai-preview__button"
          >
            Chat with {assistantName}
          </Link>
        </div>

        <div className="ai-preview__mockup">
          <div className="ai-preview__chat-header">
            <div
              className="ai-preview__avatar"
              aria-hidden="true"
            >
              🌊
            </div>

            <div>
              <h3>{assistantName}</h3>
              <p>Online now</p>
            </div>
          </div>

          <div className="ai-preview__bubble ai-preview__bubble--bot">
            {welcomeMessage}
          </div>

          <div className="ai-preview__bubble ai-preview__bubble--user">
            What ticket should I buy?
          </div>

          <div className="ai-preview__bubble ai-preview__bubble--bot">
            If it is your first time, General
            Admission is a great start. VIP is
            better if you want priority access
            and premium areas.
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIChatPreviewSection;