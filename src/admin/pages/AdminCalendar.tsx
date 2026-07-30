import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import "../style/admin-calendar.css";

type CalendarDay = {
  date: Date;
  key: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
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

function AdminCalendar() {
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

  const calendarDays = useMemo(
    () =>
      createCalendarDays(
        currentDate,
        today,
      ),
    [currentDate, today],
  );

  const currentMonthLabel =
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(currentDate);

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
    setSelectedDate(
      selectedDate ?? new Date(),
    );

    // The create-event modal will be added later.
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
              create new events directly from the
              calendar.
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
        <button
          type="button"
          className="admin-calendar__today-button"
          onClick={goToToday}
        >
          Today
        </button>

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

      <div className="admin-calendar__card">
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

            return (
              <button
                key={day.key}
                type="button"
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
                aria-label={new Intl.DateTimeFormat(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                ).format(day.date)}
                aria-selected={isSelected}
                onClick={() =>
                  handleDaySelect(day)
                }
              >
                <span className="admin-calendar__day-number">
                  {day.dayNumber}
                </span>

                <span className="admin-calendar__day-content">
                  {isSelected
                    ? "Selected"
                    : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AdminCalendar;