import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileImage,
  Image,
  LoaderCircle,
  Save,
  Sparkles,
  X,
} from "lucide-react";

import ExperiencePageForm from "../components/experience/ExperiencePageForm";

import {
  createExperiencePage,
  getAdminExperiencePage,
  getExperienceHighlights,
  getExperienceImages,
  updateExperiencePage,
} from "../../services/experience.service";

import type {
  CreateExperiencePageDto,
  ExperienceHighlight,
  ExperienceImage,
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

type ActiveTab = "content" | "highlights" | "images";

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

function getStringValue(
  value: unknown,
  keys: string[],
  fallback: string,
): string {
  if (!isRecord(value)) {
    return fallback;
  }

  for (const key of keys) {
    const candidate = value[key];

    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return fallback;
}

function AdminExperience() {
  const [page, setPage] =
    useState<ExperiencePage | null>(null);
  const [highlights, setHighlights] = useState<
    ExperienceHighlight[]
  >([]);
  const [images, setImages] = useState<
    ExperienceImage[]
  >([]);

  const [activeTab, setActiveTab] =
    useState<ActiveTab>("content");

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
        const [
          experiencePageResult,
          highlightsResult,
          imagesResult,
        ] = await Promise.allSettled([
          getAdminExperiencePage(),
          getExperienceHighlights(),
          getExperienceImages(),
        ]);

        if (
          loadRequestIdRef.current !== requestId
        ) {
          return;
        }

        if (
          experiencePageResult.status ===
          "fulfilled"
        ) {
          setPage(experiencePageResult.value);
        } else if (
          getErrorStatus(
            experiencePageResult.reason,
          ) === 404
        ) {
          setPage(null);
        } else {
          throw experiencePageResult.reason;
        }

        setHighlights(
          highlightsResult.status === "fulfilled"
            ? highlightsResult.value
            : [],
        );

        setImages(
          imagesResult.status === "fulfilled"
            ? imagesResult.value
            : [],
        );

        setLoadState({
          status: "ready",
        });
      } catch (error: unknown) {
        if (
          loadRequestIdRef.current !== requestId
        ) {
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

  const submitExperienceForm = useCallback(() => {
    const form =
      document.querySelector<HTMLFormElement>(
        ".experience-page-form",
      );

    form?.requestSubmit();
  }, []);

  const previewData = useMemo(
    () => ({
      title: getStringValue(
        page,
        [
          "heroTitle",
          "title",
          "headline",
          "mainTitle",
        ],
        "The Waterfall Experience",
      ),
      subtitle: getStringValue(
        page,
        [
          "heroSubtitle",
          "subtitle",
          "subheading",
          "tagline",
        ],
        "Nature. Music. Freedom.",
      ),
      description: getStringValue(
        page,
        [
          "storyDescription",
          "description",
          "story",
          "introText",
        ],
        "Create and save the Experience page to see its public content preview here.",
      ),
      imageUrl: getStringValue(
        page,
        [
          "heroImageUrl",
          "featuredImageUrl",
          "imageUrl",
          "coverImageUrl",
        ],
        "",
      ),
    }),
    [page],
  );

  if (loadState.status === "loading") {
    return (
      <div className="admin-experience">
        <div
          className="admin-experience__state"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <LoaderCircle
            className="admin-experience__spinner"
            size={28}
          />

          <h2>Loading Experience page</h2>

          <p>
            Retrieving the page content and related
            sections.
          </p>
        </div>
      </div>
    );
  }

  if (loadState.status === "error") {
    return (
      <div className="admin-experience">
        <div
          className="admin-experience__state admin-experience__state--error"
          role="alert"
        >
          <AlertCircle size={28} />

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
    <div className="admin-experience">
      <header className="admin-experience__header">
        <div className="admin-experience__heading">
          <span className="admin-experience__breadcrumb">
            Admin / Experience
          </span>

          <h1>Experience Page</h1>

          <p>
            Manage the content of the public
            Experience page.
          </p>
        </div>

        <div className="admin-experience__header-actions">
          <span
            className={`admin-experience__status ${
              isPublished
                ? "admin-experience__status--published"
                : "admin-experience__status--draft"
            }`}
          >
            <span aria-hidden="true" />

            {isPublished ? "Published" : "Draft"}
          </span>

          <div className="admin-experience__updated">
            <span>Last updated</span>

            {lastUpdated.dateTime ? (
              <time dateTime={lastUpdated.dateTime}>
                {lastUpdated.label}
              </time>
            ) : (
              <strong>{lastUpdated.label}</strong>
            )}
          </div>

          <a
            className="admin-experience__preview-link"
            href="/experience"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} />
            Preview Public Page
          </a>

          <button
            type="button"
            className="admin-experience__save-button"
            onClick={submitExperienceForm}
            disabled={
              isSaving || activeTab !== "content"
            }
          >
            {isSaving ? (
              <LoaderCircle
                size={15}
                className="admin-experience__spinner"
              />
            ) : (
              <Save size={15} />
            )}

            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </header>

      {feedback && (
        <div
          className={`admin-experience__feedback admin-experience__feedback--${feedback.type}`}
          role={
            feedback.type === "error"
              ? "alert"
              : "status"
          }
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={17} />
          ) : (
            <AlertCircle size={17} />
          )}

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
            onClick={() => setFeedback(null)}
            aria-label="Dismiss feedback"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <nav
        className="admin-experience__tabs"
        aria-label="Experience page sections"
      >
        <button
          type="button"
          className={
            activeTab === "content"
              ? "admin-experience__tab admin-experience__tab--active"
              : "admin-experience__tab"
          }
          onClick={() => setActiveTab("content")}
        >
          Content
        </button>

        <button
          type="button"
          className={
            activeTab === "highlights"
              ? "admin-experience__tab admin-experience__tab--active"
              : "admin-experience__tab"
          }
          onClick={() =>
            setActiveTab("highlights")
          }
        >
          Highlights
          <span>{highlights.length}</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "images"
              ? "admin-experience__tab admin-experience__tab--active"
              : "admin-experience__tab"
          }
          onClick={() => setActiveTab("images")}
        >
          Images
          <span>{images.length}</span>
        </button>
      </nav>

      {activeTab === "content" && (
        <>
          {!page && (
            <section className="admin-experience__setup">
              <Sparkles size={18} />

              <div>
                <strong>
                  Create your Experience page
                </strong>

                <p>
                  Complete the form and save it to
                  create the first version.
                </p>
              </div>
            </section>
          )}

          <div className="admin-experience__content-layout">
            <main className="admin-experience__editor">
              <div className="admin-experience__section-heading">
                <h2>Page Content</h2>

                <p>
                  Update the information that appears
                  on the Experience page.
                </p>
              </div>

              <ExperiencePageForm
                page={page}
                isSaving={isSaving}
                onSubmit={handleSubmit}
              />
            </main>

            <aside className="admin-experience__preview">
              <div className="admin-experience__section-heading">
                <h2>Live Preview</h2>

                <p>
                  Preview of the currently saved
                  Experience page.
                </p>
              </div>

              <div className="admin-experience__preview-card">
                <div
                  className={
                    previewData.imageUrl
                      ? "admin-experience__preview-media"
                      : "admin-experience__preview-media admin-experience__preview-media--empty"
                  }
                  style={
                    previewData.imageUrl
                      ? {
                          backgroundImage: `url("${previewData.imageUrl}")`,
                        }
                      : undefined
                  }
                >
                  <span
                    className={`admin-experience__preview-status ${
                      isPublished
                        ? "admin-experience__preview-status--published"
                        : "admin-experience__preview-status--draft"
                    }`}
                  >
                    <span aria-hidden="true" />

                    {isPublished
                      ? "Published"
                      : "Draft"}
                  </span>

                  {!previewData.imageUrl && (
                    <div className="admin-experience__preview-placeholder">
                      <FileImage size={30} />
                      <span>
                        Featured image preview
                      </span>
                    </div>
                  )}

                  <div className="admin-experience__preview-copy">
                    <h3>{previewData.title}</h3>

                    <strong>
                      {previewData.subtitle}
                    </strong>

                    <p>{previewData.description}</p>
                  </div>
                </div>

                <div className="admin-experience__preview-meta">
                  <div>
                    <Sparkles size={17} />

                    <span>
                      Highlights
                      <strong>
                        {highlights.length}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <Image size={17} />

                    <span>
                      Images
                      <strong>{images.length}</strong>
                    </span>
                  </div>

                  <div>
                    <span>
                      Last updated
                      <strong>
                        {lastUpdated.label}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="admin-experience__tip">
            <AlertCircle size={16} />

            <p>
              Changes are shown in the preview after
              they are saved.
            </p>
          </div>
        </>
      )}

      {activeTab === "highlights" && (
        <section className="admin-experience__tab-panel">
          <div className="admin-experience__section-heading">
            <h2>Experience Highlights</h2>

            <p>
              Manage the key features shown on the
              public Experience page.
            </p>
          </div>

          {highlights.length === 0 ? (
            <div className="admin-experience__empty">
              <Sparkles size={24} />

              <h3>No highlights yet</h3>

              <p>
                Highlight creation and editing can be
                added here without crowding the main
                page editor.
              </p>
            </div>
          ) : (
            <div className="admin-experience__simple-list">
              {highlights.map((highlight, index) => (
                <article key={highlight.id}>
                  <span>{index + 1}</span>

                  <div>
                    <strong>
                      {getStringValue(
                        highlight,
                        ["title", "name"],
                        `Highlight ${index + 1}`,
                      )}
                    </strong>

                    <p>
                      {getStringValue(
                        highlight,
                        [
                          "description",
                          "text",
                          "content",
                        ],
                        "No description",
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "images" && (
        <section className="admin-experience__tab-panel">
          <div className="admin-experience__section-heading">
            <h2>Experience Images</h2>

            <p>
              Review the images used across the
              Experience page.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="admin-experience__empty">
              <Image size={24} />

              <h3>No images yet</h3>

              <p>
                Image upload and management can live
                in this dedicated tab.
              </p>
            </div>
          ) : (
            <div className="admin-experience__image-grid">
              {images.map((image, index) => {
                const imageUrl = getStringValue(
                  image,
                  ["imageUrl", "url", "src"],
                  "",
                );

                const imageAlt = getStringValue(
                  image,
                  ["altText", "title", "name"],
                  `Experience image ${index + 1}`,
                );

                return (
                  <article key={image.id}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={imageAlt}
                      />
                    ) : (
                      <div>
                        <FileImage size={24} />
                      </div>
                    )}

                    <span>{imageAlt}</span>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminExperience;