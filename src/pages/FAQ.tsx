import { useState } from "react";
import "./style/faq.css";

const faqs = [
  {
    question: "What should I bring?",
    answer:
      "Bring your ticket, ID, comfortable clothes, cash/card, and a charged phone.",
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
    question: "Is re-entry allowed?",
    answer: "Re-entry depends on the event policy and wristband rules.",
  },
  {
    question: "What if it rains?",
    answer:
      "The festival usually continues, but safety instructions will be shared if needed.",
  },
  {
    question: "Can I bring my own drinks?",
    answer: "Outside drinks are not allowed inside the venue.",
  },
];

function FAQ() {
  const [search, setSearch] = useState("");

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="faq-page">
      <div className="faq-container">
        <p className="faq-label">FAQ</p>

        <h1 className="faq-title">Frequently Asked Questions</h1>

        <p className="faq-description">
          Find quick answers about tickets, venue, parking, rules, and the
          Waterfall Festival experience.
        </p>

        <input
          className="faq-search"
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="faq-list">
          {filteredFaqs.map((faq) => (
            <details className="faq-item" key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="faq-question-box">
          <h2>Still have a question?</h2>
          <p>Send your question and the team will help you.</p>

          <form>
            <input placeholder="Your name" />
            <input placeholder="Your email" />
            <textarea placeholder="Your question" />
            <button type="button">Send Question</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default FAQ;