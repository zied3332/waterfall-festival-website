import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  RotateCcw,
  Sparkles,
  Ticket,
} from "lucide-react";

import TicketCard from "./TicketCard";

import {
  getPublicTickets,
} from "../../services/ticket.service";

import type {
  TicketPreview,
} from "../../services/ticket.service";

import "./Tickets.css";

const PREVIEW_TICKET_LIMIT = 3;
const TICKET_SKELETON_COUNT = 3;

type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string | string[];
    };
  };
};

function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return "Could not load festival tickets.";
  }

  const apiError = error as ApiError;

  const responseMessage =
    apiError.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(" ");
  }

  if (typeof responseMessage === "string") {
    return responseMessage;
  }

  if (typeof apiError.message === "string") {
    return apiError.message;
  }

  return "Could not load festival tickets.";
}

function TicketsPreviewSection() {
  const [tickets, setTickets] =
    useState<TicketPreview[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadTickets =
    useCallback(async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await getPublicTickets({
            page: 1,
            limit: PREVIEW_TICKET_LIMIT,
            sortBy: "sortOrder",
            sortDirection: "asc",
          });

        setTickets(
          response.data.slice(
            0,
            PREVIEW_TICKET_LIMIT,
          ),
        );
      } catch (loadError: unknown) {
        setTickets([]);

        setError(
          getErrorMessage(loadError),
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  return (
    <section
      className="tickets-preview"
      aria-labelledby="tickets-preview-title"
    >
      <div
        className="tickets-preview__background"
        aria-hidden="true"
      >
        <div className="tickets-preview__grid-pattern" />

        <div className="tickets-preview__glow tickets-preview__glow--one" />

        <div className="tickets-preview__glow tickets-preview__glow--two" />
      </div>

      <div className="tickets-preview__container">
        <header className="tickets-preview__header">
          <div>
            <p className="tickets-preview__eyebrow">
              <Sparkles
                size={14}
                aria-hidden="true"
              />

              <span>Festival passes</span>
            </p>

            <h2
              id="tickets-preview-title"
              className="tickets-preview__title"
            >
              Choose your experience.
            </h2>

            <p className="tickets-preview__description">
              Explore available passes and
              secure your place through the
              official ticket provider.
            </p>
          </div>

          {!isLoading &&
            !error &&
            tickets.length > 0 && (
              <Link
                to="/tickets"
                className="tickets-preview__header-link"
              >
                View all tickets

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>
            )}
        </header>

        {isLoading && (
          <div
            className="tickets-preview__grid"
            aria-label="Loading festival tickets"
          >
            {Array.from({
              length:
                TICKET_SKELETON_COUNT,
            }).map((_, index) => (
              <div
                key={index}
                className="ticket-preview-skeleton"
                aria-hidden="true"
              >
                <div className="ticket-preview-skeleton__image" />

                <div className="ticket-preview-skeleton__body">
                  <span className="ticket-preview-skeleton__line ticket-preview-skeleton__line--title" />

                  <span className="ticket-preview-skeleton__line ticket-preview-skeleton__line--price" />

                  <span className="ticket-preview-skeleton__line" />

                  <span className="ticket-preview-skeleton__line ticket-preview-skeleton__line--short" />

                  <span className="ticket-preview-skeleton__button" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div
            className="tickets-preview__state tickets-preview__state--error"
            role="alert"
          >
            <span className="tickets-preview__state-icon">
              <Ticket
                size={23}
                aria-hidden="true"
              />
            </span>

            <div>
              <h3>
                We couldn’t load the tickets
              </h3>

              <p>{error}</p>
            </div>

            <button
              type="button"
              className="tickets-preview__retry"
              onClick={() => {
                void loadTickets();
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
          tickets.length === 0 && (
            <div className="tickets-preview__state">
              <span className="tickets-preview__state-icon">
                <Ticket
                  size={23}
                  aria-hidden="true"
                />
              </span>

              <div>
                <h3>
                  Tickets are coming soon
                </h3>

                <p>
                  Available festival passes
                  will appear here when sales
                  open.
                </p>
              </div>
            </div>
          )}

        {!isLoading &&
          !error &&
          tickets.length > 0 && (
            <div className="tickets-preview__grid">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                />
              ))}
            </div>
          )}

        {!isLoading &&
          !error &&
          tickets.length > 0 && (
            <footer className="tickets-preview__footer">
              <Link
                to="/tickets"
                className="tickets-preview__button"
              >
                Explore all passes

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </Link>
            </footer>
          )}
      </div>
    </section>
  );
}

export default TicketsPreviewSection;