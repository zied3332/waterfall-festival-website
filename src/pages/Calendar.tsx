import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  MapPin,
  Search,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
} from "react-router-dom";

import {
  getPublicEvents,
} from "../services/events.service";

import type {
  Event,
} from "../types/event";

import "../style/calendar.css";

type CalendarDay = {
  date: Date;
  key: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string | string[];
    };
  };
};

const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const MAX_VISIBLE_EVENTS_PER_DAY = 2;

function createDateKey(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseEventDate(
  value: string,
): Date | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isSameDay(
  firstDate: Date,
  secondDate: Date,
): boolean {
  return (
    firstDate.getFullYear() ===
      secondDate.getFullYear() &&
    firstDate.getMonth() ===
      secondDate.getMonth() &&
    firstDate.getDate() ===
      secondDate.getDate()
  );
}

function createCalendarDays(
  visibleMonth: Date,
  today: Date,
): CalendarDay[] {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstDayOfMonth = new Date(
    year,
    month,
    1,
  );

  const firstVisibleDate = new Date(
    year,
    month,
    1 - firstDayOfMonth.getDay(),
  );

  return Array.from(
    { length: 42 },
    (_, index) => {
      const date = new Date(
        firstVisibleDate.getFullYear(),
        firstVisibleDate.getMonth(),
        firstVisibleDate.getDate() + index,
      );

      return {
        date,
        key: createDateKey(date),
        dayNumber: date.getDate(),
        isCurrentMonth:
          date.getMonth() === month,
        isToday: isSameDay(date, today),
      };
    },
  );
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return fallbackMessage;
  }

  const apiError = error as ApiError;
  const responseMessage =
    apiError.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return (
      responseMessage.join(". ") ||
      fallbackMessage
    );
  }

  if (
    typeof responseMessage === "string" &&
    responseMessage.trim()
  ) {
    return responseMessage;
  }

  if (
    typeof apiError.message === "string" &&
    apiError.message.trim()
  ) {
    return apiError.message;
  }

  return fallbackMessage;
}

function formatMonthYear(
  date: Date,
): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatFullDate(
  dateValue: string,
): string {
  const date = parseEventDate(dateValue);

  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatEventTime(
  dateValue: string,
): string {
  const date = parseEventDate(dateValue);

  if (!date) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatShortMonth(
  dateValue: string,
): string {
  const date = parseEventDate(dateValue);

  if (!date) {
    return "---";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  })
    .format(date)
    .toUpperCase();
}

function formatDayNumber(
  dateValue: string,
): string {
  const date = parseEventDate(dateValue);

  if (!date) {
    return "--";
  }

  return String(date.getDate()).padStart(
    2,
    "0",
  );
}

function formatShortWeekday(
  dateValue: string,
): string {
  const date = parseEventDate(dateValue);

  if (!date) {
    return "---";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  })
    .format(date)
    .toUpperCase();
}

function AdminCalendarEventImage({
  event,
}: {
  event: Event;
}) {
  if (!event.heroImageUrl) {
    return (
      <div
        className="public-calendar__event-image-placeholder"
        aria-hidden="true"
      >
        <Sparkles size={22} />
      </div>
    );
  }

  return (
    <img
      className="public-calendar__event-image"
      src={event.heroImageUrl}
      alt=""
    />
  );
}

