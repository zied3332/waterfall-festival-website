import {
  AlertCircle,
  CalendarDays,
  Image,
  LoaderCircle,
  MapPin,
  Save,
  Ticket,
  Type,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  CreateEventInput,
  EventStatus,
} from "../../types/event";

import "../style/admin-event-form.css";

type EventFormValues = {
  title: string;
  description: string;
  date: string;
  location: string;
  heroImageUrl: string;
  capacity: string;
  remainingTickets: string;
  status: EventStatus;
};

type EventFormProps = {
  initialValues?: Partial<EventFormValues>;
  submitLabel?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  onSubmit: (
    eventData: CreateEventInput,
  ) => Promise<void> | void;
};

type FormErrors = Partial<
  Record<keyof EventFormValues, string>
>;

const defaultValues: EventFormValues = {
  title: "",
  description: "",
  date: "",
  location: "",
  heroImageUrl: "",
  capacity: "",
  remainingTickets: "",
  status: "DRAFT",
};

const statusOptions: Array<{
  value: EventStatus;
  label: string;
  description: string;
}> = [
  {
    value: "DRAFT",
    label: "Draft",
    description: "Hidden from the public website.",
  },
  {
    value: "PUBLISHED",
    label: "Published",
    description: "Visible on the public website.",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    description: "The event has been cancelled.",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description: "The event has already finished.",
  },
];

