import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type {
  CreateExperiencePageDto,
  ExperiencePage,
} from "../../../types/experience";

type ExperiencePageFormProps = {
  page: ExperiencePage | null;
  isSaving: boolean;
  onSubmit: (
    data: CreateExperiencePageDto,
  ) => Promise<void> | void;
};

type ExperiencePageFormState = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;

  storyEyebrow: string;
  storyTitle: string;
  storyDescription: string;

  buttonText: string;
  buttonUrl: string;

  isPublished: boolean;
};

const emptyFormState: ExperiencePageFormState = {
  heroBadge: "",
  heroTitle: "",
  heroSubtitle: "",
  heroDescription: "",

  storyEyebrow: "",
  storyTitle: "",
  storyDescription: "",

  buttonText: "",
  buttonUrl: "",

  isPublished: false,
};

function createFormState(
  page: ExperiencePage | null,
): ExperiencePageFormState {
  if (!page) {
    return emptyFormState;
  }

  return {
    heroBadge: page.heroBadge ?? "",
    heroTitle: page.heroTitle,
    heroSubtitle: page.heroSubtitle ?? "",
    heroDescription: page.heroDescription ?? "",

    storyEyebrow: page.storyEyebrow ?? "",
    storyTitle: page.storyTitle,
    storyDescription: page.storyDescription,

    buttonText: page.buttonText ?? "",
    buttonUrl: page.buttonUrl ?? "",

    isPublished: page.isPublished,
  };
}

function optionalText(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue || undefined;
}

