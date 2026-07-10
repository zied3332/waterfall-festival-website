import { Save, Settings, Mail, Share2, Bot, Palette } from "lucide-react";
import "../style/admin-settings.css";

function AdminSettings() {
  return (
    <section className="admin-settings">
      <div className="admin-settings__header">
        <div>
          <span className="admin-settings__eyebrow">Website Control</span>
          <h1>Settings</h1>
          <p>Manage festival information, contact details, social links, AI chat, and website appearance.</p>
        </div>

        <button className="admin-settings__save">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="admin-settings__grid">
        <div className="admin-settings__card">
          <div className="admin-settings__card-title">
            <Settings size={20} />
            <h2>Festival Information</h2>
          </div>

          <label>
            Festival Name
            <input type="text" defaultValue="Waterfall Festival Koh Phangan" />
          </label>

          <label>
            Location
            <input type="text" defaultValue="Koh Phangan, Thailand" />
          </label>

          <label>
            Festival Dates
            <input type="text" defaultValue="December 28 - January 2" />
          </label>
        </div>

        <div className="admin-settings__card">
          <div className="admin-settings__card-title">
            <Mail size={20} />
            <h2>Contact Information</h2>
          </div>

          <label>
            Support Email
            <input type="email" defaultValue="info@waterfallfestival.com" />
          </label>

          <label>
            Phone Number
            <input type="text" defaultValue="+66 000 000 000" />
          </label>

          <label>
            Google Maps Link
            <input type="text" defaultValue="https://maps.google.com" />
          </label>
        </div>

        <div className="admin-settings__card">
          <div className="admin-settings__card-title">
            <Share2 size={20} />
            <h2>Social Media</h2>
          </div>

          <label>
            Instagram
            <input type="text" defaultValue="https://instagram.com/waterfallfestival" />
          </label>

          <label>
            Facebook
            <input type="text" defaultValue="https://facebook.com/waterfallfestival" />
          </label>

          <label>
            TikTok
            <input type="text" defaultValue="https://tiktok.com/@waterfallfestival" />
          </label>
        </div>

        <div className="admin-settings__card">
          <div className="admin-settings__card-title">
            <Bot size={20} />
            <h2>AI Chat Settings</h2>
          </div>

          <label>
            AI Assistant Name
            <input type="text" defaultValue="Waterfall Assistant" />
          </label>

          <label>
            Welcome Message
            <textarea defaultValue="Hi! Ask me about tickets, events, venue, or festival information." />
          </label>

          <label className="admin-settings__switch-row">
            Enable AI Chat
            <input type="checkbox" defaultChecked />
          </label>
        </div>

        <div className="admin-settings__card admin-settings__card--wide">
          <div className="admin-settings__card-title">
            <Palette size={20} />
            <h2>Appearance</h2>
          </div>

          <div className="admin-settings__two-columns">
            <label>
              Primary Color
              <input type="text" defaultValue="#22d3ee" />
            </label>

            <label>
              Secondary Color
              <input type="text" defaultValue="#7c3aed" />
            </label>

            <label>
              Logo URL
              <input type="text" defaultValue="/logo.png" />
            </label>

            <label>
              Favicon URL
              <input type="text" defaultValue="/favicon.ico" />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminSettings;