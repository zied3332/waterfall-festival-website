import {
  AlertCircle,
  CalendarDays,
  FileImage,
  FileText,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Save,
  Settings2,
  Ticket,
  Users,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  CreateEventInput,
  EventStatus,
} from "../../types/event";

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

type EventFormValues = {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: string;
  remainingTickets: string;
  status: EventStatus;
};

type EventFormErrors =
  Partial<Record<keyof EventFormValues, string>> & {
    heroImage?: string;
  };

type EventFormProps = {
  initialValues?: Partial<EventFormValues>;
  currentImageUrl?: string | null;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (
    eventData: CreateEventInput,
    heroImageFile: File | null,
  ) => Promise<void>;
};

const DEFAULT_VALUES: EventFormValues = {
  title: "",
  description: "",
  date: "",
  location: "",
  capacity: "",
  remainingTickets: "",
  status: "DRAFT",
};

const STATUS_OPTIONS: Array<{
  value: EventStatus;
  label: string;
  description: string;
}> = [
  {
    value: "DRAFT",
    label: "Draft",
    description:
      "Keep this event hidden from the public website.",
  },
  {
    value: "PUBLISHED",
    label: "Published",
    description:
      "Display this event on the public website.",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    description:
      "Mark the event as cancelled.",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description:
      "Mark the event as finished.",
  },
];

