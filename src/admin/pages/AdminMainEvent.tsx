import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  MapPin,
  RefreshCw,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

import {
  getAdminEvents,
} from "../../services/events.service";

import type {
  Event,
} from "../../types/event";

import "../style/admin-main-event.css";

type MainEventMode =
  | "AUTOMATIC"
  | "MANUAL";

type MainEventFormState = {
  mode: MainEventMode;
  manualEventId: number | null;
  autoSwitchHours: number;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

const FESTIVAL_TIME_ZONE =
  "Asia/Bangkok";

const DEFAULT_SWITCH_HOURS = 8;

const initialSettings: MainEventFormState = {
  mode: "AUTOMATIC",
  manualEventId: null,
  autoSwitchHours:
    DEFAULT_SWITCH_HOURS,
};

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallbackMessage;
}

function getEventDate(
  value: string,
): Date | null {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}

function formatEventDate(
  value: string,
): string {
  const date =
    getEventDate(value);

  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        FESTIVAL_TIME_ZONE,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function formatEventTime(
  value: string,
): string {
  const date =
    getEventDate(value);

  if (!date) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        FESTIVAL_TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  ).format(date);
}

function formatDateTime(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        FESTIVAL_TIME_ZONE,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  ).format(date);
}

function getStatusLabel(
  status: string,
): string {
  const normalized =
    status
      .trim()
      .toLowerCase();

  return (
    normalized
      .charAt(0)
      .toUpperCase() +
    normalized.slice(1)
  );
}