function ExperiencePageForm({
  page,
  isSaving,
  onSubmit,
}: ExperiencePageFormProps) {
  const [formData, setFormData] =
    useState<ExperiencePageFormState>(() =>
      createFormState(page),
    );

  useEffect(() => {
    setFormData(createFormState(page));
  }, [page]);

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePublishedChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setFormData((current) => ({
      ...current,
      isPublished: event.target.checked,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const payload: CreateExperiencePageDto = {
      heroBadge: optionalText(formData.heroBadge),
      heroTitle: formData.heroTitle.trim(),
      heroSubtitle: optionalText(
        formData.heroSubtitle,
      ),
      heroDescription: optionalText(
        formData.heroDescription,
      ),

      storyEyebrow: optionalText(
        formData.storyEyebrow,
      ),
      storyTitle: formData.storyTitle.trim(),
      storyDescription:
        formData.storyDescription.trim(),

      buttonText: optionalText(formData.buttonText),
      buttonUrl: optionalText(formData.buttonUrl),

      isPublished: formData.isPublished,
    };

    await onSubmit(payload);
  }

  function handleReset() {
    setFormData(createFormState(page));
  }

  return (
    <form
      className="experience-page-form"
      onSubmit={handleSubmit}
    >
      <section className="experience-form-section">
        <div className="experience-form-section__header">
          <div>
            <span className="experience-form-section__eyebrow">
              Main introduction
            </span>

            <h2>Hero section</h2>

            <p>
              Manage the first content visitors see on the
              Experience page.
            </p>
          </div>

          <span className="experience-form-section__number">
            01
          </span>
        </div>

        <div className="experience-form-grid">
          <div className="experience-form-field">
            <label htmlFor="heroBadge">
              Hero badge
            </label>

            <input
              id="heroBadge"
              name="heroBadge"
              type="text"
              value={formData.heroBadge}
              onChange={handleInputChange}
              placeholder="Made for unforgettable nights"
              maxLength={100}
              disabled={isSaving}
            />

            <span className="experience-form-field__hint">
              A short label displayed above the main title.
            </span>
          </div>

          <div className="experience-form-field">
            <label htmlFor="heroSubtitle">
              Hero subtitle
            </label>

            <input
              id="heroSubtitle"
              name="heroSubtitle"
              type="text"
              value={formData.heroSubtitle}
              onChange={handleInputChange}
              placeholder="The heart of the festival"
              maxLength={160}
              disabled={isSaving}
            />
          </div>

          <div className="experience-form-field experience-form-field--full">
            <label htmlFor="heroTitle">
              Hero title
              <span aria-hidden="true"> *</span>
            </label>

            <input
              id="heroTitle"
              name="heroTitle"
              type="text"
              value={formData.heroTitle}
              onChange={handleInputChange}
              placeholder="Come for the music. Stay for the memories."
              maxLength={200}
              required
              disabled={isSaving}
            />
          </div>

          <div className="experience-form-field experience-form-field--full">
            <label htmlFor="heroDescription">
              Hero description
            </label>

            <textarea
              id="heroDescription"
              name="heroDescription"
              value={formData.heroDescription}
              onChange={handleInputChange}
              placeholder="Describe the atmosphere and purpose of the festival experience."
              rows={5}
              maxLength={1000}
              disabled={isSaving}
            />

            <span className="experience-form-field__counter">
              {formData.heroDescription.length}/1000
            </span>
          </div>
        </div>
      </section>

      <section className="experience-form-section">
        <div className="experience-form-section__header">
          <div>
            <span className="experience-form-section__eyebrow">
              Festival story
            </span>

            <h2>Story section</h2>

            <p>
              Explain what makes Waterfall Festival more than
              only a music event.
            </p>
          </div>

          <span className="experience-form-section__number">
            02
          </span>
        </div>

        <div className="experience-form-grid">
          <div className="experience-form-field">
            <label htmlFor="storyEyebrow">
              Story eyebrow
            </label>

            <input
              id="storyEyebrow"
              name="storyEyebrow"
              type="text"
              value={formData.storyEyebrow}
              onChange={handleInputChange}
              placeholder="The heart of the festival"
              maxLength={100}
              disabled={isSaving}
            />
          </div>

          <div className="experience-form-field">
            <label htmlFor="storyTitle">
              Story title
              <span aria-hidden="true"> *</span>
            </label>

            <input
              id="storyTitle"
              name="storyTitle"
              type="text"
              value={formData.storyTitle}
              onChange={handleInputChange}
              placeholder="More than a festival"
              maxLength={200}
              required
              disabled={isSaving}
            />
          </div>

          <div className="experience-form-field experience-form-field--full">
            <label htmlFor="storyDescription">
              Story description
              <span aria-hidden="true"> *</span>
            </label>

            <textarea
              id="storyDescription"
              name="storyDescription"
              value={formData.storyDescription}
              onChange={handleInputChange}
              placeholder="Tell visitors about the people, music, nature, and memories that define the experience."
              rows={8}
              maxLength={3000}
              required
              disabled={isSaving}
            />

            <span className="experience-form-field__counter">
              {formData.storyDescription.length}/3000
            </span>
          </div>
        </div>
      </section>

      <section className="experience-form-section">
        <div className="experience-form-section__header">
          <div>
            <span className="experience-form-section__eyebrow">
              Visitor action
            </span>

            <h2>Call to action</h2>

            <p>
              Configure the optional button displayed after the
              story content.
            </p>
          </div>

          <span className="experience-form-section__number">
            03
          </span>
        </div>

        <div className="experience-form-grid">
          <div className="experience-form-field">
            <label htmlFor="buttonText">
              Button text
            </label>

            <input
              id="buttonText"
              name="buttonText"
              type="text"
              value={formData.buttonText}
              onChange={handleInputChange}
              placeholder="Explore the gallery"
              maxLength={100}
              disabled={isSaving}
            />
          </div>

          <div className="experience-form-field">
            <label htmlFor="buttonUrl">
              Button URL
            </label>

            <input
              id="buttonUrl"
              name="buttonUrl"
              type="text"
              value={formData.buttonUrl}
              onChange={handleInputChange}
              placeholder="/gallery"
              maxLength={500}
              disabled={isSaving}
            />

            <span className="experience-form-field__hint">
              Example: /gallery or a complete external URL.
            </span>
          </div>
        </div>
      </section>

      <section className="experience-publish-panel">
        <div className="experience-publish-panel__content">
          <span className="experience-publish-panel__label">
            Publication status
          </span>

          <h2>
            {formData.isPublished
              ? "Experience page is published"
              : "Experience page is unpublished"}
          </h2>

          <p>
            {formData.isPublished
              ? "Visitors can access this content from the public website."
              : "The page remains available to administrators but hidden from visitors."}
          </p>
        </div>

        <label className="experience-publish-toggle">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={handlePublishedChange}
            disabled={isSaving}
          />

          <span
            className="experience-publish-toggle__track"
            aria-hidden="true"
          >
            <span className="experience-publish-toggle__thumb" />
          </span>

          <span className="experience-publish-toggle__text">
            {formData.isPublished
              ? "Published"
              : "Draft"}
          </span>
        </label>
      </section>

      <div className="experience-form-actions">
        <button
          className="experience-form-button experience-form-button--secondary"
          type="button"
          onClick={handleReset}
          disabled={isSaving}
        >
          Reset changes
        </button>

        <button
          className="experience-form-button experience-form-button--primary"
          type="submit"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving changes..."
            : page
              ? "Save page"
              : "Create page"}
        </button>
      </div>
    </form>
  );
}

export default ExperiencePageForm;