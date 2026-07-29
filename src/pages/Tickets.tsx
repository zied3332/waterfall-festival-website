import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  Crown,
  ExternalLink,
  MapPin,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Ticket,
  TicketCheck,
  Users,
  XCircle,
} from "lucide-react";

import {
  getTickets,
  type TicketEventSummary,
  type TicketPreview,
} from "../services/ticket.service";

import "./style/tickets.css";

const ALL_EVENTS = "all";
const ALL_CATEGORIES = "all";

type TicketSortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name";

function formatEventDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date to be announced";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function formatSaleDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatPrice(
  price: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits:
        Number.isInteger(price) ? 0 : 2,
    }).format(price);
  } catch {
    return `${price} ${currency || "USD"}`;
  }
}

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getTicketPurchaseUrl(
  ticket: TicketPreview,
): string | null {
  return (
    ticket.externalPurchaseUrl ??
    ticket.event.ticketPurchaseUrl ??
    null
  );
}

function isSaleUpcoming(
  ticket: TicketPreview,
): boolean {
  if (!ticket.saleStartsAt) {
    return false;
  }

  const saleStart = new Date(
    ticket.saleStartsAt,
  );

  return (
    !Number.isNaN(saleStart.getTime()) &&
    saleStart.getTime() > Date.now()
  );
}

function isTicketSoldOut(
  ticket: TicketPreview,
): boolean {
  return (
    ticket.remainingQuantity === 0 ||
    ticket.status.toUpperCase() === "SOLD_OUT"
  );
}

function isTicketAvailable(
  ticket: TicketPreview,
): boolean {
  return (
    !isTicketSoldOut(ticket) &&
    !isSaleUpcoming(ticket) &&
    Boolean(getTicketPurchaseUrl(ticket))
  );
}

function getTicketAvailabilityLabel(
  ticket: TicketPreview,
): string {
  if (isTicketSoldOut(ticket)) {
    return "Sold out";
  }

  if (isSaleUpcoming(ticket)) {
    return "Coming soon";
  }

  return (
    ticket.availabilityLabel?.trim() ||
    "Available"
  );
}

function getTicketIcon(
  category: string,
) {
  const normalizedCategory =
    category.toLowerCase();

  if (
    normalizedCategory.includes("vip") ||
    normalizedCategory.includes("premium")
  ) {
    return Crown;
  }

  if (
    normalizedCategory.includes("backstage") ||
    normalizedCategory.includes("featured")
  ) {
    return Star;
  }

  return Ticket;
}

