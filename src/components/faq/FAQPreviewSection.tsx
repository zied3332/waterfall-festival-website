import { Link } from "react-router-dom";
import "./faq-preview.css";

const faqs = [
  {
    question: "What should I bring?",
    answer: "Bring your ticket, ID, comfortable clothes, cash/card, and a charged phone.",
  },
  {
    question: "Can I buy tickets at the entrance?",
    answer: "Yes, but online tickets are recommended because some events may sell out.",
  },
  {
    question: "Is there parking?",
    answer: "Yes, parking areas are available near the venue.",
  },
  {
    question: "What items are prohibited?",
    answer: "Outside alcohol, dangerous items, and illegal substances are not allowed.",
  },
  {
    question: "Is re-entry allowed?",
    answer: "Re-entry depends on the event policy and wristband rules.",
  },
  {
    question: "What if it rains?",
    answer: "The festival usually continues, but safety instructions will be shared if needed.",
  },
];

function FAQPreviewSection() {
  return (
    <section className="faq-preview">
      <div className="faq-preview-container">
        <p className="faq-preview-label">FAQ</p>
        <h2 className="faq-preview-title">Questions Before You Go?</h2>
        <p className="faq-preview-description">
          Quick answers to the most common visitor questions.
        </p>

        <div className="faq-preview-list">
          {faqs.map((faq) => (
            <details className="faq-preview-item" key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>

        <Link className="faq-preview-link" to="/faq">
          View All Questions
        </Link>
      </div>
    </section>
  );
}

export default FAQPreviewSection;