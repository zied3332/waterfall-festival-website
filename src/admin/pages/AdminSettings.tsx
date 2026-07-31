import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Globe2,
  Image,
  LoaderCircle,
  Mail,
  Palette,
  RotateCcw,
  Save,
  Settings,
  Share2,
  Sparkles,
  ToggleLeft,
} from "lucide-react";

import {
  getAdminSettings,
  updateAdminSettings,
} from "../../services/settings.service";

import type {
  FestivalStatus,
  UpdateWebsiteSettingsDto,
  WebsiteSettings,
} from "../../types/settings";

import "../style/admin-settings.css";

type SettingsTabId =
  | "general"
  | "contact"
  | "social"
  | "assistant"
  | "features"
  | "branding";

type SettingsForm = {
  festivalName: string;
  tagline: string;
  location: string;
  venue: string;
  startDate: string;
  endDate: string;
  timezone: string;
  festivalStatus: FestivalStatus;
  defaultLanguage: string;
  websiteUrl: string;

  publicEmail: string;
  supportEmail: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  googleMapsUrl: string;
  contactFormEnabled: boolean;

  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  showSocialLinksInFooter: boolean;

  assistantEnabled: boolean;
  assistantName: string;
  assistantWelcomeMessage: string;
  assistantPlaceholder: string;
  assistantOfflineMessage: string;
  escalationEmail: string;

  eventsPageEnabled: boolean;
  ticketsPageEnabled: boolean;
  experiencePageEnabled: boolean;
  galleryPageEnabled: boolean;
  faqPageEnabled: boolean;
  newsletterEnabled: boolean;

  primaryAccent: string;
  secondaryAccent: string;

  logoUrl: string;
  compactLogoUrl: string;
  faviconUrl: string;
  socialImageUrl: string;

  footerDescription: string;
  footerCopyright: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

const emptySettings: SettingsForm = {
  festivalName: "",
  tagline: "",
  location: "",
  venue: "",
  startDate: "",
  endDate: "",
  timezone: "Asia/Bangkok",
  festivalStatus: "UPCOMING",
  defaultLanguage: "English",
  websiteUrl: "",

  publicEmail: "",
  supportEmail: "",
  phoneNumber: "",
  whatsappNumber: "",
  address: "",
  googleMapsUrl: "",
  contactFormEnabled: true,

  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  spotifyUrl: "",
  showSocialLinksInFooter: true,

  assistantEnabled: true,
  assistantName: "",
  assistantWelcomeMessage: "",
  assistantPlaceholder: "",
  assistantOfflineMessage: "",
  escalationEmail: "",

  eventsPageEnabled: true,
  ticketsPageEnabled: true,
  experiencePageEnabled: true,
  galleryPageEnabled: true,
  faqPageEnabled: true,
  newsletterEnabled: false,

  primaryAccent: "#7c3aed",
  secondaryAccent: "#22d3ee",

  logoUrl: "",
  compactLogoUrl: "",
  faviconUrl: "",
  socialImageUrl: "",

  footerDescription: "",
  footerCopyright: "",
};

const tabs: Array<{
  id: SettingsTabId;
  label: string;
  icon: typeof Settings;
}> = [
  {
    id: "general",
    label: "General",
    icon: Settings,
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
  },
  {
    id: "social",
    label: "Social",
    icon: Share2,
  },
  {
    id: "assistant",
    label: "AI Assistant",
    icon: Bot,
  },
  {
    id: "features",
    label: "Features",
    icon: ToggleLeft,
  },
  {
    id: "branding",
    label: "Branding",
    icon: Palette,
  },
];

function formatDateForInput(
  value: string | null,
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function mapSettingsToForm(
  settings: WebsiteSettings,
): SettingsForm {
  return {
    festivalName: settings.festivalName,
    tagline: settings.tagline,
    location: settings.location,
    venue: settings.venue,
    startDate: formatDateForInput(
      settings.startDate,
    ),
    endDate: formatDateForInput(
      settings.endDate,
    ),
    timezone: settings.timezone,
    festivalStatus: settings.festivalStatus,
    defaultLanguage: settings.defaultLanguage,
    websiteUrl: settings.websiteUrl,

    publicEmail: settings.publicEmail,
    supportEmail: settings.supportEmail,
    phoneNumber: settings.phoneNumber,
    whatsappNumber: settings.whatsappNumber,
    address: settings.address,
    googleMapsUrl: settings.googleMapsUrl,
    contactFormEnabled:
      settings.contactFormEnabled,

    instagramUrl: settings.instagramUrl,
    facebookUrl: settings.facebookUrl,
    tiktokUrl: settings.tiktokUrl,
    youtubeUrl: settings.youtubeUrl,
    spotifyUrl: settings.spotifyUrl,
    showSocialLinksInFooter:
      settings.showSocialLinksInFooter,

    assistantEnabled: settings.assistantEnabled,
    assistantName: settings.assistantName,
    assistantWelcomeMessage:
      settings.assistantWelcomeMessage,
    assistantPlaceholder:
      settings.assistantPlaceholder,
    assistantOfflineMessage:
      settings.assistantOfflineMessage,
    escalationEmail: settings.escalationEmail,

    eventsPageEnabled:
      settings.eventsPageEnabled,
    ticketsPageEnabled:
      settings.ticketsPageEnabled,
    experiencePageEnabled:
      settings.experiencePageEnabled,
    galleryPageEnabled:
      settings.galleryPageEnabled,
    faqPageEnabled: settings.faqPageEnabled,
    newsletterEnabled:
      settings.newsletterEnabled,

    primaryAccent: settings.primaryAccent,
    secondaryAccent:
      settings.secondaryAccent,

    logoUrl: settings.logoUrl,
    compactLogoUrl: settings.compactLogoUrl,
    faviconUrl: settings.faviconUrl,
    socialImageUrl: settings.socialImageUrl,

    footerDescription:
      settings.footerDescription,
    footerCopyright: settings.footerCopyright,
  };
}

function mapFormToUpdateDto(
  settings: SettingsForm,
): UpdateWebsiteSettingsDto {
  return {
    ...settings,
    startDate: settings.startDate || null,
    endDate: settings.endDate || null,
  };
}

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

function AdminSettings() {
  const [activeTab, setActiveTab] =
    useState<SettingsTabId>("general");

  const [settings, setSettings] =
    useState<SettingsForm>(emptySettings);

  const [savedSettings, setSavedSettings] =
    useState<SettingsForm>(emptySettings);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const hasUnsavedChanges = useMemo(
    () =>
      JSON.stringify(settings) !==
      JSON.stringify(savedSettings),
    [savedSettings, settings],
  );

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setFeedback(null);

      const response = await getAdminSettings();
      const formSettings =
        mapSettingsToForm(response);

      setSettings(formSettings);
      setSavedSettings(formSettings);
    } catch (error) {
      setLoadError(
        getErrorMessage(
          error,
          "Could not load website settings.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function updateField<
    Key extends keyof SettingsForm,
  >(
    key: Key,
    value: SettingsForm[Key],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setFeedback(null);
  }

  function handleInputChange(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >,
  ) {
    const fieldName =
      event.target.name as keyof SettingsForm;

    updateField(
      fieldName,
      event.target
        .value as SettingsForm[typeof fieldName],
    );
  }

  function handleReset() {
    setSettings(savedSettings);
    setFeedback(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !hasUnsavedChanges ||
      isSaving ||
      isLoading
    ) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const updatedSettings =
        await updateAdminSettings(
          mapFormToUpdateDto(settings),
        );

      const updatedForm =
        mapSettingsToForm(updatedSettings);

      setSettings(updatedForm);
      setSavedSettings(updatedForm);

      setFeedback({
        type: "success",
        message:
          "Settings saved successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          "Could not save website settings.",
        ),
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div
        className="admin-settings__feedback"
        role="status"
      >
        <LoaderCircle
          size={18}
          className="admin-settings__spinner"
        />

        Loading website settings...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-settings">
        <div
          className="admin-settings__feedback"
          role="alert"
        >
          <AlertCircle size={18} />

          <span>{loadError}</span>

          <button
            type="button"
            className="admin-settings__secondary-button"
            onClick={() => void loadSettings()}
          >
            <RotateCcw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="admin-settings"
      onSubmit={handleSubmit}
    >
      <header className="admin-settings__header">
        <div aria-hidden="true" />

        <div
          className="admin-settings__header-actions"
          aria-label="Settings actions"
        >
          <div className="admin-settings__save-status">
            <CheckCircle2 size={16} />

            <div>
              <strong>
                {hasUnsavedChanges
                  ? "Unsaved changes"
                  : "All changes saved"}
              </strong>

              <span>
                {hasUnsavedChanges
                  ? "Review before leaving"
                  : "Configuration is up to date"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="admin-settings__secondary-button"
            disabled={
              !hasUnsavedChanges || isSaving
            }
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            Discard
          </button>

          <button
            type="submit"
            className="admin-settings__save-button"
            disabled={
              !hasUnsavedChanges || isSaving
            }
          >
            {isSaving ? (
              <LoaderCircle
                size={16}
                className="admin-settings__spinner"
              />
            ) : (
              <Save size={16} />
            )}

            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </header>

      {feedback ? (
        <div
          className={`admin-settings__feedback admin-settings__feedback--${feedback.type}`}
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

          {feedback.message}
        </div>
      ) : null}

      <nav
        className="admin-settings__tabs"
        aria-label="Settings sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={
                isActive ? "active" : ""
              }
              aria-current={
                isActive ? "page" : undefined
              }
              onClick={() =>
                setActiveTab(tab.id)
              }
            >
              <Icon size={17} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="admin-settings__panel">
        {activeTab === "general" ? (
          <>
            <SettingsSection
              icon={<Settings size={18} />}
              title="Festival information"
              description="Basic information displayed across the public website."
            >
              <div className="admin-settings__grid admin-settings__grid--two">
                <Input
                  label="Festival name"
                  name="festivalName"
                  value={settings.festivalName}
                  onChange={handleInputChange}
                />

                <Input
                  label="Tagline"
                  name="tagline"
                  value={settings.tagline}
                  onChange={handleInputChange}
                />

                <Input
                  label="Location"
                  name="location"
                  value={settings.location}
                  onChange={handleInputChange}
                />

                <Input
                  label="Venue"
                  name="venue"
                  value={settings.venue}
                  onChange={handleInputChange}
                />
              </div>
            </SettingsSection>

            <SettingsSection
              icon={<Globe2 size={18} />}
              title="Schedule and regional settings"
              description="Control festival dates and regional defaults."
            >
              <div className="admin-settings__grid admin-settings__grid--three">
                <Input
                  label="Start date"
                  name="startDate"
                  type="date"
                  value={settings.startDate}
                  onChange={handleInputChange}
                />

                <Input
                  label="End date"
                  name="endDate"
                  type="date"
                  value={settings.endDate}
                  onChange={handleInputChange}
                />

                <Select
                  label="Timezone"
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleInputChange}
                >
                  <option value="Asia/Bangkok">
                    Asia/Bangkok
                  </option>

                  <option value="Europe/Paris">
                    Europe/Paris
                  </option>

                  <option value="Africa/Tunis">
                    Africa/Tunis
                  </option>
                </Select>

                <Select
                  label="Festival status"
                  name="festivalStatus"
                  value={settings.festivalStatus}
                  onChange={handleInputChange}
                >
                  <option value="UPCOMING">
                    Upcoming
                  </option>

                  <option value="LIVE">
                    Live
                  </option>

                  <option value="FINISHED">
                    Finished
                  </option>
                </Select>

                <Select
                  label="Default language"
                  name="defaultLanguage"
                  value={settings.defaultLanguage}
                  onChange={handleInputChange}
                >
                  <option value="English">
                    English
                  </option>

                  <option value="French">
                    French
                  </option>

                  <option value="Thai">
                    Thai
                  </option>
                </Select>
              </div>
            </SettingsSection>

            <SettingsSection
              icon={<Globe2 size={18} />}
              title="Website"
              description="Global public website configuration."
            >
              <Input
                label="Website URL"
                name="websiteUrl"
                type="url"
                value={settings.websiteUrl}
                onChange={handleInputChange}
                helperText="Used for public links and generated metadata."
              />
            </SettingsSection>
          </>
        ) : null}

        {activeTab === "contact" ? (
          <>
            <SettingsSection
              icon={<Mail size={18} />}
              title="Contact information"
              description="Public contact details shown across the website."
            >
              <div className="admin-settings__grid admin-settings__grid--two">
                <Input
                  label="Public email"
                  name="publicEmail"
                  type="email"
                  value={settings.publicEmail}
                  onChange={handleInputChange}
                />

                <Input
                  label="Support email"
                  name="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={handleInputChange}
                />

                <Input
                  label="Phone number"
                  name="phoneNumber"
                  value={settings.phoneNumber}
                  onChange={handleInputChange}
                />

                <Input
                  label="WhatsApp number"
                  name="whatsappNumber"
                  value={settings.whatsappNumber}
                  onChange={handleInputChange}
                />
              </div>

              <Textarea
                label="Address"
                name="address"
                value={settings.address}
                onChange={handleInputChange}
              />

              <Input
                label="Google Maps URL"
                name="googleMapsUrl"
                type="url"
                value={settings.googleMapsUrl}
                onChange={handleInputChange}
              />
            </SettingsSection>

            <SettingsSection
              icon={<ToggleLeft size={18} />}
              title="Contact form"
              description="Control whether visitors can submit messages."
            >
              <SwitchRow
                title="Enable contact form"
                description="Allow visitors to send enquiries from the public contact page."
                checked={
                  settings.contactFormEnabled
                }
                onChange={(checked) =>
                  updateField(
                    "contactFormEnabled",
                    checked,
                  )
                }
              />
            </SettingsSection>
          </>
        ) : null}

        {activeTab === "social" ? (
          <SettingsSection
            icon={<Share2 size={18} />}
            title="Social media"
            description="Links to the festival's official social profiles."
          >
            <div className="admin-settings__grid admin-settings__grid--two">
              <Input
                label="Instagram"
                name="instagramUrl"
                type="url"
                value={settings.instagramUrl}
                onChange={handleInputChange}
              />

              <Input
                label="Facebook"
                name="facebookUrl"
                type="url"
                value={settings.facebookUrl}
                onChange={handleInputChange}
              />

              <Input
                label="TikTok"
                name="tiktokUrl"
                type="url"
                value={settings.tiktokUrl}
                onChange={handleInputChange}
              />

              <Input
                label="YouTube"
                name="youtubeUrl"
                type="url"
                value={settings.youtubeUrl}
                onChange={handleInputChange}
              />

              <Input
                label="Spotify"
                name="spotifyUrl"
                type="url"
                value={settings.spotifyUrl}
                onChange={handleInputChange}
              />
            </div>

            <SwitchRow
              title="Show social links in footer"
              description="Display available social links in the public footer."
              checked={
                settings.showSocialLinksInFooter
              }
              onChange={(checked) =>
                updateField(
                  "showSocialLinksInFooter",
                  checked,
                )
              }
            />
          </SettingsSection>
        ) : null}

        {activeTab === "assistant" ? (
          <>
            <SettingsSection
              icon={<Bot size={18} />}
              title="AI assistant"
              description="Configure the public festival assistant."
            >
              <SwitchRow
                title="Enable AI assistant"
                description="Show the assistant on supported public pages."
                checked={
                  settings.assistantEnabled
                }
                onChange={(checked) =>
                  updateField(
                    "assistantEnabled",
                    checked,
                  )
                }
              />

              <div className="admin-settings__grid admin-settings__grid--two">
                <Input
                  label="Assistant name"
                  name="assistantName"
                  value={settings.assistantName}
                  onChange={handleInputChange}
                />

                <Input
                  label="Input placeholder"
                  name="assistantPlaceholder"
                  value={
                    settings.assistantPlaceholder
                  }
                  onChange={handleInputChange}
                />
              </div>

              <Textarea
                label="Welcome message"
                name="assistantWelcomeMessage"
                value={
                  settings.assistantWelcomeMessage
                }
                onChange={handleInputChange}
              />

              <Textarea
                label="Offline message"
                name="assistantOfflineMessage"
                value={
                  settings.assistantOfflineMessage
                }
                onChange={handleInputChange}
              />

              <Input
                label="Escalation email"
                name="escalationEmail"
                type="email"
                value={settings.escalationEmail}
                onChange={handleInputChange}
                helperText="Used when a visitor needs human support."
              />
            </SettingsSection>

            <div className="admin-settings__connection-card">
              <div>
                <Sparkles size={18} />

                <div>
                  <strong>
                    AI service connected
                  </strong>

                  <span>
                    The assistant is ready to
                    receive festival knowledge.
                  </span>
                </div>
              </div>

              <span className="admin-settings__connection-status">
                Connected
              </span>
            </div>
          </>
        ) : null}

        {activeTab === "features" ? (
          <SettingsSection
            icon={<ToggleLeft size={18} />}
            title="Website features"
            description="Enable or disable public website sections."
          >
            <div className="admin-settings__feature-list">
              <SwitchRow
                title="Events page"
                description="Show published festival events."
                checked={
                  settings.eventsPageEnabled
                }
                onChange={(checked) =>
                  updateField(
                    "eventsPageEnabled",
                    checked,
                  )
                }
              />

              <SwitchRow
                title="Tickets page"
                description="Allow visitors to view ticket information."
                checked={
                  settings.ticketsPageEnabled
                }
                onChange={(checked) =>
                  updateField(
                    "ticketsPageEnabled",
                    checked,
                  )
                }
              />

              <SwitchRow
                title="Experience page"
                description="Display the festival experience content."
                checked={
                  settings.experiencePageEnabled
                }
                onChange={(checked) =>
                  updateField(
                    "experiencePageEnabled",
                    checked,
                  )
                }
              />

              <SwitchRow
                title="Gallery page"
                description="Show published festival images."
                checked={
                  settings.galleryPageEnabled
                }
                onChange={(checked) =>
                  updateField(
                    "galleryPageEnabled",
                    checked,
                  )
                }
              />

              <SwitchRow
                title="FAQ page"
                description="Display frequently asked questions."
                checked={
                  settings.faqPageEnabled
                }
                onChange={(checked) =>
                  updateField(
                    "faqPageEnabled",
                    checked,
                  )
                }
              />

              <SwitchRow
                title="Newsletter"
                description="Show the newsletter subscription section."
                checked={
                  settings.newsletterEnabled
                }
                onChange={(checked) =>
                  updateField(
                    "newsletterEnabled",
                    checked,
                  )
                }
              />
            </div>
          </SettingsSection>
        ) : null}

        {activeTab === "branding" ? (
          <>
            <SettingsSection
              icon={<Palette size={18} />}
              title="Brand colors"
              description="Control the visual accents used across the website."
            >
              <div className="admin-settings__grid admin-settings__grid--two">
                <ColorInput
                  label="Primary accent"
                  name="primaryAccent"
                  value={settings.primaryAccent}
                  onChange={handleInputChange}
                />

                <ColorInput
                  label="Secondary accent"
                  name="secondaryAccent"
                  value={
                    settings.secondaryAccent
                  }
                  onChange={handleInputChange}
                />
              </div>
            </SettingsSection>

            <SettingsSection
              icon={<Image size={18} />}
              title="Brand assets"
              description="Logo, favicon, and sharing image used throughout the website."
            >
              <div className="admin-settings__grid admin-settings__grid--two">
                <Input
                  label="Main logo URL"
                  name="logoUrl"
                  value={settings.logoUrl}
                  onChange={handleInputChange}
                />

                <Input
                  label="Compact logo URL"
                  name="compactLogoUrl"
                  value={settings.compactLogoUrl}
                  onChange={handleInputChange}
                />

                <Input
                  label="Favicon URL"
                  name="faviconUrl"
                  value={settings.faviconUrl}
                  onChange={handleInputChange}
                />

                <Input
                  label="Social sharing image"
                  name="socialImageUrl"
                  value={settings.socialImageUrl}
                  onChange={handleInputChange}
                />
              </div>

              <Textarea
                label="Footer description"
                name="footerDescription"
                value={
                  settings.footerDescription
                }
                onChange={handleInputChange}
              />

              <Input
                label="Footer copyright"
                name="footerCopyright"
                value={settings.footerCopyright}
                onChange={handleInputChange}
              />
            </SettingsSection>
          </>
        ) : null}
      </main>
    </form>
  );
}

type SettingsSectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function SettingsSection({
  icon,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="admin-settings__section">
      <div className="admin-settings__section-header">
        <span className="admin-settings__section-icon">
          {icon}
        </span>

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="admin-settings__section-content">
        {children}
      </div>
    </section>
  );
}

type StringFieldName = {
  [Key in keyof SettingsForm]:
    SettingsForm[Key] extends string
      ? Key
      : never;
}[keyof SettingsForm];

type InputProps = {
  label: string;
  name: StringFieldName;
  value: string;
  type?: string;
  helperText?: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
};

function Input({
  label,
  name,
  value,
  type = "text",
  helperText,
  onChange,
}: InputProps) {
  return (
    <label className="admin-settings__field">
      <span>{label}</span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
      />

      {helperText ? (
        <small>{helperText}</small>
      ) : null}
    </label>
  );
}

type TextareaProps = {
  label: string;
  name: StringFieldName;
  value: string;
  onChange: (
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => void;
};

function Textarea({
  label,
  name,
  value,
  onChange,
}: TextareaProps) {
  return (
    <label className="admin-settings__field">
      <span>{label}</span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

type SelectProps = {
  label: string;
  name: StringFieldName;
  value: string;
  children: ReactNode;
  onChange: (
    event: ChangeEvent<HTMLSelectElement>,
  ) => void;
};

function Select({
  label,
  name,
  value,
  children,
  onChange,
}: SelectProps) {
  return (
    <label className="admin-settings__field">
      <span>{label}</span>

      <select
        name={name}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
    </label>
  );
}

type ColorInputProps = {
  label: string;
  name: StringFieldName;
  value: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
};

function ColorInput({
  label,
  name,
  value,
  onChange,
}: ColorInputProps) {
  return (
    <label className="admin-settings__field">
      <span>{label}</span>

      <div className="admin-settings__color-field">
        <input
          type="color"
          name={name}
          value={value}
          onChange={onChange}
          aria-label={`${label} color picker`}
        />

        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
        />
      </div>
    </label>
  );
}

type SwitchRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function SwitchRow({
  title,
  description,
  checked,
  onChange,
}: SwitchRowProps) {
  return (
    <label className="admin-settings__switch-row">
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
      />

      <span
        className="admin-settings__switch"
        aria-hidden="true"
      >
        <span />
      </span>
    </label>
  );
}

export default AdminSettings;