function Tickets() {
  const [tickets, setTickets] = useState<
    TicketPreview[]
  >([]);

  const [selectedEventId, setSelectedEventId] =
    useState(ALL_EVENTS);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(ALL_CATEGORIES);

  const [sortOption, setSortOption] =
    useState<TicketSortOption>("featured");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadTickets = useCallback(
    async (
      showRefreshState = false,
    ): Promise<void> => {
      try {
        if (showRefreshState) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const response = await getPublicTickets();

        setTickets(response.data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load tickets.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const events = useMemo(() => {
    const eventsById = new Map<
      number,
      TicketEventSummary
    >();

    tickets.forEach((ticket) => {
      eventsById.set(
        ticket.event.id,
        ticket.event,
      );
    });

    return Array.from(
      eventsById.values(),
    ).sort((firstEvent, secondEvent) => {
      return (
        new Date(firstEvent.date).getTime() -
        new Date(secondEvent.date).getTime()
      );
    });
  }, [tickets]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        tickets
          .map((ticket) =>
            ticket.category.trim(),
          )
          .filter(Boolean),
      ),
    ).sort((firstCategory, secondCategory) =>
      firstCategory.localeCompare(
        secondCategory,
      ),
    );
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter(
      (ticket) => {
        const matchesEvent =
          selectedEventId === ALL_EVENTS ||
          ticket.eventId ===
            Number(selectedEventId);

        const matchesCategory =
          selectedCategory ===
            ALL_CATEGORIES ||
          ticket.category ===
            selectedCategory;

        return (
          matchesEvent && matchesCategory
        );
      },
    );

    return [...filtered].sort(
      (firstTicket, secondTicket) => {
        switch (sortOption) {
          case "price-asc":
            return (
              firstTicket.price -
              secondTicket.price
            );

          case "price-desc":
            return (
              secondTicket.price -
              firstTicket.price
            );

          case "name":
            return firstTicket.name.localeCompare(
              secondTicket.name,
            );

          case "featured":
          default:
            if (
              firstTicket.isFeatured !==
              secondTicket.isFeatured
            ) {
              return firstTicket.isFeatured
                ? -1
                : 1;
            }

            return (
              firstTicket.sortOrder -
              secondTicket.sortOrder
            );
        }
      },
    );
  }, [
    selectedCategory,
    selectedEventId,
    sortOption,
    tickets,
  ]);

  const selectedEvent = useMemo(() => {
    if (selectedEventId === ALL_EVENTS) {
      return null;
    }

    return (
      events.find(
        (event) =>
          event.id ===
          Number(selectedEventId),
      ) ?? null
    );
  }, [events, selectedEventId]);

  const ticketStatistics = useMemo(() => {
    return filteredTickets.reduce(
      (statistics, ticket) => {
        if (isTicketSoldOut(ticket)) {
          statistics.soldOut += 1;
        } else if (isSaleUpcoming(ticket)) {
          statistics.upcoming += 1;
        } else {
          statistics.available += 1;
        }

        return statistics;
      },
      {
        available: 0,
        upcoming: 0,
        soldOut: 0,
      },
    );
  }, [filteredTickets]);

  function handleEventChange(
    eventId: string,
  ): void {
    setSelectedEventId(eventId);
    setSelectedCategory(
      ALL_CATEGORIES,
    );
  }

  return (
    <main className="tickets-page">
      <section className="tickets-hero">
        <div className="tickets-hero__content">
          <p className="tickets-hero__label">
            Tickets
          </p>

          <h1 className="tickets-hero__title">
            Choose Your Experience
          </h1>

          <p className="tickets-hero__description">
            Find the right ticket for your next
            Waterfall Festival event.
          </p>
        </div>
      </section>

      <section className="tickets-content">
        <div className="tickets-container">
          <header className="tickets-intro">
            <div>
              <p className="tickets-section-label">
                Festival tickets
              </p>

              <h2>
                Select your event and explore
                available tickets.
              </h2>
            </div>

            {!isLoading && !error && (
              <div className="tickets-total">
                <span
                  className="tickets-total__icon"
                  aria-hidden="true"
                >
                  <TicketCheck size={21} />
                </span>

                <div>
                  <strong>
                    {tickets.length}{" "}
                    {tickets.length === 1
                      ? "ticket"
                      : "tickets"}{" "}
                    available
                  </strong>

                  <span>Across all events</span>
                </div>
              </div>
            )}
          </header>

          <section
            className="tickets-toolbar"
            aria-label="Ticket filters"
          >
            <div className="tickets-toolbar__field">
              <label htmlFor="ticket-event-filter">
                Select event
              </label>

              <div className="tickets-select-wrapper">
                <CalendarDays
                  size={17}
                  aria-hidden="true"
                />

                <select
                  id="ticket-event-filter"
                  value={selectedEventId}
                  disabled={isLoading}
                  onChange={(event) =>
                    handleEventChange(
                      event.target.value,
                    )
                  }
                >
                  <option value={ALL_EVENTS}>
                    All Events
                  </option>

                  {events.map((event) => (
                    <option
                      value={event.id}
                      key={event.id}
                    >
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tickets-toolbar__categories">
              <span>Filter by category</span>

              <div className="tickets-categories">
                <button
                  className={`tickets-category${
                    selectedCategory ===
                    ALL_CATEGORIES
                      ? " tickets-category--active"
                      : ""
                  }`}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      ALL_CATEGORIES,
                    )
                  }
                  aria-pressed={
                    selectedCategory ===
                    ALL_CATEGORIES
                  }
                >
                  All
                </button>

                {categories.map((category) => (
                  <button
                    className={`tickets-category${
                      selectedCategory ===
                      category
                        ? " tickets-category--active"
                        : ""
                    }`}
                    type="button"
                    key={category}
                    onClick={() =>
                      setSelectedCategory(
                        category,
                      )
                    }
                    aria-pressed={
                      selectedCategory ===
                      category
                    }
                  >
                    {formatCategory(category)}
                  </button>
                ))}
              </div>
            </div>

            <div className="tickets-toolbar__field">
              <label htmlFor="ticket-sort">
                Sort by
              </label>

              <div className="tickets-select-wrapper">
                <SlidersHorizontal
                  size={17}
                  aria-hidden="true"
                />

                <select
                  id="ticket-sort"
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(
                      event.target
                        .value as TicketSortOption,
                    )
                  }
                >
                  <option value="featured">
                    Featured
                  </option>

                  <option value="price-asc">
                    Price: Low to High
                  </option>

                  <option value="price-desc">
                    Price: High to Low
                  </option>

                  <option value="name">
                    Name
                  </option>
                </select>
              </div>
            </div>
          </section>

          {selectedEvent && (
            <section className="tickets-event-summary">
              {tickets.find(
                (ticket) =>
                  ticket.eventId ===
                    selectedEvent.id &&
                  ticket.imageUrl,
              )?.imageUrl ? (
                <img
                  className="tickets-event-summary__image"
                  src={
                    tickets.find(
                      (ticket) =>
                        ticket.eventId ===
                          selectedEvent.id &&
                        ticket.imageUrl,
                    )?.imageUrl ?? ""
                  }
                  alt=""
                />
              ) : (
                <div
                  className="tickets-event-summary__placeholder"
                  aria-hidden="true"
                >
                  <Sparkles size={30} />
                </div>
              )}

              <div className="tickets-event-summary__content">
                <h2>{selectedEvent.title}</h2>

                <div className="tickets-event-summary__details">
                  <span>
                    <CalendarDays
                      size={16}
                      aria-hidden="true"
                    />

                    {formatEventDate(
                      selectedEvent.date,
                    )}
                  </span>

                  <span>
                    <MapPin
                      size={16}
                      aria-hidden="true"
                    />

                    {selectedEvent.location ||
                      "Koh Phangan, Thailand"}
                  </span>
                </div>

                <p>
                  {filteredTickets.length}{" "}
                  {filteredTickets.length === 1
                    ? "ticket option"
                    : "ticket options"}{" "}
                  available
                </p>
              </div>

              <div className="tickets-event-summary__availability">
                <strong>
                  <span
                    className="tickets-event-summary__dot"
                    aria-hidden="true"
                  />

                  Tickets on sale now
                </strong>

                <span>
                  {ticketStatistics.available}{" "}
                  available ticket{" "}
                  {ticketStatistics.available ===
                  1
                    ? "option"
                    : "options"}
                </span>
              </div>
            </section>
          )}

          {isLoading && (
            <div
              className="tickets-skeleton-grid"
              aria-label="Loading tickets"
            >
              {Array.from({
                length: 3,
              }).map((_, index) => (
                <div
                  className="ticket-skeleton"
                  key={index}
                  aria-hidden="true"
                >
                  <div className="ticket-skeleton__header">
                    <div className="ticket-skeleton__circle" />

                    <div className="ticket-skeleton__badge" />
                  </div>

                  <div className="ticket-skeleton__line ticket-skeleton__line--title" />

                  <div className="ticket-skeleton__line" />

                  <div className="ticket-skeleton__line ticket-skeleton__line--price" />

                  <div className="ticket-skeleton__benefits">
                    <div className="ticket-skeleton__line" />
                    <div className="ticket-skeleton__line" />
                    <div className="ticket-skeleton__line ticket-skeleton__line--short" />
                  </div>

                  <div className="ticket-skeleton__button" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="tickets-message tickets-message--error">
              <div>
                <h2>
                  We couldn’t load the tickets
                </h2>

                <p>
                  Something went wrong while
                  retrieving the latest ticket
                  options.
                </p>

                <small>{error}</small>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadTickets()
                }
              >
                <RefreshCw
                  size={17}
                  aria-hidden="true"
                />

                Try Again
              </button>
            </div>
          )}

          {!isLoading &&
            !error &&
            tickets.length === 0 && (
              <div className="tickets-message">
                <span
                  className="tickets-message__icon"
                  aria-hidden="true"
                >
                  <Ticket size={24} />
                </span>

                <div>
                  <h2>
                    No tickets available yet
                  </h2>

                  <p>
                    Ticket options will appear
                    here when festival sales
                    open.
                  </p>
                </div>
              </div>
            )}

          {!isLoading &&
            !error &&
            tickets.length > 0 &&
            filteredTickets.length === 0 && (
              <div className="tickets-message">
                <span
                  className="tickets-message__icon"
                  aria-hidden="true"
                >
                  <CircleHelp size={24} />
                </span>

                <div>
                  <h2>
                    No matching tickets
                  </h2>

                  <p>
                    Choose another event or
                    ticket category.
                  </p>
                </div>
              </div>
            )}

          {!isLoading &&
            !error &&
            filteredTickets.length > 0 && (
              <div className="tickets-grid">
                {filteredTickets.map(
                  (ticket) => {
                    const TicketIcon =
                      getTicketIcon(
                        ticket.category,
                      );

                    const purchaseUrl =
                      getTicketPurchaseUrl(
                        ticket,
                      );

                    const isAvailable =
                      isTicketAvailable(ticket);

                    const isSoldOut =
                      isTicketSoldOut(ticket);

                    const isUpcoming =
                      isSaleUpcoming(ticket);

                    const availabilityClass =
                      isSoldOut
                        ? "sold-out"
                        : isUpcoming
                          ? "upcoming"
                          : "available";

                    return (
                      <article
                        className={`ticket-card${
                          ticket.isFeatured
                            ? " ticket-card--featured"
                            : ""
                        }`}
                        key={ticket.id}
                      >
                        <div className="ticket-card__top">
                          <span className="ticket-card__badge">
                            {ticket.badge?.trim() ||
                              formatCategory(
                                ticket.category,
                              )}
                          </span>

                          <span
                            className={`ticket-card__availability ticket-card__availability--${availabilityClass}`}
                          >
                            {getTicketAvailabilityLabel(
                              ticket,
                            )}
                          </span>
                        </div>

                        <span
                          className="ticket-card__icon"
                          aria-hidden="true"
                        >
                          <TicketIcon size={25} />
                        </span>

                        <h2>{ticket.name}</h2>

                        <p className="ticket-card__event">
                          {ticket.event.title}
                        </p>

                        {ticket.shortDescription && (
                          <p className="ticket-card__description">
                            {
                              ticket.shortDescription
                            }
                          </p>
                        )}

                        <div className="ticket-card__pricing">
                          <strong>
                            {formatPrice(
                              ticket.price,
                              ticket.currency,
                            )}
                          </strong>

                          {ticket.originalPrice !==
                            null &&
                            ticket.originalPrice >
                              ticket.price && (
                              <span>
                                {formatPrice(
                                  ticket.originalPrice,
                                  ticket.currency,
                                )}
                              </span>
                            )}
                        </div>

                        {ticket.benefits.length >
                          0 && (
                          <ul className="ticket-card__benefits">
                            {ticket.benefits
                              .slice()
                              .sort(
                                (
                                  firstBenefit,
                                  secondBenefit,
                                ) =>
                                  firstBenefit.sortOrder -
                                  secondBenefit.sortOrder,
                              )
                              .map((benefit) => (
                                <li
                                  key={benefit.id}
                                >
                                  <span
                                    aria-hidden="true"
                                  >
                                    <Check size={14} />
                                  </span>

                                  {benefit.text}
                                </li>
                              ))}
                          </ul>
                        )}

                        <div className="ticket-card__information">
                          <div>
                            <TicketCheck
                              size={16}
                              aria-hidden="true"
                            />

                            <span>
                              {isSoldOut
                                ? "Currently sold out"
                                : isUpcoming &&
                                    ticket.saleStartsAt
                                  ? `Sales start ${formatSaleDate(
                                      ticket.saleStartsAt,
                                    )}`
                                  : ticket.remainingQuantity !==
                                      null
                                    ? `${ticket.remainingQuantity} remaining`
                                    : "Available now"}
                            </span>
                          </div>

                          {(ticket.minimumPerOrder !==
                            null ||
                            ticket.maximumPerOrder !==
                              null) && (
                            <div>
                              <Users
                                size={16}
                                aria-hidden="true"
                              />

                              <span>
                                {ticket.minimumPerOrder !==
                                  null
                                  ? `Min. ${ticket.minimumPerOrder}`
                                  : "No minimum"}

                                {ticket.maximumPerOrder !==
                                  null
                                  ? ` · Max. ${ticket.maximumPerOrder}`
                                  : ""}
                              </span>
                            </div>
                          )}

                          {ticket.saleEndsAt &&
                            !isUpcoming &&
                            !isSoldOut && (
                              <div>
                                <Clock3
                                  size={16}
                                  aria-hidden="true"
                                />

                                <span>
                                  Sales end{" "}
                                  {formatSaleDate(
                                    ticket.saleEndsAt,
                                  )}
                                </span>
                              </div>
                            )}
                        </div>

                        {purchaseUrl &&
                        isAvailable ? (
                          <a
                            className="ticket-card__button"
                            href={purchaseUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Buy Ticket

                            <ExternalLink
                              size={17}
                              aria-hidden="true"
                            />
                          </a>
                        ) : (
                          <button
                            className="ticket-card__button"
                            type="button"
                            disabled
                          >
                            {isSoldOut
                              ? "Sold Out"
                              : isUpcoming
                                ? "Sales Not Open"
                                : "Unavailable"}
                          </button>
                        )}
                      </article>
                    );
                  },
                )}
              </div>
            )}

          {!isLoading &&
            !error &&
            filteredTickets.length > 0 && (
              <section className="tickets-status-summary">
                <div>
                  <span className="tickets-status-summary__icon tickets-status-summary__icon--upcoming">
                    <Clock3
                      size={22}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <strong>
                      Upcoming tickets
                    </strong>

                    <span>
                      {ticketStatistics.upcoming}{" "}
                      ticket{" "}
                      {ticketStatistics.upcoming ===
                      1
                        ? "option"
                        : "options"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="tickets-status-summary__icon tickets-status-summary__icon--available">
                    <TicketCheck
                      size={22}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <strong>
                      Available now
                    </strong>

                    <span>
                      {ticketStatistics.available}{" "}
                      ticket{" "}
                      {ticketStatistics.available ===
                      1
                        ? "option"
                        : "options"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="tickets-status-summary__icon tickets-status-summary__icon--sold-out">
                    <XCircle
                      size={22}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <strong>Sold out</strong>

                    <span>
                      {ticketStatistics.soldOut}{" "}
                      ticket{" "}
                      {ticketStatistics.soldOut ===
                      1
                        ? "option"
                        : "options"}
                    </span>
                  </div>
                </div>
              </section>
            )}

          <section className="tickets-help">
            <div className="tickets-help__visual">
              <Ticket
                size={38}
                aria-hidden="true"
              />
            </div>

            <div className="tickets-help__content">
              <p className="tickets-section-label">
                Need help?
              </p>

              <h2>
                Not sure which ticket is right
                for you?
              </h2>

              <p>
                Our team can help you compare
                options and choose the best
                ticket for your Waterfall
                Festival experience.
              </p>

              <div className="tickets-help__features">
                <span>
                  <Sparkles
                    size={17}
                    aria-hidden="true"
                  />

                  Different experiences
                </span>

                <span>
                  <CircleHelp
                    size={17}
                    aria-hidden="true"
                  />

                  Dedicated support
                </span>

                <span>
                  <ShieldCheck
                    size={17}
                    aria-hidden="true"
                  />

                  Official tickets only
                </span>
              </div>
            </div>

            <Link
              className="tickets-help__button"
              to="/contact"
            >
              Contact Our Team

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

export default Tickets;