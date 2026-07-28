import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Bot,
  CheckCircle2,
  Globe2,
  Image,
  Mail,
  Palette,
  RotateCcw,
  Save,
  Settings,
  Share2,
  Sparkles,
  ToggleLeft,
} from "lucide-react";

import "../style/admin-settings.css";

type SettingsTabId =
  | "general"
  | "contact"
  | "social"
  | "assistant"
  | "features"
  | "branding";

type FestivalStatus =
  | "UPCOMING"
  | "LIVE"
  | "FINISHED";

type SettingsForm = {
  festivalName: string;
  tagline: string;
  location: string;
  venue: string;
  startDate: string;
  endDate: string;
  timezone: string;
  status: FestivalStatus;
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
  footerCopyright: string;
};

const initialSettings: SettingsForm = {
  festivalName: "Waterfall Festival Koh Phangan",
  tagline: "Nature. Music. Freedom.",
  location: "Koh Phangan, Thailand",
  venue: "Waterfall Party Venue",
  startDate: "2025-12-28",
  endDate: "2026-01-02",
  timezone: "Asia/Bangkok",
  status: "UPCOMING",
  defaultLanguage: "English",
  websiteUrl: "https://www.waterfallfestival.com",
  publicEmail: "info@waterfallfestival.com",
  supportEmail: "support@waterfallfestival.com",
  phoneNumber: "+66 000 000 000",
  whatsappNumber: "+66 000 000 000",
  address: "Waterfall Party, Koh Phangan, Thailand",
  googleMapsUrl: "https://maps.google.com",
  contactFormEnabled: true,
  instagramUrl: "https://instagram.com/waterfallfestival",
  facebookUrl: "https://facebook.com/waterfallfestival",
  tiktokUrl: "https://tiktok.com/@waterfallfestival",
  youtubeUrl: "https://youtube.com",
  spotifyUrl: "",
  showSocialLinksInFooter: true,
  assistantEnabled: true,
  assistantName: "Waterfall Assistant",
  assistantWelcomeMessage:
    "Hi! Ask me about tickets, events, the venue, or festival information.",
  assistantPlaceholder: "Ask about the festival...",
  assistantOfflineMessage:
    "The assistant is temporarily unavailable. Please contact our support team.",
  escalationEmail: "support@waterfallfestival.com",
  eventsPageEnabled: true,
  ticketsPageEnabled: true,
  experiencePageEnabled: true,
  galleryPageEnabled: true,
  faqPageEnabled: true,
  newsletterEnabled: false,
  primaryAccent: "#7c3aed",
  secondaryAccent: "#22d3ee",
  logoUrl: "/logo.png",
  compactLogoUrl: "/logo-mark.png",
  faviconUrl: "/favicon.ico",
  socialImageUrl: "/social-share.jpg",
  footerCopyright:
    "© Waterfall Festival. All rights reserved.",
};

const tabs: Array<{
  id: SettingsTabId;
  label: string;
  icon: typeof Settings;
}> = [
  { id: "general", label: "General", icon: Settings },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "social", label: "Social", icon: Share2 },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "features", label: "Features", icon: ToggleLeft },
  { id: "branding", label: "Branding", icon: Palette },
];

