import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import "./faq-preview.css";

const faqs = [
  {
    question: "What should I bring?",
    answer:
      "Bring your ticket, a valid ID, comfortable clothes, cash or a payment card, sunscreen, and a fully charged phone.",
  },
  {
    question: "Can I buy tickets at the entrance?",
    answer:
      "Tickets may be available at the entrance, but booking online is strongly recommended because popular events can sell out.",
  },
  {
    question: "Is parking available?",
    answer:
      "Yes. Designated parking areas are available near the venue, but arriving early is recommended during busy festival nights.",
  },
  {
    question: "What items are prohibited?",
    answer:
      "Outside alcohol, dangerous objects, illegal substances, and anything that may affect the safety of other guests are prohibited.",
  },
];

function FAQPreviewSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((currentIndex) =>
      currentIndex === index ? null : index,
    );
  };

  return (
    <section className="faq-preview">
      <div className="faq-preview__background" aria-hidden="true">
        <div className="faq-preview__grid-pattern" />
        <div className="faq-preview__glow faq-preview__glow--one" />
        <div className="faq-preview__glow faq-preview__glow--two" />
      </div>

      <div className="faq-preview__container">
        <div className="faq-preview__header">
          <div className="faq-preview__header-content">
            <div className="faq-preview__eyebrow">
              <Sparkles size={15} />
              <span>Festival Information</span>
            </div>

            <h2 className="faq-preview__title">
              Questions before
              <span> the adventure?</span>
            </h2>

            <p className="faq-preview__description">
              Find quick answers about tickets, entry, transport, safety, and
              everything you need before arriving at Waterfall Festival.
            </p>
          </div>

          <div className="faq-preview__support-card">
            <span className="faq-preview__support-icon">
              <ShieldCheck size={24} />
            </span>

            <div>
              <span>Plan with confidence</span>

              <strong>Everything you need before festival night.</strong>
            </div>
          </div>
        </div>

        <div className="faq-preview__content">
          <div className="faq-preview__intro">
            <span className="faq-preview__intro-icon">
              <CircleHelp size={25} />
            </span>

            <span className="faq-preview__intro-label">
              Frequently asked questions
            </span>

            <h3>Prepare for an unforgettable night.</h3>

            <p>
              We have collected the questions guests ask most often so you can
              arrive prepared and focus on enjoying the festival.
            </p>

            <Link className="faq-preview__intro-link" to="/faq">
              Explore all questions
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="faq-preview__accordion">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <article
                  className={`faq-preview__item ${
                    isOpen ? "faq-preview__item--open" : ""
                  }`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    className="faq-preview__question"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="faq-preview__question-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="faq-preview__question-text">
                      {faq.question}
                    </span>

                    <span className="faq-preview__question-icon">
                      <ChevronDown size={20} />
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    className="faq-preview__answer-wrapper"
                  >
                    <div className="faq-preview__answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="faq-preview__footer">
          <div>
            <span>Still have questions?</span>

            <p>
              Visit the complete FAQ page for more information about the venue,
              tickets, transport, and festival policies.
            </p>
          </div>

          <Link className="faq-preview__button" to="/faq">
            View All Questions
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FAQPreviewSection;