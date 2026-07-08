import { Link } from "react-router-dom";
import "./faq-preview.css";

const faqs = [
  {
    question: "What should I bring?",
    answer:
      "Bring your ticket, ID, comfortable clothes, cash/card, sunscreen, and a charged phone.",
  },
  {
    question: "Can I buy tickets at the entrance?",
    answer:
      "Yes, but online tickets are recommended because some events may sell out.",
  },
  {
    question: "Is there parking?",
    answer: "Yes, parking areas are available near the venue.",
  },
  {
    question: "What items are prohibited?",
    answer:
      "Outside alcohol, dangerous items, and illegal substances are not allowed.",
  },
];

function FAQPreviewSection() {
  return (
    <section className="faq-preview">
      <div className="faq-preview-container">
        <p className="faq-preview-label">FAQ</p>
        <h2 className="faq-preview-title">Questions Before You Go?</h2>
        <p className="faq-preview-description">
          Quick answers to the most common festival questions.
        </p>

        <div className="faq-preview-grid">
          {faqs.map((faq) => (
            <details className="faq-preview-card" key={faq.question}>
              <summary>
                <span>{faq.question}</span>
                <span className="faq-preview-arrow">›</span>
              </summary>

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