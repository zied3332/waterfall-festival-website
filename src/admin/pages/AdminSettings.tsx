import { useState } from "react";
import { Save, Settings, Mail, Share2, Bot, Palette } from "lucide-react";
import "../style/admin-settings.css";

const tabs = [
  { id: "festival", label: "Festival Info", icon: Settings },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "chat", label: "AI Chat", icon: Bot },
  { id: "appearance", label: "Appearance", icon: Palette },
];

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("festival");

  return (
    <section className="admin-settings">
      <div className="admin-settings__header">
        <div>
          <span className="admin-settings__eyebrow">Website Control</span>
          <h1>Settings</h1>
          <p>
            Manage the main configuration of the Waterfall Festival website.
          </p>
        </div>

        <button className="admin-settings__save">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="admin-settings__layout">
        <aside className="admin-settings__tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        <div className="admin-settings__panel">
          {activeTab === "festival" && (
            <SettingsCard
              icon={<Settings size={20} />}
              title="Festival Information"
              description="Basic information displayed across the website."
            >
              <Input label="Festival Name" value="Waterfall Festival Koh Phangan" />
              <Input label="Location" value="Koh Phangan, Thailand" />
              <Input label="Festival Dates" value="December 28 - January 2" />
              <Input label="Timezone" value="Asia/Bangkok" />
            </SettingsCard>
          )}

          {activeTab === "contact" && (
            <SettingsCard
              icon={<Mail size={20} />}
              title="Contact Information"
              description="Contact details shown in the footer and contact page."
            >
              <Input label="Support Email" type="email" value="info@waterfallfestival.com" />
              <Input label="Phone Number" value="+66 000 000 000" />
              <Input label="Google Maps Link" value="https://maps.google.com" />
              <Textarea label="Address" value="Waterfall Party, Koh Phangan, Thailand" />
            </SettingsCard>
          )}

          {activeTab === "social" && (
            <SettingsCard
              icon={<Share2 size={20} />}
              title="Social Media"
              description="Links to official festival social platforms."
            >
              <Input label="Instagram" value="https://instagram.com/waterfallfestival" />
              <Input label="Facebook" value="https://facebook.com/waterfallfestival" />
              <Input label="TikTok" value="https://tiktok.com/@waterfallfestival" />
              <Input label="YouTube" value="https://youtube.com" />
            </SettingsCard>
          )}

          {activeTab === "chat" && (
            <SettingsCard
              icon={<Bot size={20} />}
              title="AI Chat Settings"
              description="Control the floating AI assistant on the public website."
            >
              <Input label="AI Assistant Name" value="Waterfall Assistant" />
              <Textarea
                label="Welcome Message"
                value="Hi! Ask me about tickets, events, venue, or festival information."
              />

              <label className="admin-settings__switch-row">
                Enable AI Chat
                <input type="checkbox" defaultChecked />
              </label>
            </SettingsCard>
          )}

          {activeTab === "appearance" && (
            <SettingsCard
              icon={<Palette size={20} />}
              title="Appearance"
              description="Control branding, colors, logo, and favicon."
            >
              <div className="admin-settings__two-columns">
                <Input label="Primary Color" value="#22d3ee" />
                <Input label="Secondary Color" value="#7c3aed" />
                <Input label="Logo URL" value="/logo.png" />
                <Input label="Favicon URL" value="/favicon.ico" />
              </div>
            </SettingsCard>
          )}
        </div>
      </div>
    </section>
  );
}

type SettingsCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
};

function SettingsCard({ icon, title, description, children }: SettingsCardProps) {
  return (
    <div className="admin-settings__card">
      <div className="admin-settings__card-title">
        {icon}
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="admin-settings__form">{children}</div>
    </div>
  );
}

type InputProps = {
  label: string;
  value: string;
  type?: string;
};

function Input({ label, value, type = "text" }: InputProps) {
  return (
    <label>
      {label}
      <input type={type} defaultValue={value} />
    </label>
  );
}

type TextareaProps = {
  label: string;
  value: string;
};

function Textarea({ label, value }: TextareaProps) {
  return (
    <label>
      {label}
      <textarea defaultValue={value} />
    </label>
  );
}

export default AdminSettings;