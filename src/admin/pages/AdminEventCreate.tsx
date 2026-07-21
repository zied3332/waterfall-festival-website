import { ArrowLeft, CalendarPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import EventForm from "../components/EventForm";
import { createEvent } from "../../services/events.service";
import type { CreateEventInput } from "../../types/event";

import "../style/admin-event-form.css";

function AdminEventCreate() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleCreateEvent(
    eventData: CreateEventInput,
  ): Promise<void> {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      await createEvent(eventData);

      navigate("/admin/events", {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create the event.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-event-create">
      <header className="admin-event-create__header">
        <div>
          <Link
            to="/admin/events"
            className="admin-event-create__back"
          >
            <ArrowLeft size={17} />
            Back to events
          </Link>

          <div className="admin-event-create__heading">
            <span className="admin-event-create__icon">
              <CalendarPlus size={22} />
            </span>

            <div>
              <h1>Create Event</h1>
              <p>
                Add a new festival event to the admin
                dashboard and public website.
              </p>
            </div>
          </div>
        </div>
      </header>

      <EventForm
        submitLabel="Create Event"
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSubmit={handleCreateEvent}
      />
    </section>
  );
}

export default AdminEventCreate;