function AdminMainEvent() {
  const [
    events,
    setEvents,
  ] = useState<Event[]>([]);

  const [
    settings,
    setSettings,
  ] =
    useState<MainEventFormState>(
      initialSettings,
    );

  const [
    savedSettings,
    setSavedSettings,
  ] =
    useState<MainEventFormState>(
      initialSettings,
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState<string | null>(
    null,
  );

  const [
    feedback,
    setFeedback,
  ] =
    useState<Feedback | null>(
      null,
    );

  const publishedEvents =
    useMemo(
      () =>
        events
          .filter(
            (event) =>
              event.status ===
              "PUBLISHED",
          )
          .sort(
            (
              firstEvent,
              secondEvent,
            ) =>
              new Date(
                firstEvent.date,
              ).getTime() -
              new Date(
                secondEvent.date,
              ).getTime(),
          ),
      [events],
    );

  const automaticEvent =
    useMemo(() => {
      const now =
        Date.now();

      const switchDelay =
        settings.autoSwitchHours *
        60 *
        60 *
        1000;

      return (
        publishedEvents.find(
          (event) => {
            const eventTime =
              new Date(
                event.date,
              ).getTime();

            return (
              eventTime +
                switchDelay >
              now
            );
          },
        ) ??
        publishedEvents[
          publishedEvents.length -
            1
        ] ??
        null
      );
    }, [
      publishedEvents,
      settings.autoSwitchHours,
    ]);

  const manualEvent =
    useMemo(
      () =>
        publishedEvents.find(
          (event) =>
            event.id ===
            settings.manualEventId,
        ) ?? null,
      [
        publishedEvents,
        settings.manualEventId,
      ],
    );

  const displayedEvent =
    settings.mode === "MANUAL"
      ? manualEvent
      : automaticEvent;

  const nextEvent =
    useMemo(() => {
      if (!displayedEvent) {
        return null;
      }

      return (
        publishedEvents.find(
          (event) =>
            new Date(
              event.date,
            ).getTime() >
            new Date(
              displayedEvent.date,
            ).getTime(),
        ) ?? null
      );
    }, [
      displayedEvent,
      publishedEvents,
    ]);

  const automaticSwitchDate =
    useMemo(() => {
      if (
        !automaticEvent
      ) {
        return null;
      }

      const date =
        getEventDate(
          automaticEvent.date,
        );

      if (!date) {
        return null;
      }

      return new Date(
        date.getTime() +
          settings.autoSwitchHours *
            60 *
            60 *
            1000,
      );
    }, [
      automaticEvent,
      settings.autoSwitchHours,
    ]);

  const hasUnsavedChanges =
    useMemo(
      () =>
        JSON.stringify(
          settings,
        ) !==
        JSON.stringify(
          savedSettings,
        ),
      [
        savedSettings,
        settings,
      ],
    );

  async function loadEvents() {
    try {
      setIsLoading(true);
      setLoadError(null);
      setFeedback(null);

      const response =
        await getAdminEvents();

      setEvents(response);

      const published =
        response
          .filter(
            (event) =>
              event.status ===
              "PUBLISHED",
          )
          .sort(
            (
              firstEvent,
              secondEvent,
            ) =>
              new Date(
                firstEvent.date,
              ).getTime() -
              new Date(
                secondEvent.date,
              ).getTime(),
          );

      if (
        published.length > 0
      ) {
        const firstEvent =
          published[0];

        setSettings(
          (current) => ({
            ...current,
            manualEventId:
              current.manualEventId ??
              firstEvent.id,
          }),
        );

        setSavedSettings(
          (current) => ({
            ...current,
            manualEventId:
              current.manualEventId ??
              firstEvent.id,
          }),
        );
      }
    } catch (error) {
      setLoadError(
        getErrorMessage(
          error,
          "Could not load festival events.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  function selectMode(
    mode: MainEventMode,
  ) {
    setSettings(
      (current) => ({
        ...current,
        mode,
      }),
    );

    setFeedback(null);
  }

  function handleManualEventChange(
    eventId: string,
  ) {
    const parsedId =
      Number(eventId);

    setSettings(
      (current) => ({
        ...current,
        manualEventId:
          Number.isFinite(
            parsedId,
          )
            ? parsedId
            : null,
      }),
    );

    setFeedback(null);
  }

  function handleSwitchHoursChange(
    value: string,
  ) {
    const parsedValue =
      Number(value);

    const safeValue =
      Number.isFinite(
        parsedValue,
      )
        ? Math.min(
            48,
            Math.max(
              0,
              parsedValue,
            ),
          )
        : 0;

    setSettings(
      (current) => ({
        ...current,
        autoSwitchHours:
          safeValue,
      }),
    );

    setFeedback(null);
  }

  function handleDiscard() {
    setSettings(
      savedSettings,
    );

    setFeedback(null);
  }

  async function handleSave() {
    if (
      !hasUnsavedChanges ||
      isSaving
    ) {
      return;
    }

    if (
      settings.mode ===
        "MANUAL" &&
      !settings.manualEventId
    ) {
      setFeedback({
        type: "error",
        message:
          "Choose an event before enabling Manual mode.",
      });

      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      /*
       * FRONTEND PHASE ONLY.
       *
       * We will replace this with the
       * backend settings request after
       * the Main Event backend API is
       * connected.
       */

      await Promise.resolve();

      setSavedSettings({
        ...settings,
      });

      setFeedback({
        type: "success",
        message:
          "Main event configuration saved locally. Backend connection will be added next.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          getErrorMessage(
            error,
            "Could not save the main event configuration.",
          ),
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="admin-main-event">
        <div className="admin-main-event__loading">
          <LoaderCircle
            size={25}
            className="admin-main-event__spinner"
          />

          <strong>
            Loading main event
          </strong>

          <span>
            Getting published
            festival events...
          </span>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="admin-main-event">
        <div className="admin-main-event__feedback admin-main-event__feedback--error">
          <AlertCircle
            size={18}
          />

          <span>
            {loadError}
          </span>

          <button
            type="button"
            onClick={() =>
              void loadEvents()
            }
          >
            <RefreshCw
              size={15}
            />

            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-main-event">
      <header className="admin-main-event__header">
        <div className="admin-main-event__heading">
          <span
            className="admin-main-event__heading-icon"
            aria-hidden="true"
          >
            <Star size={21} />
          </span>

          <div>
            <span className="admin-main-event__eyebrow">
              Homepage management
            </span>

            <h1>
              Main Event
            </h1>

            <p>
              Choose which festival
              event is featured on the
              homepage or let the
              website manage it
              automatically.
            </p>
          </div>
        </div>

        <div className="admin-main-event__header-actions">
          <div className="admin-main-event__save-state">
            <CheckCircle2
              size={16}
            />

            <div>
              <strong>
                {hasUnsavedChanges
                  ? "Unsaved changes"
                  : "Configuration saved"}
              </strong>

              <span>
                {settings.mode ===
                "AUTOMATIC"
                  ? "Automatic mode"
                  : "Manual mode"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="admin-main-event__secondary-button"
            disabled={
              !hasUnsavedChanges ||
              isSaving
            }
            onClick={
              handleDiscard
            }
          >
            <RotateCcw
              size={16}
            />

            Discard
          </button>

          <button
            type="button"
            className="admin-main-event__save-button"
            disabled={
              !hasUnsavedChanges ||
              isSaving
            }
            onClick={() =>
              void handleSave()
            }
          >
            {isSaving ? (
              <LoaderCircle
                size={16}
                className="admin-main-event__spinner"
              />
            ) : (
              <Save
                size={16}
              />
            )}

            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </header>

      {feedback && (
        <div
          className={`admin-main-event__feedback admin-main-event__feedback--${feedback.type}`}
          role={
            feedback.type ===
            "error"
              ? "alert"
              : "status"
          }
        >
          {feedback.type ===
          "success" ? (
            <CheckCircle2
              size={17}
            />
          ) : (
            <AlertCircle
              size={17}
            />
          )}

          <span>
            {feedback.message}
          </span>
        </div>
      )}

      <div className="admin-main-event__section">
        <div className="admin-main-event__section-header">
          <span className="admin-main-event__section-icon">
            <Sparkles
              size={17}
            />
          </span>

          <div>
            <h2>
              Currently displayed
            </h2>

            <p>
              This is the event that
              would currently be
              featured on the
              homepage.
            </p>
          </div>

          <span className="admin-main-event__live-badge">
            <span />

            Homepage
          </span>
        </div>

        <div className="admin-main-event__section-content">
          {displayedEvent ? (
            <article className="admin-main-event__current-event">
              <div className="admin-main-event__poster">
                {displayedEvent.heroImageUrl ? (
                  <img
                    src={
                      displayedEvent.heroImageUrl
                    }
                    alt=""
                    onError={(
                      event,
                    ) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <Star
                    size={30}
                  />
                )}
              </div>

              <div className="admin-main-event__event-info">
                <div className="admin-main-event__event-top">
                  <div>
                    <span className="admin-main-event__event-label">
                      Featured
                      event
                    </span>

                    <h3>
                      {
                        displayedEvent.title
                      }
                    </h3>
                  </div>

                  <span
                    className={`admin-main-event__status admin-main-event__status--${displayedEvent.status.toLowerCase()}`}
                  >
                    {
                      getStatusLabel(
                        displayedEvent.status,
                      )
                    }
                  </span>
                </div>

                <div className="admin-main-event__event-meta">
                  <span>
                    <CalendarDays
                      size={15}
                    />

                    {formatEventDate(
                      displayedEvent.date,
                    )}
                  </span>

                  <span>
                    <Clock3
                      size={15}
                    />

                    {formatEventTime(
                      displayedEvent.date,
                    )}

                    {" "}
                    Thailand
                  </span>

                  <span>
                    <MapPin
                      size={15}
                    />

                    {
                      displayedEvent.location
                    }
                  </span>
                </div>

                <div className="admin-main-event__event-footer">
                  <span>
                    Selection mode:
                    <strong>
                      {settings.mode ===
                      "AUTOMATIC"
                        ? " Automatic"
                        : " Manual"}
                    </strong>
                  </span>

                  {displayedEvent.ticketPurchaseUrl && (
                    <a
                      href={
                        displayedEvent.ticketPurchaseUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ticket page

                      <ExternalLink
                        size={14}
                      />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ) : (
            <div className="admin-main-event__empty">
              <AlertCircle
                size={20}
              />

              <div>
                <strong>
                  No event available
                </strong>

                <p>
                  Publish at least one
                  event before choosing
                  a homepage event.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="admin-main-event__section">
        <div className="admin-main-event__section-header">
          <span className="admin-main-event__section-icon">
            <Settings2
              size={17}
            />
          </span>

          <div>
            <h2>
              Homepage selection
            </h2>

            <p>
              Decide how the website
              selects the main event.
            </p>
          </div>
        </div>

        <div className="admin-main-event__section-content">
          <div className="admin-main-event__mode-grid">
            <button
              type="button"
              className={`admin-main-event__mode-card ${
                settings.mode ===
                "AUTOMATIC"
                  ? "admin-main-event__mode-card--active"
                  : ""
              }`}
              onClick={() =>
                selectMode(
                  "AUTOMATIC",
                )
              }
            >
              <span className="admin-main-event__mode-check">
                {settings.mode ===
                  "AUTOMATIC" && (
                  <Check
                    size={14}
                  />
                )}
              </span>

              <span className="admin-main-event__mode-icon">
                <Zap
                  size={19}
                />
              </span>

              <span className="admin-main-event__mode-copy">
                <strong>
                  Automatic
                </strong>

                <small>
                  Automatically use the
                  current or next
                  published festival
                  event.
                </small>
              </span>
            </button>

            <button
              type="button"
              className={`admin-main-event__mode-card ${
                settings.mode ===
                "MANUAL"
                  ? "admin-main-event__mode-card--active"
                  : ""
              }`}
              onClick={() =>
                selectMode(
                  "MANUAL",
                )
              }
            >
              <span className="admin-main-event__mode-check">
                {settings.mode ===
                  "MANUAL" && (
                  <Check
                    size={14}
                  />
                )}
              </span>

              <span className="admin-main-event__mode-icon">
                <Star
                  size={19}
                />
              </span>

              <span className="admin-main-event__mode-copy">
                <strong>
                  Manual
                </strong>

                <small>
                  Pin one specific
                  published event to the
                  homepage until you
                  change it.
                </small>
              </span>
            </button>
          </div>
        </div>
      </div>

      {settings.mode ===
      "AUTOMATIC" ? (
        <div className="admin-main-event__section">
          <div className="admin-main-event__section-header">
            <span className="admin-main-event__section-icon">
              <Zap
                size={17}
              />
            </span>

            <div>
              <h2>
                Automatic switching
              </h2>

              <p>
                Configure when the
                homepage moves to the
                next published event.
              </p>
            </div>
          </div>

          <div className="admin-main-event__section-content">
            <div className="admin-main-event__auto-grid">
              <label className="admin-main-event__field">
                <span>
                  Switch after event
                  starts
                </span>

                <div className="admin-main-event__hours-input">
                  <input
                    type="number"
                    min="0"
                    max="48"
                    step="1"
                    value={
                      settings.autoSwitchHours
                    }
                    onChange={(
                      event,
                    ) =>
                      handleSwitchHoursChange(
                        event
                          .target
                          .value,
                      )
                    }
                  />

                  <span>
                    hours
                  </span>
                </div>

                <small>
                  The next published
                  event becomes the
                  homepage event this
                  many hours after the
                  current event starts.
                </small>
              </label>

              <div className="admin-main-event__switch-summary">
                <div className="admin-main-event__switch-step">
                  <span className="admin-main-event__switch-number">
                    1
                  </span>

                  <div>
                    <span>
                      Current event
                    </span>

                    <strong>
                      {automaticEvent
                        ? automaticEvent.title
                        : "No event"}
                    </strong>
                  </div>
                </div>

                <ArrowRight
                  size={18}
                  className="admin-main-event__switch-arrow"
                />

                <div className="admin-main-event__switch-step">
                  <span className="admin-main-event__switch-number">
                    2
                  </span>

                  <div>
                    <span>
                      Next event
                    </span>

                    <strong>
                      {nextEvent
                        ? nextEvent.title
                        : "No next event"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {automaticEvent &&
              automaticSwitchDate && (
                <div className="admin-main-event__info-box">
                  <Clock3
                    size={17}
                  />

                  <div>
                    <strong>
                      Next automatic
                      switch
                    </strong>

                    <span>
                      {formatDateTime(
                        automaticSwitchDate,
                      )}{" "}
                      Thailand time
                    </span>
                  </div>
                </div>
              )}
          </div>
        </div>
      ) : (
        <div className="admin-main-event__section">
          <div className="admin-main-event__section-header">
            <span className="admin-main-event__section-icon">
              <Star
                size={17}
              />
            </span>

            <div>
              <h2>
                Manual event
              </h2>

              <p>
                Select exactly which
                published event should
                appear on the homepage.
              </p>
            </div>
          </div>

          <div className="admin-main-event__section-content">
            <label className="admin-main-event__field">
              <span>
                Homepage event
              </span>

              <select
                value={
                  settings.manualEventId ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  handleManualEventChange(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select an event
                </option>

                {publishedEvents.map(
                  (event) => (
                    <option
                      key={
                        event.id
                      }
                      value={
                        event.id
                      }
                    >
                      {
                        event.title
                      }{" "}
                      —{" "}
                      {formatEventDate(
                        event.date,
                      )}
                    </option>
                  ),
                )}
              </select>

              <small>
                Only published events
                are available for
                homepage selection.
              </small>
            </label>

            <div className="admin-main-event__warning-box">
              <AlertCircle
                size={17}
              />

              <div>
                <strong>
                  Automatic switching
                  disabled
                </strong>

                <span>
                  The selected event
                  will remain featured
                  until you change the
                  event or return to
                  Automatic mode.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="admin-main-event__footer">
        <div>
          <strong>
            {publishedEvents.length}
          </strong>

          <span>
            {" "}
            published{" "}
            {publishedEvents.length ===
            1
              ? "event"
              : "events"}{" "}
            available
          </span>
        </div>

        <div className="admin-main-event__footer-actions">
          <button
            type="button"
            className="admin-main-event__secondary-button"
            disabled={
              !hasUnsavedChanges ||
              isSaving
            }
            onClick={
              handleDiscard
            }
          >
            <RotateCcw
              size={16}
            />

            Discard
          </button>

          <button
            type="button"
            className="admin-main-event__save-button"
            disabled={
              !hasUnsavedChanges ||
              isSaving
            }
            onClick={() =>
              void handleSave()
            }
          >
            {isSaving ? (
              <LoaderCircle
                size={16}
                className="admin-main-event__spinner"
              />
            ) : (
              <Save
                size={16}
              />
            )}

            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </footer>
    </section>
  );
}

export default AdminMainEvent;