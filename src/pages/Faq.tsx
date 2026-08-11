import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";

import { faqService } from "../services/faq.service";
import type { Faq } from "../types/faq";

import "./style/faq.css";

const ALL_CATEGORIES = "All";

function FAQ() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState(ALL_CATEGORIES);
  const [openFaqId, setOpenFaqId] = useState<
    string | number | null
  >(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const loadFaqs = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void loadFaqs();
  }, [loadFaqs]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();

    faqs.forEach((faq) => {
      const category = faq.category?.trim();

      if (category) {
        uniqueCategories.add(category);
      }
    });

    return [
      ALL_CATEGORIES,
      ...Array.from(uniqueCategories).sort(
        (firstCategory, secondCategory) =>
          firstCategory.localeCompare(
            secondCategory,
          ),
      ),
    ];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORIES ||
        faq.category
          ?.trim()
          .toLowerCase() ===
          selectedCategory.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        faq.question
          .toLowerCase()
          .includes(normalizedSearch) ||
        faq.answer
          .toLowerCase()
          .includes(normalizedSearch) ||
        faq.category
          ?.toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [faqs, search, selectedCategory]);

  function handleCategoryChange(
    category: string,
  ): void {
    setSelectedCategory(category);
    setOpenFaqId(null);
  }

  function handleFaqToggle(
    faqId: string | number,
  ): void {
    setOpenFaqId((currentFaqId) =>
      currentFaqId === faqId
        ? null
        : faqId,
    );
  }

  function handleClearSearch(): void {
    setSearch("");
  }

  return (
    <main className="faq-page">
      <section className="faq-hero">
        <div className="faq-hero-content">
          <p className="faq-label">
            FAQ
          </p>

          <h1 className="faq-title">
            Frequently Asked Questions
          </h1>

          <p className="faq-description">
            Find clear answers about tickets,
            venue access, transport, festival
            rules, and your Waterfall Festival
            experience.
          </p>
        </div>
      </section>

      <section className="faq-content">
        <div className="faq-container">
          <div className="faq-search-card">
            <Search
              className="faq-search-icon"
              size={20}
              aria-hidden="true"
            />

            <input
              className="faq-search"
              type="search"
              placeholder="Search questions..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOpenFaqId(null);
              }}
              aria-label="Search frequently asked questions"
            />

            {search && (
              <button
                className="faq-search-clear"
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear FAQ search"
              >
                <X
                  size={18}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          {!isLoading &&
            !error &&
            categories.length > 1 && (
              <div
                className="faq-categories"
                aria-label="FAQ categories"
              >
                {categories.map((category) => {
                  const isSelected =
                    selectedCategory ===
                    category;

                  return (
                    <button
                      className={`faq-category-button${
                        isSelected
                          ? " faq-category-button--active"
                          : ""
                      }`}
                      type="button"
                      key={category}
                      onClick={() =>
                        handleCategoryChange(
                          category,
                        )
                      }
                      aria-pressed={isSelected}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            )}

          {!isLoading && !error && (
            <div className="faq-results-summary">
              <CircleHelp
                size={17}
                aria-hidden="true"
              />

              <span>
                {filteredFaqs.length}{" "}
                {filteredFaqs.length === 1
                  ? "question"
                  : "questions"}{" "}
                found
              </span>
            </div>
          )}

          <div
            className="faq-list"
            aria-live="polite"
          >
            {isLoading && (
              <div className="faq-message">
                <span className="faq-loading-spinner" />

                <div>
                  <strong>
                    Loading questions
                  </strong>

                  <p>
                    Please wait while we load the
                    latest festival information.
                  </p>
                </div>
              </div>
            )}

            {!isLoading && error && (
              <div className="faq-message faq-message--error">
                <div>
                  <strong>
                    We could not load the FAQs
                  </strong>

                  <p>{error}</p>
                </div>

                <button
                  className="faq-retry-button"
                  type="button"
                  onClick={() =>
                    void loadFaqs()
                  }
                >
                  <RotateCcw
                    size={17}
                    aria-hidden="true"
                  />

                  Try Again
                </button>
              </div>
            )}

            {!isLoading &&
              !error &&
              filteredFaqs.length === 0 && (
                <div className="faq-message">
                  <CircleHelp
                    size={24}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      No matching questions
                    </strong>

                    <p>
                      Try another search term or
                      choose a different category.
                    </p>
                  </div>
                </div>
              )}

            {!isLoading &&
              !error &&
              filteredFaqs.map((faq) => {
                const isOpen =
                  openFaqId === faq.id;

                const answerId = `faq-answer-${faq.id}`;

                return (
                  <article
                    className={`faq-item${
                      isOpen
                        ? " faq-item--open"
                        : ""
                    }`}
                    key={faq.id}
                  >
                    <button
                      className="faq-question-button"
                      type="button"
                      onClick={() =>
                        handleFaqToggle(faq.id)
                      }
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                    >
                      <span className="faq-question-content">
                        {faq.category && (
                          <span className="faq-category-label">
                            {faq.category}
                          </span>
                        )}

                        <span className="faq-question">
                          {faq.question}
                        </span>
                      </span>

                      <span
                        className="faq-toggle-icon"
                        aria-hidden="true"
                      >
                        <ChevronDown size={21} />
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        className="faq-answer"
                        id={answerId}
                      >
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </article>
                );
              })}
          </div>

          <section className="faq-question-box">
            <div
              className="faq-question-box-icon"
              aria-hidden="true"
            >
              <Sparkles size={22} />
            </div>

            <div className="faq-question-box-content">
              <h2>
                Still have a question?
              </h2>

              <p>
                Our team usually replies within
                24–48 hours and will help you
                with anything not covered here.
              </p>
            </div>

            <Link
              className="faq-contact-button"
              to="/contact"
            >
              Contact our team

              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}

export default FAQ;