function EventForm({
  initialValues,
  submitLabel = "Create Event",
  isSubmitting = false,
  errorMessage = "",
  onSubmit,
}: EventFormProps) {
  const [formValues, setFormValues] =
    useState<EventFormValues>({
      ...defaultValues,
      ...initialValues,
    });

  const [formErrors, setFormErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    setFormValues({
      ...defaultValues,
      ...initialValues,
    });
  }, [initialValues]);

  function updateField<K extends keyof EventFormValues>(
    field: K,
    value: EventFormValues[K],
  ): void {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const errors: FormErrors = {};

    if (!formValues.title.trim()) {
      errors.title = "Event title is required.";
    }

    if (!formValues.description.trim()) {
      errors.description =
        "Event description is required.";
    }

    if (!formValues.date) {
      errors.date = "Event date is required.";
    } else {
      const eventDate = new Date(formValues.date);

      if (Number.isNaN(eventDate.getTime())) {
        errors.date = "Enter a valid event date.";
      }
    }

    if (!formValues.location.trim()) {
      errors.location = "Event location is required.";
    }

    if (formValues.heroImageUrl.trim()) {
      try {
        new URL(formValues.heroImageUrl);
      } catch {
        errors.heroImageUrl =
          "Enter a valid image URL.";
      }
    }

    if (formValues.capacity) {
      const capacity = Number(formValues.capacity);

      if (
        !Number.isInteger(capacity) ||
        capacity < 1
      ) {
        errors.capacity =
          "Capacity must be a whole number greater than 0.";
      }
    }

    if (formValues.remainingTickets) {
      const remainingTickets = Number(
        formValues.remainingTickets,
      );

      if (
        !Number.isInteger(remainingTickets) ||
        remainingTickets < 0
      ) {
        errors.remainingTickets =
          "Remaining tickets must be 0 or greater.";
      }

      if (
        formValues.capacity &&
        remainingTickets >
          Number(formValues.capacity)
      ) {
        errors.remainingTickets =
          "Remaining tickets cannot exceed capacity.";
      }
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const eventData: CreateEventInput = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      date: new Date(formValues.date).toISOString(),
      location: formValues.location.trim(),
      status: formValues.status,
    };

    const heroImageUrl =
      formValues.heroImageUrl.trim();

    if (heroImageUrl) {
      eventData.heroImageUrl = heroImageUrl;
    }

    if (formValues.capacity) {
      eventData.capacity = Number(
        formValues.capacity,
      );
    }

    if (formValues.remainingTickets) {
      eventData.remainingTickets = Number(
        formValues.remainingTickets,
      );
    }

    await onSubmit(eventData);
  }

  return (
    <form
      className="admin-event-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {errorMessage && (
        <div
          className="admin-event-form__error-banner"
          role="alert"
        >
          <AlertCircle size={20} />

          <div>
            <strong>Unable to save event</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="admin-event-form__grid">
        <section className="admin-event-form__section">
          <div className="admin-event-form__section-header">
            <div className="admin-event-form__section-icon">
              <Type size={20} />
            </div>

            <div>
              <h2>Event Information</h2>
              <p>
                Add the main details visitors will see.
              </p>
            </div>
          </div>

          <div className="admin-event-form__fields">
            <div className="admin-event-form__field admin-event-form__field--full">
              <label htmlFor="event-title">
                Event title
                <span>*</span>
              </label>

              <input
                id="event-title"
                type="text"
                placeholder="Example: Waterfall Festival 2026"
                value={formValues.title}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  formErrors.title,
                )}
              />

              {formErrors.title && (
                <small className="admin-event-form__field-error">
                  {formErrors.title}
                </small>
              )}
            </div>

            <div className="admin-event-form__field admin-event-form__field--full">
              <label htmlFor="event-description">
                Description
                <span>*</span>
              </label>

              <textarea
                id="event-description"
                rows={7}
                placeholder="Describe the event experience, music, atmosphere, and important details..."
                value={formValues.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  formErrors.description,
                )}
              />

              <div className="admin-event-form__field-footer">
                {formErrors.description ? (
                  <small className="admin-event-form__field-error">
                    {formErrors.description}
                  </small>
                ) : (
                  <small>
                    Add enough information for the
                    event details page.
                  </small>
                )}

                <small>
                  {formValues.description.length}
                  /2000
                </small>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-event-form__section">
          <div className="admin-event-form__section-header">
            <div className="admin-event-form__section-icon">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2>Date and Location</h2>
              <p>
                Choose when and where the event happens.
              </p>
            </div>
          </div>

          <div className="admin-event-form__fields">
            <div className="admin-event-form__field">
              <label htmlFor="event-date">
                Date and time
                <span>*</span>
              </label>

              <div className="admin-event-form__input-wrapper">
                <CalendarDays size={17} />

                <input
                  id="event-date"
                  type="datetime-local"
                  value={formValues.date}
                  onChange={(event) =>
                    updateField(
                      "date",
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    formErrors.date,
                  )}
                />
              </div>

              {formErrors.date && (
                <small className="admin-event-form__field-error">
                  {formErrors.date}
                </small>
              )}
            </div>

            <div className="admin-event-form__field">
              <label htmlFor="event-location">
                Location
                <span>*</span>
              </label>

              <div className="admin-event-form__input-wrapper">
                <MapPin size={17} />

                <input
                  id="event-location"
                  type="text"
                  placeholder="Koh Phangan, Thailand"
                  value={formValues.location}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    formErrors.location,
                  )}
                />
              </div>

              {formErrors.location && (
                <small className="admin-event-form__field-error">
                  {formErrors.location}
                </small>
              )}
            </div>
          </div>
        </section>

        <section className="admin-event-form__section">
          <div className="admin-event-form__section-header">
            <div className="admin-event-form__section-icon">
              <Image size={20} />
            </div>

            <div>
              <h2>Event Image</h2>
              <p>
                Add the image displayed on event pages.
              </p>
            </div>
          </div>

          <div className="admin-event-form__fields">
            <div className="admin-event-form__field admin-event-form__field--full">
              <label htmlFor="event-image">
                Hero image URL
              </label>

              <div className="admin-event-form__input-wrapper">
                <Image size={17} />

                <input
                  id="event-image"
                  type="url"
                  placeholder="https://example.com/event-image.jpg"
                  value={formValues.heroImageUrl}
                  onChange={(event) =>
                    updateField(
                      "heroImageUrl",
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    formErrors.heroImageUrl,
                  )}
                />
              </div>

              {formErrors.heroImageUrl && (
                <small className="admin-event-form__field-error">
                  {formErrors.heroImageUrl}
                </small>
              )}

              {formValues.heroImageUrl &&
                !formErrors.heroImageUrl && (
                  <div className="admin-event-form__image-preview">
                    <img
                      src={formValues.heroImageUrl}
                      alt="Event preview"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}
            </div>
          </div>
        </section>

        <section className="admin-event-form__section">
          <div className="admin-event-form__section-header">
            <div className="admin-event-form__section-icon">
              <Ticket size={20} />
            </div>

            <div>
              <h2>Tickets and Capacity</h2>
              <p>
                Configure the available ticket numbers.
              </p>
            </div>
          </div>

          <div className="admin-event-form__fields">
            <div className="admin-event-form__field">
              <label htmlFor="event-capacity">
                Total capacity
              </label>

              <input
                id="event-capacity"
                type="number"
                min="1"
                step="1"
                placeholder="2500"
                value={formValues.capacity}
                onChange={(event) =>
                  updateField(
                    "capacity",
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  formErrors.capacity,
                )}
              />

              {formErrors.capacity && (
                <small className="admin-event-form__field-error">
                  {formErrors.capacity}
                </small>
              )}
            </div>

            <div className="admin-event-form__field">
              <label htmlFor="event-remaining-tickets">
                Remaining tickets
              </label>

              <input
                id="event-remaining-tickets"
                type="number"
                min="0"
                step="1"
                placeholder="2500"
                value={formValues.remainingTickets}
                onChange={(event) =>
                  updateField(
                    "remainingTickets",
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  formErrors.remainingTickets,
                )}
              />

              {formErrors.remainingTickets && (
                <small className="admin-event-form__field-error">
                  {formErrors.remainingTickets}
                </small>
              )}
            </div>
          </div>
        </section>

        <section className="admin-event-form__section admin-event-form__section--status">
          <div className="admin-event-form__section-header">
            <div className="admin-event-form__section-icon">
              <Save size={20} />
            </div>

            <div>
              <h2>Publication Status</h2>
              <p>
                Choose whether the event is public.
              </p>
            </div>
          </div>

          <div className="admin-event-form__status-options">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className={
                  formValues.status === option.value
                    ? "admin-event-form__status-option admin-event-form__status-option--selected"
                    : "admin-event-form__status-option"
                }
              >
                <input
                  type="radio"
                  name="event-status"
                  value={option.value}
                  checked={
                    formValues.status === option.value
                  }
                  onChange={() =>
                    updateField(
                      "status",
                      option.value,
                    )
                  }
                  disabled={isSubmitting}
                />

                <span className="admin-event-form__status-radio" />

                <span className="admin-event-form__status-content">
                  <strong>{option.label}</strong>
                  <small>
                    {option.description}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="admin-event-form__actions">
        <p>
          Fields marked with <span>*</span> are required.
        </p>

        <button
          type="submit"
          className="admin-event-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle
                className="admin-event-form__spinner"
                size={18}
              />
              Saving event...
            </>
          ) : (
            <>
              <Save size={18} />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default EventForm;