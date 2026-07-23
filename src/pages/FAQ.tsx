import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { faqService } from "../services/faq.service";
import type { Faq } from "../types/faq";

import "./style/faq.css";

function FAQ() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data =
          await faqService.getPublished();

        setFaqs(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load FAQs.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadFaqs();
  }, []);

  const filteredFaqs = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return faqs;
    }

    return faqs.filter((faq) => {
      return (
        faq.question
          .toLowerCase()
          .includes(normalizedSearch) ||
        faq.answer
          .toLowerCase()
          .includes(normalizedSearch) ||
        faq.category
          ?.toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [faqs, search]);

  return (
    <section className="faq-page">
      <div className="faq-container">
        <p className="faq-label">FAQ</p>

        <h1 className="faq-title">
          Frequently Asked Questions
        </h1>

        <p className="faq-description">
          Find quick answers about tickets, venue,
          parking, rules, and the Waterfall Festival
          experience.
        </p>

        <input
          className="faq-search"
          type="search"
          placeholder="Search questions..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          aria-label="Search frequently asked questions"
        />

        <div className="faq-list">
          {isLoading && (
            <div className="faq-message">
              Loading questions...
            </div>
          )}

          {!isLoading && error && (
            <div className="faq-message faq-message--error">
              {error}
            </div>
          )}

          {!isLoading &&
            !error &&
            filteredFaqs.length === 0 && (
              <div className="faq-message">
                No questions found.
              </div>
            )}

          {!isLoading &&
            !error &&
            filteredFaqs.map((faq) => (
              <details
                className="faq-item"
                key={faq.id}
              >
                <summary>{faq.question}</summary>

                <p>{faq.answer}</p>
              </details>
            ))}
        </div>

        <div className="faq-question-box">
          <h2>Still have a question?</h2>

          <p>
            Send your question and the team will help
            you.
          </p>

          <form>
            <input
              type="text"
              placeholder="Your name"
            />

            <input
              type="email"
              placeholder="Your email"
            />

            <textarea placeholder="Your question" />

            <button type="button">
              Send Question
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default FAQ;