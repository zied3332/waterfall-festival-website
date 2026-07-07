import { Link } from "react-router-dom";
import "./ai-chat-preview.css";

const questions = [
  "How do I get to the venue?",
  "Which ticket should I buy?",
  "What should I bring?",
  "Is there parking?",
];

function AIChatPreviewSection() {
  return (
    <section className="ai-preview">
      <div className="ai-preview__container">
        <div className="ai-preview__content">
          <p className="ai-preview__label">AI Assistant</p>

          <h2 className="ai-preview__title">
            Need help planning your night?
          </h2>

          <p className="ai-preview__description">
            Ask the Waterfall Festival assistant about tickets, venue, travel,
            schedules, rules, and everything you need before arriving.
          </p>

          <div className="ai-preview__questions">
            {questions.map((question) => (
              <span key={question}>{question}</span>
            ))}
          </div>

          <Link to="/chat" className="ai-preview__button">
            Chat with Assistant
          </Link>
        </div>

        <div className="ai-preview__mockup">
          <div className="ai-preview__chat-header">
            <div className="ai-preview__avatar">🌊</div>
            <div>
              <h3>Guardian Assistant</h3>
              <p>Online now</p>
            </div>
          </div>

          <div className="ai-preview__bubble ai-preview__bubble--bot">
            Hi! I can help you plan your Waterfall Festival experience.
          </div>

          <div className="ai-preview__bubble ai-preview__bubble--user">
            What ticket should I buy?
          </div>

          <div className="ai-preview__bubble ai-preview__bubble--bot">
            If it is your first time, General Admission is a great start. VIP is
            better if you want priority access and premium areas.
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIChatPreviewSection;