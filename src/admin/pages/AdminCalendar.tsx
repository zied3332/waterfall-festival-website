import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useState } from "react";

import "../style/admin-calendar.css";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function AdminCalendar() {
  const today = new Date();

  const [currentDate, setCurrentDate] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );

  const currentMonthLabel = `${
    MONTHS[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

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
    setCurrentDate(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );
  }

  function handleAddEvent(): void {
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

          <strong>{currentMonthLabel}</strong>

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

      <div className="admin-calendar__content">
        <div className="admin-calendar__placeholder">
          <CalendarDays
            size={30}
            aria-hidden="true"
          />

          <strong>
            Calendar grid coming next
          </strong>

          <p>
            The monthly calendar layout and event
            rendering will be added in the next
            step.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AdminCalendar;