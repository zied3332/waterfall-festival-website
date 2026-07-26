import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import ExperiencePageForm from "../components/experience/ExperiencePageForm";

import {
  createExperiencePage,
  getAdminExperiencePage,
  updateExperiencePage,
} from "../../services/experience.service";

import type {
  CreateExperiencePageDto,
  ExperiencePage,
} from "../../types/experience";

import "../style/admin-experience.css";

type Feedback = {
  type: "success" | "error";
  message: string;
};

type LoadState =
  | {
      status: "loading";
    }
  | {
      status: "ready";
    }
  | {
      status: "error";
      message: string;
    };

type FormattedTimestamp = {
  label: string;
  dateTime?: string;
};

const lastUpdatedFormatter = new Intl.DateTimeFormat(
  "en",
  {
    dateStyle: "medium",
    timeStyle: "short",
  },
);

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function getErrorResponse(
  error: unknown,
): Record<string, unknown> | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  const response = error.response;

  return isRecord(response)
    ? response
    : undefined;
}

function getErrorStatus(
  error: unknown,
): number | undefined {
  const response = getErrorResponse(error);
  const status = response?.status;

  return typeof status === "number"
    ? status
    : undefined;
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  const response = getErrorResponse(error);
  const data = response?.data;

  if (isRecord(data)) {
    const responseMessage = data.message;

    if (typeof responseMessage === "string") {
      const message = responseMessage.trim();

      if (message) {
        return message;
      }
    }

    if (Array.isArray(responseMessage)) {
      const messages = responseMessage.filter(
        (message): message is string =>
          typeof message === "string" &&
          Boolean(message.trim()),
      );

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();

    if (message) {
      return message;
    }
  }

  return fallbackMessage;
}

function formatLastUpdated(
  updatedAt: string | Date | undefined,
): FormattedTimestamp {
  if (!updatedAt) {
    return {
      label: "Not saved yet",
    };
  }

  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return {
      label: "Recently updated",
    };
  }

  return {
    label: lastUpdatedFormatter.format(date),
    dateTime: date.toISOString(),
  };
}

function AdminExperience() {
  const [page, setPage] =
    useState<ExperiencePage | null>(null);
  const [loadState, setLoadState] =
    useState<LoadState>({
      status: "loading",
    });
  const [isSaving, setIsSaving] =
    useState(false);
  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const loadRequestIdRef = useRef(0);

  const loadExperiencePage =
    useCallback(async (): Promise<void> => {
      const requestId =
        loadRequestIdRef.current + 1;

      loadRequestIdRef.current = requestId;

      setLoadState({
        status: "loading",
      });

      try {
        const experiencePage =
          await getAdminExperiencePage();

        if (
          loadRequestIdRef.current !== requestId
        ) {
          return;
        }

        setPage(experiencePage);
        setLoadState({
          status: "ready",
        });
      } catch (error: unknown) {
        if (
          loadRequestIdRef.current !== requestId
        ) {
          return;
        }

        if (getErrorStatus(error) === 404) {
          setPage(null);
          setLoadState({
            status: "ready",
          });

          return;
        }

        setLoadState({
          status: "error",
          message: getErrorMessage(
            error,
            "The Experience page could not be loaded. Please try again.",
          ),
        });
      }
    }, []);

  useEffect(() => {
    void loadExperiencePage();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadExperiencePage]);

  const handleSubmit = useCallback(
    async (
      data: CreateExperiencePageDto,
    ): Promise<void> => {
      if (isSaving) {
        return;
      }

      const isCreating = page === null;

      setIsSaving(true);
      setFeedback(null);

      try {
        const savedPage = isCreating
          ? await createExperiencePage(data)
          : await updateExperiencePage(data);

        setPage(savedPage);
        setFeedback({
          type: "success",
          message: isCreating
            ? "The Experience page was created successfully."
            : "The Experience page was updated successfully.",
        });
      } catch (error: unknown) {
        setFeedback({
          type: "error",
          message: getErrorMessage(
            error,
            "The Experience page could not be saved. Please check the form and try again.",
          ),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, page],
  );

  if (loadState.status === "loading") {
    return (
      <div className="admin-experience-page">
        <div
          className="admin-experience-page__loading"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div
            className="admin-experience-page__spinner"
            aria-hidden="true"
          />

          <p>Loading the Experience page...</p>
        </div>
      </div>
    );
  }

  if (loadState.status === "error") {
    return (
      <div className="admin-experience-page">
        <div
          className="admin-experience-error-state"
          role="alert"
        >
          <div
            className="admin-experience-error-state__icon"
            aria-hidden="true"
          >
            !
          </div>

          <h2>Unable to load Experience</h2>

          <p>{loadState.message}</p>

          <button
            type="button"
            onClick={() => {
              void loadExperiencePage();
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isPublished =
    page?.isPublished ?? false;
  const lastUpdated = formatLastUpdated(
    page?.updatedAt,
  );

  return (
    <div className="admin-experience-page">
      <header className="admin-experience-header">
        <div>
          <span className="admin-experience-header__eyebrow">
            Website content
          </span>

          <h1>Experience Page</h1>

          <p>
            Manage the main content, story, publication
            status, and presentation of the public
            Experience page.
          </p>
        </div>

        <div className="admin-experience-header__status">
          <span
            className={`admin-experience-status ${
              isPublished
                ? "admin-experience-status--published"
                : "admin-experience-status--draft"
            }`}
          >
            <span
              className="admin-experience-status__dot"
              aria-hidden="true"
            />

            {isPublished ? "Published" : "Draft"}
          </span>

          <span className="admin-experience-header__updated">
            Last updated
            <br />

            {lastUpdated.dateTime ? (
              <time dateTime={lastUpdated.dateTime}>
                {lastUpdated.label}
              </time>
            ) : (
              lastUpdated.label
            )}
          </span>
        </div>
      </header>

      {feedback && (
        <div
          className={`admin-experience-feedback admin-experience-feedback--${feedback.type}`}
          role={
            feedback.type === "error"
              ? "alert"
              : "status"
          }
          aria-live={
            feedback.type === "error"
              ? "assertive"
              : "polite"
          }
        >
          <div>
            <strong>
              {feedback.type === "success"
                ? "Changes saved"
                : "Unable to save changes"}
            </strong>

            <p>{feedback.message}</p>
          </div>

          <button
            type="button"
            aria-label="Dismiss feedback"
            title="Dismiss"
            onClick={() => {
              setFeedback(null);
            }}
          >
            ×
          </button>
        </div>
      )}

      {!page && (
        <section className="admin-experience-empty-state">
          <span className="admin-experience-empty-state__eyebrow">
            Initial setup
          </span>

          <h2>Create your Experience page</h2>

          <p>
            No Experience page exists yet. Complete the form
            below and save it to create the first version.
          </p>
        </section>
      )}

      <ExperiencePageForm
        page={page}
        isSaving={isSaving}
        onSubmit={handleSubmit}
      />

      <section className="admin-experience-placeholder-section">
        <div>
          <span className="admin-experience-placeholder-section__eyebrow">
            Coming next
          </span>

          <h2>Experience Highlights</h2>

          <p>Coming next</p>
        </div>
      </section>

      <section className="admin-experience-placeholder-section">
        <div>
          <span className="admin-experience-placeholder-section__eyebrow">
            Coming next
          </span>

          <h2>Experience Images</h2>

          <p>Coming next</p>
        </div>
      </section>
    </div>
  );
}

export default AdminExperience;