function AdminSettings() {
  const [activeTab, setActiveTab] =
    useState<SettingsTabId>("general");
  const [settings, setSettings] =
    useState<SettingsForm>(initialSettings);
  const [savedSettings, setSavedSettings] =
    useState<SettingsForm>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] =
    useState<string | null>(null);

  const hasUnsavedChanges = useMemo(
    () =>
      JSON.stringify(settings) !==
      JSON.stringify(savedSettings),
    [savedSettings, settings],
  );

  function updateField<Key extends keyof SettingsForm>(
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
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));
    setFeedback(null);
  }

  function handleReset() {
    setSettings(savedSettings);
    setFeedback(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!hasUnsavedChanges || isSaving) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      await new Promise((resolve) =>
        window.setTimeout(resolve, 500),
      );
      setSavedSettings(settings);
      setFeedback("Settings saved successfully.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="admin-settings"
      onSubmit={handleSubmit}
    >
      <header className="admin-settings__header">
        <div>
          <span className="admin-settings__breadcrumb">
            Admin / Settings
          </span>
          <h1>Settings</h1>
          <p>
            Manage the global configuration of the
            Waterfall Festival website.
          </p>
        </div>

        <div className="admin-settings__header-actions">
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
            disabled={!hasUnsavedChanges || isSaving}
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            Discard
          </button>

          <button
            type="submit"
            className="admin-settings__save-button"
            disabled={!hasUnsavedChanges || isSaving}
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      {feedback ? (
        <div
          className="admin-settings__feedback"
          role="status"
        >
          <CheckCircle2 size={17} />
          {feedback}
        </div>
      ) : null}

      <nav
        className="admin-settings__tabs"
        aria-label="Settings sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={isActive ? "active" : ""}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setActiveTab(tab.id)}
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
                <Input label="Festival name" name="festivalName" value={settings.festivalName} onChange={handleInputChange} />
                <Input label="Tagline" name="tagline" value={settings.tagline} onChange={handleInputChange} />
                <Input label="Location" name="location" value={settings.location} onChange={handleInputChange} />
                <Input label="Venue" name="venue" value={settings.venue} onChange={handleInputChange} />
              </div>
            </SettingsSection>

            <SettingsSection
              icon={<Globe2 size={18} />}
              title="Schedule and regional settings"
              description="Control festival dates and regional defaults."
            >
              <div className="admin-settings__grid admin-settings__grid--three">
                <Input label="Start date" name="startDate" type="date" value={settings.startDate} onChange={handleInputChange} />
                <Input label="End date" name="endDate" type="date" value={settings.endDate} onChange={handleInputChange} />
                <Select label="Timezone" name="timezone" value={settings.timezone} onChange={handleInputChange}>
                  <option value="Asia/Bangkok">Asia/Bangkok</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Africa/Tunis">Africa/Tunis</option>
                </Select>
                <Select label="Festival status" name="status" value={settings.status} onChange={handleInputChange}>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="LIVE">Live</option>
                  <option value="FINISHED">Finished</option>
                </Select>
                <Select label="Default language" name="defaultLanguage" value={settings.defaultLanguage} onChange={handleInputChange}>
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Thai">Thai</option>
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
                <Input label="Public email" name="publicEmail" type="email" value={settings.publicEmail} onChange={handleInputChange} />
                <Input label="Support email" name="supportEmail" type="email" value={settings.supportEmail} onChange={handleInputChange} />
                <Input label="Phone number" name="phoneNumber" value={settings.phoneNumber} onChange={handleInputChange} />
                <Input label="WhatsApp number" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleInputChange} />
              </div>
              <Textarea label="Address" name="address" value={settings.address} onChange={handleInputChange} />
              <Input label="Google Maps URL" name="googleMapsUrl" type="url" value={settings.googleMapsUrl} onChange={handleInputChange} />
            </SettingsSection>

            <SettingsSection
              icon={<ToggleLeft size={18} />}
              title="Contact form"
              description="Control whether visitors can submit messages."
            >
              <SwitchRow
                title="Enable contact form"
                description="Allow visitors to send enquiries from the public contact page."
                checked={settings.contactFormEnabled}
                onChange={(checked) =>
                  updateField("contactFormEnabled", checked)
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
              <Input label="Instagram" name="instagramUrl" type="url" value={settings.instagramUrl} onChange={handleInputChange} />
              <Input label="Facebook" name="facebookUrl" type="url" value={settings.facebookUrl} onChange={handleInputChange} />
              <Input label="TikTok" name="tiktokUrl" type="url" value={settings.tiktokUrl} onChange={handleInputChange} />
              <Input label="YouTube" name="youtubeUrl" type="url" value={settings.youtubeUrl} onChange={handleInputChange} />
              <Input label="Spotify" name="spotifyUrl" type="url" value={settings.spotifyUrl} onChange={handleInputChange} />
            </div>
            <SwitchRow
              title="Show social links in footer"
              description="Display available social links in the public footer."
              checked={settings.showSocialLinksInFooter}
              onChange={(checked) =>
                updateField("showSocialLinksInFooter", checked)
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
                checked={settings.assistantEnabled}
                onChange={(checked) =>
                  updateField("assistantEnabled", checked)
                }
              />
              <div className="admin-settings__grid admin-settings__grid--two">
                <Input label="Assistant name" name="assistantName" value={settings.assistantName} onChange={handleInputChange} />
                <Input label="Input placeholder" name="assistantPlaceholder" value={settings.assistantPlaceholder} onChange={handleInputChange} />
              </div>
              <Textarea label="Welcome message" name="assistantWelcomeMessage" value={settings.assistantWelcomeMessage} onChange={handleInputChange} />
              <Textarea label="Offline message" name="assistantOfflineMessage" value={settings.assistantOfflineMessage} onChange={handleInputChange} />
              <Input label="Escalation email" name="escalationEmail" type="email" value={settings.escalationEmail} onChange={handleInputChange} helperText="Used when a visitor needs human support." />
            </SettingsSection>

            <div className="admin-settings__connection-card">
              <div>
                <Sparkles size={18} />
                <div>
                  <strong>AI service connected</strong>
                  <span>The assistant is ready to receive festival knowledge.</span>
                </div>
              </div>
              <span className="admin-settings__connection-status">Connected</span>
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
              <SwitchRow title="Events page" description="Show published festival events." checked={settings.eventsPageEnabled} onChange={(checked) => updateField("eventsPageEnabled", checked)} />
              <SwitchRow title="Tickets page" description="Allow visitors to view ticket information." checked={settings.ticketsPageEnabled} onChange={(checked) => updateField("ticketsPageEnabled", checked)} />
              <SwitchRow title="Experience page" description="Display the festival experience content." checked={settings.experiencePageEnabled} onChange={(checked) => updateField("experiencePageEnabled", checked)} />
              <SwitchRow title="Gallery page" description="Show published festival images." checked={settings.galleryPageEnabled} onChange={(checked) => updateField("galleryPageEnabled", checked)} />
              <SwitchRow title="FAQ page" description="Display frequently asked questions." checked={settings.faqPageEnabled} onChange={(checked) => updateField("faqPageEnabled", checked)} />
              <SwitchRow title="Newsletter" description="Show the newsletter subscription section." checked={settings.newsletterEnabled} onChange={(checked) => updateField("newsletterEnabled", checked)} />
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
                <ColorInput label="Primary accent" name="primaryAccent" value={settings.primaryAccent} onChange={handleInputChange} />
                <ColorInput label="Secondary accent" name="secondaryAccent" value={settings.secondaryAccent} onChange={handleInputChange} />
              </div>
            </SettingsSection>

            <SettingsSection
              icon={<Image size={18} />}
              title="Brand assets"
              description="Logo, favicon, and sharing image used throughout the website."
            >
              <div className="admin-settings__grid admin-settings__grid--two">
                <Input label="Main logo URL" name="logoUrl" value={settings.logoUrl} onChange={handleInputChange} />
                <Input label="Compact logo URL" name="compactLogoUrl" value={settings.compactLogoUrl} onChange={handleInputChange} />
                <Input label="Favicon URL" name="faviconUrl" value={settings.faviconUrl} onChange={handleInputChange} />
                <Input label="Social sharing image" name="socialImageUrl" value={settings.socialImageUrl} onChange={handleInputChange} />
              </div>
              <Input label="Footer copyright" name="footerCopyright" value={settings.footerCopyright} onChange={handleInputChange} />
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

type InputProps = {
  label: string;
  name: keyof SettingsForm;
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
      {helperText ? <small>{helperText}</small> : null}
    </label>
  );
}

type TextareaProps = {
  label: string;
  name: keyof SettingsForm;
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
  name: keyof SettingsForm;
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
  name: keyof SettingsForm;
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