function EventForm({
  initialValues,
  currentImageUrl,
  submitLabel,
  isSubmitting,
  errorMessage = "",
  onSubmit,
}: EventFormProps) {
  const [values, setValues] =
    useState<EventFormValues>({
      ...DEFAULT_VALUES,
      ...initialValues,
    });

  const [errors, setErrors] =
    useState<EventFormErrors>({});

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [localPreviewUrl, setLocalPreviewUrl] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValues({
      ...DEFAULT_VALUES,
      ...initialValues,
    });
  }, [initialValues]);

  useEffect(() => {
    if (!selectedImage) {
      setLocalPreviewUrl(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(selectedImage);

    setLocalPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  function updateValue(
    field: keyof EventFormValues,
    value: string,
  ): void {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const file =
      event.target.files?.[0] ?? null;

    setErrors((currentErrors) => ({
      ...currentErrors,
      heroImage: undefined,
    }));

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setSelectedImage(null);

      setErrors((currentErrors) => ({
        ...currentErrors,
        heroImage:
          "Only JPG, PNG, WebP and AVIF images are allowed.",
      }));

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setSelectedImage(null);

      setErrors((currentErrors) => ({
        ...currentErrors,
        heroImage:
          "The selected image must be 5 MB or smaller.",
      }));

      event.target.value = "";
      return;
    }

    setSelectedImage(file);
  }

  function removeSelectedImage(): void {
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function validateForm(): boolean {
    const nextErrors: EventFormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title =
        "Event title is required.";
    }

    if (!values.description.trim()) {
      nextErrors.description =
        "Event description is required.";
    }

    if (!values.date) {
      nextErrors.date =
        "Event date is required.";
    }

    if (!values.location.trim()) {
      nextErrors.location =
        "Event location is required.";
    }

    const capacity = values.capacity
      ? Number(values.capacity)
      : undefined;

    const remainingTickets =
      values.remainingTickets
        ? Number(values.remainingTickets)
        : undefined;

    if (
      capacity !== undefined &&
      (!Number.isInteger(capacity) ||
        capacity < 0)
    ) {
      nextErrors.capacity =
        "Capacity must be a positive whole number.";
    }

    if (
      remainingTickets !== undefined &&
      (!Number.isInteger(remainingTickets) ||
        remainingTickets < 0)
    ) {
      nextErrors.remainingTickets =
        "Remaining tickets must be a positive whole number.";
    }

    if (
      capacity !== undefined &&
      remainingTickets !== undefined &&
      remainingTickets > capacity
    ) {
      nextErrors.remainingTickets =
        "Remaining tickets cannot exceed capacity.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isSubmitting || !validateForm()) {
      return;
    }

    const capacity = values.capacity
      ? Number(values.capacity)
      : undefined;

    const remainingTickets =
      values.remainingTickets
        ? Number(values.remainingTickets)
        : undefined;

    const eventData: CreateEventInput = {
      title: values.title.trim(),
      description:
        values.description.trim(),
      date: values.date,
      location: values.location.trim(),
      status: values.status,
      ...(capacity !== undefined && {
        capacity,
      }),
      ...(remainingTickets !== undefined && {
        remainingTickets,
      }),
    };

    await onSubmit(
      eventData,
      selectedImage,
    );
  }

  const displayedImageUrl =
    localPreviewUrl ?? currentImageUrl ?? null;

  return (
    <form
      className="admin-event-form"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      noValidate
    >
      <div className="admin-event-form__grid">
        <section className="admin-event-form__section">
          <header className="admin-event-form__section-header">
            <span className="admin-event-form__section-icon">
              <FileText
                size={18}
                aria-hidden="true"
              />
            </span>

            <div>
              <h2>Event information</h2>

              <p>
                Configure the public event name,
                description and location.
              </p>
            </div>
          </header>

          <div className="admin-event-form__fields">
            <div className="admin-event-form__field admin-event-form__field--full">
              <label htmlFor="event-title">
                Event title
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <input
                id="event-title"
                type="text"
                value={values.title}
                onChange={(event) => {
                  updateValue(
                    "title",
                    event.target.value,
                  );
                }}
                placeholder="Waterfall Festival 2026"
                disabled={isSubmitting}
                aria-invalid={
                  Boolean(errors.title)
                }
                aria-describedby={
                  errors.title
                    ? "event-title-error"
                    : undefined
                }
              />

              {errors.title && (
                <small
                  id="event-title-error"
                  className="admin-event-form__field-error"
                >
                  {errors.title}
                </small>
              )}
            </div>

            <div className="admin-event-form__field admin-event-form__field--full">
              <label htmlFor="event-description">
                Description
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <textarea
                id="event-description"
                value={values.description}
                onChange={(event) => {
                  updateValue(
                    "description",
                    event.target.value,
                  );
                }}
                placeholder="Describe the event experience..."
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  errors.description,
                )}
                aria-describedby={
                  errors.description
                    ? "event-description-error"
                    : undefined
                }
              />

              <div className="admin-event-form__field-footer">
                <small>
                  Explain what visitors can
                  expect from this event.
                </small>

                <small>
                  {values.description.length}
                  {" characters"}
                </small>
              </div>

              {errors.description && (
                <small
                  id="event-description-error"
                  className="admin-event-form__field-error"
                >
                  {errors.description}
                </small>
              )}
            </div>

            <div className="admin-event-form__field">
              <label htmlFor="event-date">
                Date and time
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <div className="admin-event-form__input-wrapper">
                <CalendarDays
                  size={16}
                  aria-hidden="true"
                />

                <input
                  id="event-date"
                  type="datetime-local"
                  value={values.date}
                  onChange={(event) => {
                    updateValue(
                      "date",
                      event.target.value,
                    );
                  }}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    errors.date,
                  )}
                />
              </div>

              {errors.date && (
                <small className="admin-event-form__field-error">
                  {errors.date}
                </small>
              )}
            </div>

            <div className="admin-event-form__field">
              <label htmlFor="event-location">
                Location
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <div className="admin-event-form__input-wrapper">
                <MapPin
                  size={16}
                  aria-hidden="true"
                />

                <input
                  id="event-location"
                  type="text"
                  value={values.location}
                  onChange={(event) => {
                    updateValue(
                      "location",
                      event.target.value,
                    );
                  }}
                  placeholder="Koh Phangan, Thailand"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    errors.location,
                  )}
                />
              </div>

              {errors.location && (
                <small className="admin-event-form__field-error">
                  {errors.location}
                </small>
              )}
            </div>
          </div>
        </section>

        <section className="admin-event-form__section">
          <header className="admin-event-form__section-header">
            <span className="admin-event-form__section-icon">
              <ImagePlus
                size={18}
                aria-hidden="true"
              />
            </span>

            <div>
              <h2>Hero image</h2>

              <p>
                Upload the image shown on event
                cards and the event details page.
              </p>
            </div>
          </header>

          <div className="admin-event-form__field">
            <label htmlFor="event-hero-image">
              Event image
            </label>

            <input
              ref={fileInputRef}
              id="event-hero-image"
              className="admin-event-form__file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
              onChange={handleImageChange}
              disabled={isSubmitting}
              aria-invalid={Boolean(
                errors.heroImage,
              )}
              aria-describedby="event-image-help"
            />

            <small id="event-image-help">
              JPG, PNG, WebP or AVIF. Maximum
              file size: 5 MB.
            </small>

            {errors.heroImage && (
              <small className="admin-event-form__field-error">
                {errors.heroImage}
              </small>
            )}
          </div>

          {displayedImageUrl ? (
            <div className="admin-event-form__image-card">
              <div className="admin-event-form__image-preview">
                <img
                  src={displayedImageUrl}
                  alt={
                    localPreviewUrl
                      ? "Preview of newly selected event image"
                      : "Current saved event hero"
                  }
                />

                <span className="admin-event-form__image-badge">
                  {localPreviewUrl
                    ? "New image preview"
                    : "Current saved image"}
                </span>
              </div>

              {selectedImage && (
                <div className="admin-event-form__selected-file">
                  <div>
                    <FileImage
                      size={16}
                      aria-hidden="true"
                    />

                    <span>
                      {selectedImage.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeSelectedImage
                    }
                    disabled={isSubmitting}
                  >
                    Remove selection
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="admin-event-form__image-empty">
              <ImagePlus
                size={26}
                aria-hidden="true"
              />

              <strong>
                No event image selected
              </strong>

              <p>
                Choose an image file to preview
                it before saving.
              </p>
            </div>
          )}
        </section>

        <section className="admin-event-form__section">
          <header className="admin-event-form__section-header">
            <span className="admin-event-form__section-icon">
              <Ticket
                size={18}
                aria-hidden="true"
              />
            </span>

            <div>
              <h2>Availability</h2>

              <p>
                Configure capacity and remaining
                ticket information.
              </p>
            </div>
          </header>

          <div className="admin-event-form__fields">
            <div className="admin-event-form__field">
              <label htmlFor="event-capacity">
                Capacity
              </label>

              <div className="admin-event-form__input-wrapper">
                <Users
                  size={16}
                  aria-hidden="true"
                />

                <input
                  id="event-capacity"
                  type="number"
                  min="0"
                  step="1"
                  value={values.capacity}
                  onChange={(event) => {
                    updateValue(
                      "capacity",
                      event.target.value,
                    );
                  }}
                  placeholder="1000"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    errors.capacity,
                  )}
                />
              </div>

              {errors.capacity && (
                <small className="admin-event-form__field-error">
                  {errors.capacity}
                </small>
              )}
            </div>

            <div className="admin-event-form__field">
              <label htmlFor="remaining-tickets">
                Remaining tickets
              </label>

              <div className="admin-event-form__input-wrapper">
                <Ticket
                  size={16}
                  aria-hidden="true"
                />

                <input
                  id="remaining-tickets"
                  type="number"
                  min="0"
                  step="1"
                  value={
                    values.remainingTickets
                  }
                  onChange={(event) => {
                    updateValue(
                      "remainingTickets",
                      event.target.value,
                    );
                  }}
                  placeholder="800"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    errors.remainingTickets,
                  )}
                />
              </div>

              {errors.remainingTickets && (
                <small className="admin-event-form__field-error">
                  {errors.remainingTickets}
                </small>
              )}
            </div>
          </div>
        </section>

        <section className="admin-event-form__section admin-event-form__section--status">
          <header className="admin-event-form__section-header">
            <span className="admin-event-form__section-icon">
              <Settings2
                size={18}
                aria-hidden="true"
              />
            </span>

            <div>
              <h2>Publishing status</h2>

              <p>
                Control how this event appears
                in the administration dashboard
                and public website.
              </p>
            </div>
          </header>

          <div className="admin-event-form__status-options">
            {STATUS_OPTIONS.map((option) => {
              const isSelected =
                values.status === option.value;

              return (
                <label
                  key={option.value}
                  className={[
                    "admin-event-form__status-option",
                    isSelected
                      ? "admin-event-form__status-option--selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="event-status"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => {
                      updateValue(
                        "status",
                        option.value,
                      );
                    }}
                    disabled={isSubmitting}
                  />

                  <span
                    className="admin-event-form__status-radio"
                    aria-hidden="true"
                  />

                  <span className="admin-event-form__status-content">
                    <strong>
                      {option.label}
                    </strong>

                    <small>
                      {option.description}
                    </small>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      </div>

      {errorMessage && (
        <div
          className="admin-event-form__error-banner"
          role="alert"
        >
          <AlertCircle
            size={18}
            aria-hidden="true"
          />

          <div>
            <strong>
              Unable to save event
            </strong>

            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <footer className="admin-event-form__actions">
        <p>
          Fields marked with
          <span> *</span> are required.
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
                size={16}
                aria-hidden="true"
              />

              Saving...
            </>
          ) : (
            <>
              <Save
                size={16}
                aria-hidden="true"
              />

              {submitLabel}
            </>
          )}
        </button>
      </footer>
    </form>
  );
}

export default EventForm;