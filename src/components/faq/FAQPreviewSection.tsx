import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  
  RotateCcw,
} from "lucide-react";

import { faqService } from "../../services/faq.service";
import type { Faq } from "../../types/faq";

import "./faq-preview.css";

const FAQ_PREVIEW_LIMIT = 4;
const FAQ_SKELETON_COUNT = 4;

function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Could not load festival questions.";
}

function FAQPreviewSection() {
  const [faqs, setFaqs] =
    useState<Faq[]>([]);

  const [openFaqId, setOpenFaqId] =
    useState<number | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadFaqs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const publishedFaqs =
        await faqService.getPublished();

      const previewFaqs =
        publishedFaqs.slice(
          0,
          FAQ_PREVIEW_LIMIT,
        );

      setFaqs(previewFaqs);

      setOpenFaqId(
        previewFaqs[0]?.id ?? null,
      );
    } catch (loadError: unknown) {
      setFaqs([]);
      setOpenFaqId(null);
      setError(
        getErrorMessage(loadError),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFaqs();
  }, [loadFaqs]);

  function toggleFaq(faqId: number): void {
    setOpenFaqId((currentFaqId) =>
      currentFaqId === faqId
        ? null
        : faqId,
    );
  }

  return (
    <section
      className="faq-preview"
      aria-labelledby="faq-preview-title"
    >
      <div
        className="faq-preview__background"
        aria-hidden="true"
      >
        <div className="faq-preview__grid-pattern" />

        <div className="faq-preview__glow faq-preview__glow--purple" />

        <div className="faq-preview__glow faq-preview__glow--cyan" />
      </div>

      <div className="faq-preview__container">
        <header className="faq-preview__header">
          <div>
            <p className="faq-preview__eyebrow">
              Festival FAQ
            </p>

            <h2
              id="faq-preview-title"
              className="faq-preview__title"
            >
              Questions before
              <span> festival night?</span>
            </h2>
          </div>

          <span
            className="faq-preview__header-icon"
            aria-hidden="true"
          >
            <CircleHelp size={28} />
          </span>
        </header>

        {isLoading && (
          <div
            className="faq-preview__accordion"
            aria-label="Loading frequently asked questions"
          >
            {Array.from({
              length: FAQ_SKELETON_COUNT,
            }).map((_, index) => (
              <div
                className="faq-preview__skeleton"
                key={index}
                aria-hidden="true"
              >
                <span />

                <div>
                  <span />
                  <span />
                </div>

                <span />
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div
            className="faq-preview__state faq-preview__state--error"
            role="alert"
          >
            <span className="faq-preview__state-icon">
              <CircleHelp
                size={24}
                aria-hidden="true"
              />
            </span>

            <div>
              <h3>
                We couldn’t load the questions
              </h3>

              <p>{error}</p>
            </div>

            <button
              type="button"
              className="faq-preview__retry"
              onClick={() => {
                void loadFaqs();
              }}
            >
              <RotateCcw
                size={16}
                aria-hidden="true"
              />

              Try again
            </button>
          </div>
        )}

        {!isLoading &&
          !error &&
          faqs.length === 0 && (
            <div className="faq-preview__state">
              <span className="faq-preview__state-icon">
                <CircleHelp
                  size={24}
                  aria-hidden="true"
                />
              </span>

              <div>
                <h3>
                  No questions published yet
                </h3>

                <p>
                  Festival information will
                  appear here when it becomes
                  available.
                </p>
              </div>
            </div>
          )}

        {!isLoading &&
          !error &&
          faqs.length > 0 && (
            <div className="faq-preview__accordion">
              {faqs.map((faq, index) => {
                const isOpen =
                  openFaqId === faq.id;

                const answerId =
                  `faq-preview-answer-${faq.id}`;

                return (
                  <article
                    key={faq.id}
                    className={[
                      "faq-preview__item",
                      isOpen
                        ? "faq-preview__item--open"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <h3 className="faq-preview__question-heading">
                      <button
                        type="button"
                        className="faq-preview__question"
                        onClick={() => {
                          toggleFaq(faq.id);
                        }}
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                      >
                        <span className="faq-preview__question-number">
                          {String(
                            index + 1,
                          ).padStart(2, "0")}
                        </span>

                        <span className="faq-preview__question-text">
                          {faq.question}
                        </span>

                        <span
                          className="faq-preview__question-icon"
                          aria-hidden="true"
                        >
                          <ChevronDown
                            size={19}
                          />
                        </span>
                      </button>
                    </h3>

                    <div
                      id={answerId}
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
          )}

        <footer className="faq-preview__footer">
          <Link
            className="faq-preview__button"
            to="/faq"
          >
            View all questions

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>
        </footer>
      </div>
    </section>
  );
}

export default FAQPreviewSection;