import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  deleteEvent,
  getAdminEvents,
} from "../../services/events.service";

import "../style/admin-calendar.css";

type CalendarDay = {
  date: Date;
  key: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  status: string;
  location?: string | null;
  slug?: string;
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

const EVENT_STATUSES = [
  "PUBLISHED",
  "DRAFT",
  "COMPLETED",
  "CANCELLED",
];

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

function createEventDate(
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

function formatEventTime(
  dateValue: string,
): string {
  const date = createEventDate(dateValue);

  if (!date) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatEventDate(
  dateValue: string,
): string {
  const date = createEventDate(dateValue);

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

function normalizeStatus(
  status: string,
): string {
  return status.trim().toUpperCase();
}

function getStatusClassName(
  status: string,
): string {
  const normalizedStatus =
    normalizeStatus(status);

  switch (normalizedStatus) {
    case "PUBLISHED":
      return "admin-calendar__event--published";

    case "COMPLETED":
      return "admin-calendar__event--completed";

    case "CANCELLED":
      return "admin-calendar__event--cancelled";

    case "DRAFT":
    default:
      return "admin-calendar__event--draft";
  }
}

function getStatusLabel(
  status: string,
): string {
  const normalizedStatus =
    normalizeStatus(status);

  return (
    normalizedStatus.charAt(0) +
    normalizedStatus.slice(1).toLowerCase()
  );
}

function AdminCalendar() {
  const navigate = useNavigate();

  const today = useMemo(
    () => new Date(),
    [],
  );

  const [currentDate, setCurrentDate] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEvent | null>(null);

  const [events, setEvents] = useState<
    CalendarEvent[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const calendarDays = useMemo(
    () =>
      createCalendarDays(
        currentDate,
        today,
      ),
    [currentDate, today],
  );

  const currentMonthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(currentDate),
    [currentDate],
  );

  const eventsByDate = useMemo(() => {
    const groupedEvents = new Map<
      string,
      CalendarEvent[]
    >();

    events.forEach((event) => {
      const eventDate = createEventDate(
        event.date,
      );

      if (!eventDate) {
        return;
      }

      const dateKey =
        createDateKey(eventDate);

      const existingEvents =
        groupedEvents.get(dateKey) ?? [];

      existingEvents.push(event);

      groupedEvents.set(
        dateKey,
        existingEvents,
      );
    });

    groupedEvents.forEach(
      (dateEvents) => {
        dateEvents.sort(
          (firstEvent, secondEvent) =>
            new Date(
              firstEvent.date,
            ).getTime() -
            new Date(
              secondEvent.date,
            ).getTime(),
        );
      },
    );

    return groupedEvents;
  }, [events]);

  const visibleMonthEvents = useMemo(
    () =>
      events.filter((event) => {
        const eventDate = createEventDate(
          event.date,
        );

        return (
          eventDate !== null &&
          eventDate.getFullYear() ===
            currentDate.getFullYear() &&
          eventDate.getMonth() ===
            currentDate.getMonth()
        );
      }),
    [currentDate, events],
  );

  const loadEvents =
    useCallback(async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response =
          await getAdminEvents();

        setEvents(response);
      } catch (error: unknown) {
        setErrorMessage(
          getErrorMessage(
            error,
            "Unable to load calendar events.",
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

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [selectedEvent]);

  function goToPreviousMonth(): void {
    setCurrentDate(
      (date) =>
        new Date(
          date.getFullYear(),
          date.getMonth() - 1,
          1,
        ),
    );
  }

  function goToNextMonth(): void {
    setCurrentDate(
      (date) =>
        new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          1,
        ),
    );
  }

  function goToToday(): void {
    const currentToday = new Date();

    setCurrentDate(
      new Date(
        currentToday.getFullYear(),
        currentToday.getMonth(),
        1,
      ),
    );

    setSelectedDate(currentToday);
  }

  function handleDaySelect(
    day: CalendarDay,
  ): void {
    setSelectedDate(day.date);

    if (!day.isCurrentMonth) {
      setCurrentDate(
        new Date(
          day.date.getFullYear(),
          day.date.getMonth(),
          1,
        ),
      );
    }
  }

  function handleAddEvent(): void {
    navigate("/admin/events/new", {
      state: {
        selectedDate:
          selectedDate !== null
            ? createDateKey(selectedDate)
            : createDateKey(new Date()),
      },
    });
  }

  function handleEditEvent(
    event: CalendarEvent,
  ): void {
    navigate(
      `/admin/events/${event.id}/edit`,
    );
  }

  async function handleDeleteEvent(): Promise<void> {
    if (!selectedEvent || isDeleting) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete "${selectedEvent.title}"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteEvent(selectedEvent.id);

      setEvents((currentEvents) =>
        currentEvents.filter(
          (event) =>
            event.id !== selectedEvent.id,
        ),
      );

      setSelectedEvent(null);
    } catch (error: unknown) {
      window.alert(
        getErrorMessage(
          error,
          "Unable to delete this event.",
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section
      className="admin-calendar"
      aria-labelledby="admin-calendar-title"
    >
      <header className="admin-calendar__header">
        <div className="admin-calendar__heading">
          <span
            className="admin-calendar__heading-icon"
            aria-hidden="true"
          >
            <CalendarDays size={21} />
          </span>

          <div>
            <span className="admin-calendar__eyebrow">
              Event scheduling
            </span>

            <h1 id="admin-calendar-title">
              Calendar
            </h1>

            <p>
              View festival events by date and
              manage the event schedule.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="admin-calendar__add-button"
          onClick={handleAddEvent}
        >
          <Plus
            size={17}
            aria-hidden="true"
          />

          Add event
        </button>
      </header>

      <div className="admin-calendar__toolbar">
        <div className="admin-calendar__toolbar-left">
          <button
            type="button"
            className="admin-calendar__today-button"
            onClick={goToToday}
          >
            Today
          </button>

          <span className="admin-calendar__event-count">
            {visibleMonthEvents.length}{" "}
            {visibleMonthEvents.length === 1
              ? "event"
              : "events"}
          </span>
        </div>

        <div className="admin-calendar__month-navigation">
          <button
            type="button"
            aria-label="Previous month"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft
              size={17}
              aria-hidden="true"
            />
          </button>

          <strong aria-live="polite">
            {currentMonthLabel}
          </strong>

          <button
            type="button"
            aria-label="Next month"
            onClick={goToNextMonth}
          >
            <ChevronRight
              size={17}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="admin-calendar__legend">
        {EVENT_STATUSES.map((status) => (
          <span
            key={status}
            className={`admin-calendar__legend-item ${getStatusClassName(
              status,
            )}`}
          >
            <span
              className="admin-calendar__legend-dot"
              aria-hidden="true"
            />

            {getStatusLabel(status)}
          </span>
        ))}
      </div>

      {errorMessage && (
        <div
          className="admin-calendar__feedback admin-calendar__feedback--error"
          role="alert"
        >
          <AlertCircle
            size={18}
            aria-hidden="true"
          />

          <span>{errorMessage}</span>

          <button
            type="button"
            onClick={() => void loadEvents()}
          >
            <RefreshCw
              size={15}
              aria-hidden="true"
            />

            Retry
          </button>
        </div>
      )}

      <div
        className="admin-calendar__card"
        aria-busy={isLoading}
      >
        <div
          className="admin-calendar__weekdays"
          role="row"
        >
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              role="columnheader"
            >
              {weekday}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div
            className="admin-calendar__loading"
            role="status"
          >
            <LoaderCircle
              size={25}
              className="admin-calendar__loading-icon"
              aria-hidden="true"
            />

            <strong>
              Loading calendar events
            </strong>

            <span>
              Please wait while the event schedule
              is loaded.
            </span>
          </div>
        ) : (
          <div
            className="admin-calendar__grid"
            role="grid"
            aria-label={currentMonthLabel}
          >
            {calendarDays.map((day) => {
              const isSelected =
                selectedDate !== null &&
                isSameDay(
                  day.date,
                  selectedDate,
                );

              const dayEvents =
                eventsByDate.get(day.key) ?? [];

              return (
                <div
                  key={day.key}
                  role="gridcell"
                  className={[
                    "admin-calendar__day",
                    !day.isCurrentMonth
                      ? "admin-calendar__day--outside"
                      : "",
                    day.isToday
                      ? "admin-calendar__day--today"
                      : "",
                    isSelected
                      ? "admin-calendar__day--selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-selected={isSelected}
                >
                  <button
                    type="button"
                    className="admin-calendar__day-select"
                    aria-label={`Select ${new Intl.DateTimeFormat(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    ).format(day.date)}`}
                    onClick={() =>
                      handleDaySelect(day)
                    }
                  >
                    <span className="admin-calendar__day-number">
                      {day.dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="admin-calendar__day-event-count">
                        {dayEvents.length}
                      </span>
                    )}
                  </button>

                  <div className="admin-calendar__day-events">
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className={`admin-calendar__event ${getStatusClassName(
                          event.status,
                        )}`}
                        title={`${event.title} — ${getStatusLabel(
                          event.status,
                        )}`}
                        onClick={() =>
                          setSelectedEvent(event)
                        }
                      >
                        <span className="admin-calendar__event-time">
                          {formatEventTime(
                            event.date,
                          )}
                        </span>

                        <span className="admin-calendar__event-title">
                          {event.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!isLoading &&
        !errorMessage &&
        events.length === 0 && (
          <div className="admin-calendar__empty">
            <CalendarDays
              size={24}
              aria-hidden="true"
            />

            <div>
              <strong>
                No events scheduled
              </strong>

              <p>
                Create your first event to display
                it on the calendar.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddEvent}
            >
              <Plus
                size={16}
                aria-hidden="true"
              />

              Add event
            </button>
          </div>
        )}

      {selectedEvent && (
        <div
          className="admin-calendar__modal-backdrop"
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
            className="admin-calendar__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-event-title"
          >
            <header className="admin-calendar__modal-header">
              <div>
                <span
                  className={`admin-calendar__modal-status ${getStatusClassName(
                    selectedEvent.status,
                  )}`}
                >
                  <span
                    aria-hidden="true"
                  />

                  {getStatusLabel(
                    selectedEvent.status,
                  )}
                </span>

                <h2 id="calendar-event-title">
                  {selectedEvent.title}
                </h2>
              </div>

              <button
                type="button"
                className="admin-calendar__modal-close"
                aria-label="Close event details"
                onClick={() =>
                  setSelectedEvent(null)
                }
              >
                <X
                  size={19}
                  aria-hidden="true"
                />
              </button>
            </header>

            <div className="admin-calendar__modal-content">
              <div className="admin-calendar__detail">
                <CalendarDays
                  size={18}
                  aria-hidden="true"
                />

                <div>
                  <span>Date</span>
                  <strong>
                    {formatEventDate(
                      selectedEvent.date,
                    )}
                  </strong>
                </div>
              </div>

              <div className="admin-calendar__detail">
                <Clock3
                  size={18}
                  aria-hidden="true"
                />

                <div>
                  <span>Time</span>
                  <strong>
                    {formatEventTime(
                      selectedEvent.date,
                    )}
                  </strong>
                </div>
              </div>

              <div className="admin-calendar__detail">
                <MapPin
                  size={18}
                  aria-hidden="true"
                />

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedEvent.location?.trim() ||
                      "No location provided"}
                  </strong>
                </div>
              </div>
            </div>

            <footer className="admin-calendar__modal-actions">
              <button
                type="button"
                className="admin-calendar__delete-button"
                disabled={isDeleting}
                onClick={() =>
                  void handleDeleteEvent()
                }
              >
                {isDeleting ? (
                  <LoaderCircle
                    size={16}
                    className="admin-calendar__loading-icon"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2
                    size={16}
                    aria-hidden="true"
                  />
                )}

                {isDeleting
                  ? "Deleting..."
                  : "Delete"}
              </button>

              <button
                type="button"
                className="admin-calendar__edit-button"
                onClick={() =>
                  handleEditEvent(
                    selectedEvent,
                  )
                }
              >
                <Edit3
                  size={16}
                  aria-hidden="true"
                />

                Edit event
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

export default AdminCalendar;