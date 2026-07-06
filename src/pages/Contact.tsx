import "./style/contact.css";

function Contact() {
  return (
    <section className="contact-page">
      <div className="contact-container">
        <p className="contact-label">Contact</p>

        <h1 className="contact-title">Get in Touch</h1>

        <p className="contact-description">
          Questions about tickets, events, partnerships, or the venue? Send us a
          message and the Waterfall Festival team will help you.
        </p>

        <div className="contact-grid">
          <div className="contact-card">
            <h2 className="contact-card-title">Contact Details</h2>

            <div className="contact-details">
              <p>Email: waterfallpartyphangan@gmail.com</p>
              <p>Phone: +66 99 247 8892</p>
              <p>Location: Koh Phangan, Thailand</p>
            </div>
          </div>

          <form className="contact-card">
            <h2 className="contact-card-title">Send Message</h2>

            <input
              className="contact-input"
              placeholder="Your name"
            />

            <input
              className="contact-input"
              placeholder="Your email"
            />

            <textarea
              className="contact-textarea"
              placeholder="Your message"
            />

            <button className="contact-button">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;