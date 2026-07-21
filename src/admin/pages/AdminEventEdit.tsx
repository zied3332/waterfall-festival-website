import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import EventForm from "../components/EventForm";

import {
  getAdminEvents,
  updateEvent,
} from "../../services/events.service";

import type {
  CreateEventInput,
  Event,
} from "../../types/event";

import "../style/admin-event-edit.css";

type EventFormInitialValues = {
  title: string;
  description: string;
  date: string;
  location: string;
  heroImageUrl: string;
  capacity: string;
  remainingTickets: string;
  status: Event["status"];
};

function formatDateForInput(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const timezoneOffset =
    parsedDate.getTimezoneOffset() * 60_000;

  return new Date(
    parsedDate.getTime() - timezoneOffset,
  )
    .toISOString()
    .slice(0, 16);
}

function createInitialValues(
  event: Event,
): EventFormInitialValues {
  return {
    title: event.title,
    description: event.description,
    date: formatDateForInput(event.date),
    location: event.location,
    heroImageUrl: event.heroImageUrl ?? "",
    capacity:
      event.capacity !== null
        ? String(event.capacity)
        : "",
    remainingTickets:
      event.remainingTickets !== null
        ? String(event.remainingTickets)
        : "",
    status: event.status,
  };
}

function AdminEventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] =
    useState<Event | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadEvent(): Promise<void> {
      const eventId = Number(id);

      if (
        !id ||
        !Number.isInteger(eventId) ||
        eventId < 1
      ) {
        setLoadError("The event ID is invalid.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const events = await getAdminEvents();

        if (isCancelled) {
          return;
        }

        const selectedEvent = events.find(
          (item) => item.id === eventId,
        );

        if (!selectedEvent) {
          setLoadError(
            "The requested event could not be found.",
          );
          return;
        }

        setEvent(selectedEvent);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load the event.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  async function handleUpdateEvent(
    eventData: CreateEventInput,
  ): Promise<void> {
    if (!event) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await updateEvent(event.id, eventData);

      navigate("/admin/events", {
        replace: true,
        state: {
          successMessage: `"${eventData.title}" was updated successfully.`,
        },
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to update the event.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="admin-event-edit">
        <div className="admin-event-edit__state">
          <LoaderCircle
            className="admin-event-edit__spinner"
            size={30}
          />

          <h2>Loading event</h2>

          <p>
            Retrieving the latest event information.
          </p>
        </div>
      </section>
    );
  }

  if (loadError || !event) {
    return (
      <section className="admin-event-edit">
        <div className="admin-event-edit__state admin-event-edit__state--error">
          <AlertCircle size={32} />

          <h2>Unable to open event</h2>

          <p>
            {loadError ||
              "The requested event could not be found."}
          </p>

          <Link
            to="/admin/events"
            className="admin-event-edit__return"
          >
            <ArrowLeft size={17} />
            Return to events
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-event-edit">
      <header className="admin-event-edit__header">
        <Link
          to="/admin/events"
          className="admin-event-edit__back"
        >
          <ArrowLeft size={17} />
          Back to events
        </Link>

        <div className="admin-event-edit__heading">
          <span className="admin-event-edit__icon">
            <Pencil size={22} />
          </span>

          <div>
            <p className="admin-event-edit__eyebrow">
              Event #{event.id}
            </p>

            <h1>Edit Event</h1>

            <p className="admin-event-edit__description">
              Update the event information, ticket
              availability, image, and publication status.
            </p>
          </div>
        </div>
      </header>

      <EventForm
        initialValues={createInitialValues(event)}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        errorMessage={submitError}
        onSubmit={handleUpdateEvent}
      />
    </section>
  );
}

export default AdminEventEdit;