import {
  useCallback,
  useEffect,
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

import "../styles/admin-experience.css";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

function AdminExperience() {
  const [page, setPage] =
    useState<ExperiencePage | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<FeedbackState>(null);

  const loadExperiencePage = useCallback(
    async () => {
      setIsLoading(true);
      setFeedback(null);

      try {
        const experiencePage =
          await getAdminExperiencePage();

        setPage(experiencePage);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load the Experience page.";

        setFeedback({
          type: "error",
          message,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadExperiencePage();
  }, [loadExperiencePage]);

  async function handleSubmit(
    data: CreateExperiencePageDto,
  ) {
    setIsSaving(true);
    setFeedback(null);

    try {
      const savedPage = page
        ? await updateExperiencePage(data)
        : await createExperiencePage(data);

      setPage(savedPage);

      setFeedback({
        type: "success",
        message: page
          ? "Experience page updated successfully."
          : "Experience page created successfully.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save the Experience page.";

      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="admin-experience-page">
        <div className="admin-experience-page__loading">
          <div
            className="admin-experience-page__spinner"
            aria-hidden="true"
          />

          <p>Loading Experience content...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-experience-page">
      <header className="admin-experience-header">
        <div>
          <span className="admin-experience-header__eyebrow">
            Content management
          </span>

          <h1>Experience page</h1>

          <p>
            Manage the hero content, festival story,
            call-to-action, and publication status of the
            public Experience page.
          </p>
        </div>

        <div className="admin-experience-header__status">
          <span
            className={
              page?.isPublished
                ? "admin-experience-status admin-experience-status--published"
                : "admin-experience-status admin-experience-status--draft"
            }
          >
            <span
              className="admin-experience-status__dot"
              aria-hidden="true"
            />

            {page?.isPublished
              ? "Published"
              : "Draft"}
          </span>

          {page?.updatedAt ? (
            <span className="admin-experience-header__updated">
              Last updated{" "}
              {new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(
                new Date(page.updatedAt),
              )}
            </span>
          ) : (
            <span className="admin-experience-header__updated">
              No page created yet
            </span>
          )}
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
        >
          <div>
            <strong>
              {feedback.type === "success"
                ? "Success"
                : "Something went wrong"}
            </strong>

            <p>{feedback.message}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFeedback(null);
            }}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {!page && feedback?.type === "error" ? (
        <section className="admin-experience-error-state">
          <span className="admin-experience-error-state__icon">
            !
          </span>

          <h2>Unable to load the Experience page</h2>

          <p>
            Check that the backend is running and that your
            administrator session is still valid.
          </p>

          <button
            type="button"
            onClick={() => {
              void loadExperiencePage();
            }}
          >
            Try again
          </button>
        </section>
      ) : (
        <>
          {!page && (
            <section className="admin-experience-empty-state">
              <div>
                <span className="admin-experience-empty-state__eyebrow">
                  First-time setup
                </span>

                <h2>Create the Experience page</h2>

                <p>
                  There is no Experience page in the database
                  yet. Complete the form below to create it.
                </p>
              </div>
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

              <h2>Experience highlights</h2>

              <p>
                The next section will let you create, edit,
                hide, reorder, and delete Experience
                highlights.
              </p>
            </div>
          </section>

          <section className="admin-experience-placeholder-section">
            <div>
              <span className="admin-experience-placeholder-section__eyebrow">
                Coming next
              </span>

              <h2>Experience images</h2>

              <p>
                The image manager will let you add image URLs,
                update captions and alt text, control
                visibility, and select a featured image.
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default AdminExperience;