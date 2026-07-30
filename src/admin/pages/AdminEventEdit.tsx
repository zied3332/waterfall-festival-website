import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  Pencil,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import EventForm from "../components/EventForm";

import {
  getAdminEvent,
  updateEvent,
  uploadEventHeroImage,
} from "../../services/events.service";

import type {
  CreateEventInput,
  Event,
} from "../../types/event";

import "../style/admin-event-edit.css";

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
    return responseMessage.join(" ");
  }

  if (typeof responseMessage === "string") {
    return responseMessage;
  }

  if (typeof apiError.message === "string") {
    return apiError.message;
  }

  return fallbackMessage;
}

function formatDateForInput(
  date: string,
): string {
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

function AdminEventEdit() {
  const { id } = useParams<{
    id: string;
  }>();

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

  const eventId = useMemo(() => {
    const parsedId = Number(id);

    if (
      !id ||
      !Number.isInteger(parsedId) ||
      parsedId < 1
    ) {
      return null;
    }

    return parsedId;
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    async function loadEvent(): Promise<void> {
      if (eventId === null) {
        setLoadError(
          "The event ID is invalid.",
        );

        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const selectedEvent =
          await getAdminEvent(eventId);

        if (isCancelled) {
          return;
        }

        setEvent(selectedEvent);
      } catch (error: unknown) {
        if (isCancelled) {
          return;
        }

        setLoadError(
          getErrorMessage(
            error,
            "Unable to load the event.",
          ),
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
  }, [eventId]);

  const initialValues = useMemo(() => {
    if (!event) {
      return undefined;
    }

    return {
      title: event.title,
      description: event.description,
      date: formatDateForInput(
        event.date,
      ),
      location: event.location,
      capacity:
        event.capacity !== null
          ? String(event.capacity)
          : "",
      remainingTickets:
        event.remainingTickets !== null
          ? String(
              event.remainingTickets,
            )
          : "",
      status: event.status,
    };
  }, [event]);

  async function handleUpdateEvent(
    eventData: CreateEventInput,
    heroImageFile: File | null,
  ): Promise<void> {
    if (!event || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await updateEvent(
        event.id,
        eventData,
      );

      if (heroImageFile) {
        await uploadEventHeroImage(
          event.id,
          heroImageFile,
        );
      }

      navigate("/admin/events", {
        replace: true,
        state: {
          successMessage: `"${eventData.title}" was updated successfully.`,
        },
      });
    } catch (error: unknown) {
      setSubmitError(
        getErrorMessage(
          error,
          "Unable to update the event.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section
        className="admin-event-edit"
        aria-live="polite"
      >
        <div className="admin-event-edit__state">
          <LoaderCircle
            className="admin-event-edit__spinner"
            size={28}
            aria-hidden="true"
          />

          <h2>Loading event</h2>

          <p>
            Retrieving the latest event
            information.
          </p>
        </div>
      </section>
    );
  }

  if (loadError || !event) {
    return (
      <section className="admin-event-edit">
        <div
          className="admin-event-edit__state admin-event-edit__state--error"
          role="alert"
        >
          <AlertCircle
            size={30}
            aria-hidden="true"
          />

          <h2>Unable to open event</h2>

          <p>
            {loadError ||
              "The requested event could not be found."}
          </p>

          <Link
            to="/admin/events"
            className="admin-event-edit__return"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
            />

            Return to events
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="admin-event-edit"
      aria-labelledby="edit-event-title"
    >
      <header className="admin-event-edit__header">
        <Link
          to="/admin/events"
          className="admin-event-edit__back"
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
          />

          Back to events
        </Link>

        <div className="admin-event-edit__heading">
          <span
            className="admin-event-edit__icon"
            aria-hidden="true"
          >
            <Pencil size={20} />
          </span>

          <div className="admin-event-edit__copy">
            <span className="admin-event-edit__eyebrow">
              Event #{event.id}
            </span>

            <h1 id="edit-event-title">
              Edit event
            </h1>

            <p className="admin-event-edit__description">
              Update the event details,
              availability, image and publishing
              status shown on the public website.
            </p>
          </div>
        </div>
      </header>

      <EventForm
        initialValues={initialValues}
        currentImageUrl={
          event.heroImageUrl
        }
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        errorMessage={submitError}
        onSubmit={handleUpdateEvent}
      />
    </section>
  );
}

export default AdminEventEdit;