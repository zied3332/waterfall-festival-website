import {
  ArrowLeft,
  CalendarPlus,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import EventForm from "../components/EventForm";

import {
  createEvent,
} from "../../services/events.service";

import type {
  CreateEventInput,
} from "../../types/event";

import "../style/admin-event-form.css";

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
    return "Unable to create the event.";
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

  return "Unable to create the event.";
}

function AdminEventCreate() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleCreateEvent(
    eventData: CreateEventInput,
  ): Promise<void> {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await createEvent(eventData);

      navigate("/admin/events", {
        replace: true,
      });
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="admin-event-create"
      aria-labelledby="create-event-title"
    >
      <header className="admin-event-create__header">
        <Link
          to="/admin/events"
          className="admin-event-create__back"
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
          />

          Back to events
        </Link>

        <div className="admin-event-create__heading">
          <span
            className="admin-event-create__icon"
            aria-hidden="true"
          >
            <CalendarPlus size={21} />
          </span>

          <div className="admin-event-create__copy">
            <span className="admin-event-create__eyebrow">
              Event management
            </span>

            <h1 id="create-event-title">
              Create event
            </h1>

            <p>
              Add a festival event and configure
              the information displayed on the
              public website.
            </p>
          </div>
        </div>
      </header>

      <EventForm
        submitLabel="Create event"
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSubmit={handleCreateEvent}
      />
    </section>
  );
}

export default AdminEventCreate;