function Calendar() {
  const today = useMemo(
    () => new Date(),
    [],
  );

  const [currentMonth, setCurrentMonth] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );

  const [events, setEvents] = useState<
    Event[]
  >([]);

  const [selectedEvent, setSelectedEvent] =
    useState<Event | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const calendarDays = useMemo(
    () =>
      createCalendarDays(
        currentMonth,
        today,
      ),
    [currentMonth, today],
  );

  const publishedEvents = useMemo(
    () =>
      events
        .filter(
          (event) =>
            event.status === "PUBLISHED",
        )
        .filter(
          (event) =>
            parseEventDate(event.date) !==
            null,
        )
        .sort(
          (firstEvent, secondEvent) =>
            new Date(
              firstEvent.date,
            ).getTime() -
            new Date(
              secondEvent.date,
            ).getTime(),
        ),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    if (!normalizedQuery) {
      return publishedEvents;
    }

    return publishedEvents.filter(
      (event) =>
        event.title
          .toLowerCase()
          .includes(normalizedQuery) ||
        event.description
          .toLowerCase()
          .includes(normalizedQuery) ||
        event.location
          .toLowerCase()
          .includes(normalizedQuery),
    );
  }, [publishedEvents, searchQuery]);

  const eventsByDate = useMemo(() => {
    const groupedEvents = new Map<
      string,
      Event[]
    >();

    filteredEvents.forEach((event) => {
      const eventDate = parseEventDate(
        event.date,
      );

      if (!eventDate) {
        return;
      }

      const dateKey =
        createDateKey(eventDate);

      const dateEvents =
        groupedEvents.get(dateKey) ?? [];

      dateEvents.push(event);

      groupedEvents.set(
        dateKey,
        dateEvents,
      );
    });

    return groupedEvents;
  }, [filteredEvents]);

  const nextEvent = useMemo(() => {
    const currentTime = today.getTime();

    return (
      publishedEvents.find(
        (event) =>
          new Date(event.date).getTime() >=
          currentTime,
      ) ?? null
    );
  }, [publishedEvents, today]);

  const upcomingEvents = useMemo(() => {
    const currentTime = today.getTime();

    return filteredEvents
      .filter(
        (event) =>
          new Date(event.date).getTime() >=
          currentTime,
      )
      .slice(0, 4);
  }, [filteredEvents, today]);

  const visibleMonthEvents = useMemo(
    () =>
      filteredEvents.filter((event) => {
        const eventDate = parseEventDate(
          event.date,
        );

        return (
          eventDate !== null &&
          eventDate.getFullYear() ===
            currentMonth.getFullYear() &&
          eventDate.getMonth() ===
            currentMonth.getMonth()
        );
      }),
    [currentMonth, filteredEvents],
  );

  const loadEvents =
    useCallback(async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response =
          await getPublicEvents();

        setEvents(response);
      } catch (error: unknown) {
        setErrorMessage(
          getErrorMessage(
            error,
            "We could not load the festival calendar.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!selectedEvent) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent,
    ): void {
      if (event.key === "Escape") {
        setSelectedEvent(null);
      }
    }

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow = "";

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [selectedEvent]);

  function goToPreviousMonth(): void {
    setCurrentMonth(
      (date) =>
        new Date(
          date.getFullYear(),
          date.getMonth() - 1,
          1,
        ),
    );
  }

  function goToNextMonth(): void {
    setCurrentMonth(
      (date) =>
        new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          1,
        ),
    );
  }

  function goToToday(): void {
    const currentDate = new Date();

    setCurrentMonth(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      ),
    );
  }

  function openEvent(
    event: Event,
  ): void {
    setSelectedEvent(event);
  }

  return (
    <div className="public-calendar">
      <section className="public-calendar__hero">
        <div className="public-calendar__hero-container">
          <div className="public-calendar__hero-copy">
            <span className="public-calendar__eyebrow">
              Event calendar
            </span>

            <h1>
              Plan your festival experience
            </h1>

            <p>
              Explore upcoming Waterfall Festival
              events, performances, special nights,
              and activities in Koh Phangan.
            </p>
          </div>

          {nextEvent && (
            <button
              type="button"
              className="public-calendar__next-event"
              onClick={() =>
                openEvent(nextEvent)
              }
            >
              <div className="public-calendar__next-event-copy">
                <span className="public-calendar__next-event-label">
                  Next event
                </span>

                <strong>
                  {nextEvent.title}
                </strong>

                <div className="public-calendar__next-event-meta">
                  <span>
                    <CalendarDays
                      size={15}
                      aria-hidden="true"
                    />

                    {formatFullDate(
                      nextEvent.date,
                    )}
                  </span>

                  <span>
                    <Clock3
                      size={15}
                      aria-hidden="true"
                    />

                    {formatEventTime(
                      nextEvent.date,
                    )}
                  </span>

                  <span>
                    <MapPin
                      size={15}
                      aria-hidden="true"
                    />

                    {nextEvent.location}
                  </span>
                </div>
              </div>

              <AdminCalendarEventImage
                event={nextEvent}
              />
            </button>
          )}
        </div>
      </section>

      <main className="public-calendar__main">
        <div className="public-calendar__container">
          <section className="public-calendar__controls">
            <div className="public-calendar__month-controls">
              <button
                type="button"
                className="public-calendar__today-button"
                onClick={goToToday}
              >
                Today
              </button>

              <div className="public-calendar__navigation">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft
                    size={19}
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  aria-label="Next month"
                  onClick={goToNextMonth}
                >
                  <ChevronRight
                    size={19}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <h2 aria-live="polite">
                {formatMonthYear(
                  currentMonth,
                )}
              </h2>
            </div>

            <label className="public-calendar__search">
              <Search
                size={18}
                aria-hidden="true"
              />

              <span className="sr-only">
                Search events
              </span>

              <input
                type="search"
                value={searchQuery}
                placeholder="Search events..."
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() =>
                    setSearchQuery("")
                  }
                >
                  <X
                    size={17}
                    aria-hidden="true"
                  />
                </button>
              )}
            </label>
          </section>

          {errorMessage && (
            <div
              className="public-calendar__feedback public-calendar__feedback--error"
              role="alert"
            >
              <AlertCircle
                size={22}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Calendar unavailable
                </strong>

                <p>{errorMessage}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadEvents()
                }
              >
                Try again
              </button>
            </div>
          )}

          {isLoading ? (
            <div
              className="public-calendar__loading"
              role="status"
            >
              <LoaderCircle
                className="public-calendar__spinner"
                size={30}
                aria-hidden="true"
              />

              <strong>
                Loading festival events
              </strong>

              <p>
                We are preparing the latest event
                schedule.
              </p>
            </div>
          ) : (
            <div className="public-calendar__layout">
              <section
                className="public-calendar__calendar-card"
                aria-label="Festival calendar"
              >
                <div className="public-calendar__mobile-month-heading">
                  <span>
                    {formatMonthYear(
                      currentMonth,
                    )}
                  </span>

                  <small>
                    {visibleMonthEvents.length}{" "}
                    {visibleMonthEvents.length ===
                    1
                      ? "event"
                      : "events"}
                  </small>
                </div>

                <div
                  className="public-calendar__weekdays"
                  role="row"
                >
                  {WEEKDAYS.map(
                    (weekday) => (
                      <div
                        key={weekday}
                        role="columnheader"
                      >
                        <span className="public-calendar__weekday-full">
                          {weekday}
                        </span>

                        <span className="public-calendar__weekday-short">
                          {weekday.charAt(0)}
                        </span>
                      </div>
                    ),
                  )}
                </div>

                <div
                  className="public-calendar__grid"
                  role="grid"
                  aria-label={formatMonthYear(
                    currentMonth,
                  )}
                >
                  {calendarDays.map((day) => {
                    const dayEvents =
                      eventsByDate.get(
                        day.key,
                      ) ?? [];

                    const visibleDayEvents =
                      dayEvents.slice(
                        0,
                        MAX_VISIBLE_EVENTS_PER_DAY,
                      );

                    const hiddenEventCount =
                      Math.max(
                        0,
                        dayEvents.length -
                          visibleDayEvents.length,
                      );

                    return (
                      <div
                        key={day.key}
                        role="gridcell"
                        className={[
                          "public-calendar__day",
                          !day.isCurrentMonth
                            ? "public-calendar__day--outside"
                            : "",
                          day.isToday
                            ? "public-calendar__day--today"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span className="public-calendar__day-number">
                          {day.dayNumber}
                        </span>

                        <div className="public-calendar__day-events">
                          {visibleDayEvents.map(
                            (event) => (
                              <button
                                key={
                                  event.id
                                }
                                type="button"
                                className="public-calendar__calendar-event"
                                onClick={() =>
                                  openEvent(
                                    event,
                                  )
                                }
                              >
                                <span>
                                  {formatEventTime(
                                    event.date,
                                  )}
                                </span>

                                <strong>
                                  {event.title}
                                </strong>
                              </button>
                            ),
                          )}

                          {hiddenEventCount >
                            0 && (
                            <span className="public-calendar__more-events">
                              +
                              {
                                hiddenEventCount
                              }{" "}
                              more
                            </span>
                          )}
                        </div>

                        {dayEvents.length > 0 && (
                          <span
                            className="public-calendar__mobile-event-dot"
                            aria-label={`${dayEvents.length} events`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <footer className="public-calendar__calendar-footer">
                  <span>
                    <span
                      className="public-calendar__legend-dot"
                      aria-hidden="true"
                    />

                    Festival event
                  </span>

                  <span>
                    {visibleMonthEvents.length}{" "}
                    {visibleMonthEvents.length ===
                    1
                      ? "event this month"
                      : "events this month"}
                  </span>
                </footer>
              </section>

              <aside className="public-calendar__upcoming">
                <header className="public-calendar__upcoming-header">
                  <div>
                    <span>
                      Coming soon
                    </span>

                    <h2>
                      Upcoming events
                    </h2>
                  </div>

                  <CalendarDays
                    size={21}
                    aria-hidden="true"
                  />
                </header>

                {upcomingEvents.length > 0 ? (
                  <div className="public-calendar__upcoming-list">
                    {upcomingEvents.map(
                      (event) => (
                        <button
                          key={event.id}
                          type="button"
                          className="public-calendar__upcoming-event"
                          onClick={() =>
                            openEvent(event)
                          }
                        >
                          <span className="public-calendar__date-card">
                            <small>
                              {formatShortMonth(
                                event.date,
                              )}
                            </small>

                            <strong>
                              {formatDayNumber(
                                event.date,
                              )}
                            </strong>

                            <span>
                              {formatShortWeekday(
                                event.date,
                              )}
                            </span>
                          </span>

                          <span className="public-calendar__upcoming-copy">
                            <strong>
                              {event.title}
                            </strong>

                            <span>
                              <Clock3
                                size={14}
                                aria-hidden="true"
                              />

                              {formatEventTime(
                                event.date,
                              )}
                            </span>

                            <span>
                              <MapPin
                                size={14}
                                aria-hidden="true"
                              />

                              {event.location}
                            </span>
                          </span>

                          <AdminCalendarEventImage
                            event={event}
                          />
                        </button>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="public-calendar__upcoming-empty">
                    <CalendarDays
                      size={25}
                      aria-hidden="true"
                    />

                    <strong>
                      No upcoming events found
                    </strong>

                    <p>
                      Try changing your search or
                      explore another month.
                    </p>
                  </div>
                )}

                <Link
                  className="public-calendar__view-all"
                  to="/events"
                >
                  View all events

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                  />
                </Link>
              </aside>
            </div>
          )}

          {!isLoading &&
            !errorMessage &&
            publishedEvents.length === 0 && (
              <div className="public-calendar__feedback public-calendar__feedback--empty">
                <CalendarDays
                  size={27}
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    No festival events scheduled
                  </strong>

                  <p>
                    New event dates will appear
                    here as soon as they are
                    announced.
                  </p>
                </div>
              </div>
            )}

          <section className="public-calendar__cta">
            <div className="public-calendar__cta-decoration">
              <Sparkles
                size={52}
                aria-hidden="true"
              />
            </div>

            <div className="public-calendar__cta-copy">
              <span>
                Your next adventure
              </span>

              <h2>
                Ready for your next unforgettable
                night?
              </h2>

              <p>
                Discover the complete Waterfall
                Festival experience and secure your
                tickets.
              </p>
            </div>

            <div className="public-calendar__cta-actions">
              <Link
                className="public-calendar__secondary-link"
                to="/events"
              >
                Explore events
              </Link>

              <Link
                className="public-calendar__primary-link"
                to="/tickets"
              >
                <Ticket
                  size={17}
                  aria-hidden="true"
                />

                Get tickets
              </Link>
            </div>
          </section>
        </div>
      </main>

      {selectedEvent && (
        <div
          className="public-calendar__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedEvent(null);
            }
          }}
        >
          <section
            className="public-calendar__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-calendar-event-title"
          >
            <div className="public-calendar__modal-image-wrapper">
              {selectedEvent.heroImageUrl ? (
                <img
                  src={
                    selectedEvent.heroImageUrl
                  }
                  alt=""
                  className="public-calendar__modal-image"
                />
              ) : (
                <div className="public-calendar__modal-image-placeholder">
                  <Sparkles
                    size={44}
                    aria-hidden="true"
                  />
                </div>
              )}

              <button
                type="button"
                className="public-calendar__modal-close"
                aria-label="Close event details"
                onClick={() =>
                  setSelectedEvent(null)
                }
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="public-calendar__modal-content">
              <span className="public-calendar__modal-label">
                Waterfall Festival event
              </span>

              <h2 id="public-calendar-event-title">
                {selectedEvent.title}
              </h2>

              <div className="public-calendar__modal-meta">
                <span>
                  <CalendarDays
                    size={17}
                    aria-hidden="true"
                  />

                  {formatFullDate(
                    selectedEvent.date,
                  )}
                </span>

                <span>
                  <Clock3
                    size={17}
                    aria-hidden="true"
                  />

                  {formatEventTime(
                    selectedEvent.date,
                  )}
                </span>

                <span>
                  <MapPin
                    size={17}
                    aria-hidden="true"
                  />

                  {selectedEvent.location}
                </span>
              </div>

              <p className="public-calendar__modal-description">
                {selectedEvent.description}
              </p>
            </div>

            <footer className="public-calendar__modal-actions">
              <button
                type="button"
                className="public-calendar__modal-secondary"
                onClick={() =>
                  setSelectedEvent(null)
                }
              >
                Close
              </button>

              <Link
                className="public-calendar__modal-primary"
                to={`/events/${selectedEvent.slug}`}
              >
                View event

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

export default Calendar;