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
  getAdminHomepageEventSettings,
  updateAdminHomepageEventSettings,
} from "../../services/events.service";

import type {
  AdminHomepageEventSettings,
  HomepageEventMode,
} from "../../services/events.service";

import type {
  Event,
} from "../../types/event";

import "../style/admin-main-event.css";

type MainEventFormState = {
  mode: HomepageEventMode;
  manualEventId: number | null;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

const FESTIVAL_TIME_ZONE =
  "Asia/Bangkok";

const initialSettings: MainEventFormState = {
  mode: "AUTO",
  manualEventId: null,
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
  const date =
    new Date(value);

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

      weekday:
        "short",

      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
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

      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true,
    },
  ).format(date);
}

function formatDateTime(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        FESTIVAL_TIME_ZONE,

      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true,
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

function createFormState(
  response: AdminHomepageEventSettings,
  fallbackEventId: number | null,
): MainEventFormState {
  return {
    mode:
      response.homepageEventMode,

    manualEventId:
      response.homepageManualEventId ??
      fallbackEventId,
  };
}

function AdminMainEvent() {
  const [
    events,
    setEvents,
  ] =
    useState<Event[]>([]);

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
    serverSettings,
    setServerSettings,
  ] =
    useState<
      AdminHomepageEventSettings | null
    >(null);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false);

  const [
    loadError,
    setLoadError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState<Feedback | null>(
      null,
    );

  /*
   * ============================================================
   * PUBLISHED EVENTS
   * ============================================================
   */

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

  /*
   * The selected manual event shown while
   * editing the form.
   */
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

  /*
   * The backend is the source of truth for AUTO.
   *
   * When the form has no unsaved changes, use
   * resolvedEvent directly.
   *
   * While the administrator is editing MANUAL
   * mode, preview the selected manual event.
   */
  const displayedEvent =
    settings.mode === "MANUAL"
      ? manualEvent
      : serverSettings?.resolvedEvent ??
        null;

  /*
   * Find the event after the currently resolved
   * AUTO event. This is only for the visual
   * "Current -> Next" explanation.
   */
  const automaticEvent =
    serverSettings?.resolvedMode ===
      "AUTO"
      ? serverSettings.resolvedEvent
      : null;

  const nextEvent =
    useMemo(() => {
      if (!automaticEvent) {
        return null;
      }

      const automaticEventTime =
        new Date(
          automaticEvent.date,
        ).getTime();

      return (
        publishedEvents.find(
          (event) =>
            new Date(
              event.date,
            ).getTime() >
            automaticEventTime,
        ) ?? null
      );
    }, [
      automaticEvent,
      publishedEvents,
    ]);

  /*
   * ============================================================
   * UNSAVED CHANGES
   * ============================================================
   */

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

  /*
   * ============================================================
   * LOAD
   * ============================================================
   */

  async function loadData() {
    try {
      setIsLoading(true);
      setLoadError(null);
      setFeedback(null);

      const [
        eventsResponse,
        settingsResponse,
      ] =
        await Promise.all([
          getAdminEvents(),
          getAdminHomepageEventSettings(),
        ]);

      setEvents(
        eventsResponse,
      );

      setServerSettings(
        settingsResponse,
      );

      const published =
        eventsResponse
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

      const fallbackEventId =
        published[0]?.id ??
        null;

      const loadedFormState =
        createFormState(
          settingsResponse,
          fallbackEventId,
        );

      setSettings(
        loadedFormState,
      );

      setSavedSettings(
        loadedFormState,
      );
    } catch (error) {
      setLoadError(
        getErrorMessage(
          error,
          "Could not load the main event configuration.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  function selectMode(
    mode: HomepageEventMode,
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
    if (!eventId) {
      setSettings(
        (current) => ({
          ...current,
          manualEventId:
            null,
        }),
      );

      setFeedback(null);

      return;
    }

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

  function handleDiscard() {
    setSettings({
      ...savedSettings,
    });

    setFeedback(null);
  }

  /*
   * ============================================================
   * SAVE
   * ============================================================
   */

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
        type:
          "error",

        message:
          "Choose an event before enabling Manual mode.",
      });

      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const response =
        await updateAdminHomepageEventSettings({
          homepageEventMode:
            settings.mode,

          /*
           * Keep the selected manual event in
           * the database even when AUTO is used.
           *
           * This means switching back to MANUAL
           * remembers the previous selection.
           */
          homepageManualEventId:
            settings.manualEventId,
        });

      setServerSettings(
        response,
      );

      const updatedFormState:
        MainEventFormState = {
          mode:
            response.homepageEventMode,

          manualEventId:
            response.homepageManualEventId,
        };

      setSettings(
        updatedFormState,
      );

      setSavedSettings(
        updatedFormState,
      );

      setFeedback({
        type:
          "success",

        message:
          response.homepageEventMode ===
          "MANUAL"
            ? "Main event saved. The selected event is now pinned to the homepage."
            : "Main event saved. Automatic homepage selection is now active.",
      });
    } catch (error) {
      setFeedback({
        type:
          "error",

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

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

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
            Getting homepage
            configuration and published
            festival events...
          </span>
        </div>
      </section>
    );
  }

  /*
   * ============================================================
   * LOAD ERROR
   * ============================================================
   */

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
              void loadData()
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
      {/*
       * ========================================================
       * HEADER
       * ========================================================
       */}

      <header className="admin-main-event__header">
        <div className="admin-main-event__heading">
          <span
            className="admin-main-event__heading-icon"
            aria-hidden="true"
          >
            <Star
              size={21}
            />
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
                "AUTO"
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

      {/*
       * ========================================================
       * FEEDBACK
       * ========================================================
       */}

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

      {/*
       * ========================================================
       * CURRENTLY DISPLAYED / PREVIEW
       * ========================================================
       */}

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
              will be featured on the
              homepage with the current
              selection.
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
                      Featured event
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
                    {getStatusLabel(
                      displayedEvent.status,
                    )}
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
                    )}{" "}
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
                      "AUTO"
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

      {/*
       * ========================================================
       * MODE
       * ========================================================
       */}

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
                "AUTO"
                  ? "admin-main-event__mode-card--active"
                  : ""
              }`}
              onClick={() =>
                selectMode(
                  "AUTO",
                )
              }
            >
              <span className="admin-main-event__mode-check">
                {settings.mode ===
                  "AUTO" && (
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

      {/*
       * ========================================================
       * AUTO
       * ========================================================
       */}

      {settings.mode ===
      "AUTO" ? (
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
                The backend manages the
                event automatically
                using Thailand time.
              </p>
            </div>
          </div>

          <div className="admin-main-event__section-content">
            <div className="admin-main-event__auto-grid">
              <div className="admin-main-event__field">
                <span>
                  Automatic rule
                </span>

                <strong>
                  9:00 PM Thailand time
                </strong>

                <small>
                  The current event
                  remains featured until
                  9:00 PM Thailand time
                  on its event date. The
                  switch will never
                  happen before the
                  event starts.
                </small>
              </div>

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

            {serverSettings?.switchAt && (
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
                      serverSettings.switchAt,
                    )}{" "}
                    Thailand time
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /*
         * ======================================================
         * MANUAL
         * ======================================================
         */

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

      {/*
       * ========================================================
       * FOOTER
       * ========================================================
       */}

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