import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import {
  ArrowRight,
  Clock3,
  Facebook,
  Instagram,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  Youtube,
} from "lucide-react";

import {
  sendContactMessage,
  type CreateContactMessageDto,
} from "../services/contact.service";

import "./style/contact.css";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

function Contact() {
  const [formData, setFormData] =
    useState<ContactFormState>(
      initialFormState,
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ): void {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    if (successMessage) {
      setSuccessMessage("");
    }

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const trimmedName = formData.name.trim();

    const trimmedEmail = formData.email
      .trim()
      .toLowerCase();

    const trimmedPhone = formData.phone.trim();

    const trimmedSubject =
      formData.subject.trim();

    const trimmedMessage =
      formData.message.trim();

    if (trimmedName.length < 2) {
      setErrorMessage(
        "Please enter a name with at least 2 characters.",
      );

      return;
    }

    if (!trimmedEmail) {
      setErrorMessage(
        "Please enter your email address.",
      );

      return;
    }

    if (trimmedMessage.length < 10) {
      setErrorMessage(
        "Your message must contain at least 10 characters.",
      );

      return;
    }

    const payload: CreateContactMessageDto = {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
    };

    if (trimmedPhone) {
      payload.phone = trimmedPhone;
    }

    if (trimmedSubject) {
      payload.subject = trimmedSubject;
    }

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      await sendContactMessage(payload);

      setFormData(initialFormState);

      setSuccessMessage(
        "Your message was sent successfully. The Waterfall Festival team will contact you soon.",
      );
    } catch (error) {
      console.error(
        "Unable to send contact message:",
        error,
      );

      setErrorMessage(
        "We could not send your message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-overlay" />

        <div className="contact-hero-content">
          <p className="contact-label">
            Contact
          </p>

          <h1 className="contact-title">
            Get in Touch
          </h1>

          <div
            className="contact-title-line"
            aria-hidden="true"
          />

          <p className="contact-description">
            Questions about tickets, events,
            partnerships, or the venue? Send us
            a message and our team will help you.
          </p>
        </div>
      </section>

      <section className="contact-content">
        <div className="contact-container">
          <div className="contact-grid">
            <form
              className="contact-card contact-form-card"
              onSubmit={(event) =>
                void handleSubmit(event)
              }
              noValidate
            >
              <div className="contact-card-header">
                <div
                  className="contact-card-icon"
                  aria-hidden="true"
                >
                  <MessageSquareText size={22} />
                </div>

                <div>
                  <h2 className="contact-card-title">
                    Send us a Message
                  </h2>

                  <p className="contact-card-subtitle">
                    We usually reply within
                    <span> 24–48 hours.</span>
                  </p>
                </div>
              </div>

              <div className="contact-form-grid">
                <div className="contact-field">
                  <label htmlFor="contact-name">
                    Name
                  </label>

                  <input
                    id="contact-name"
                    className="contact-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="Your name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    required
                    disabled={isSubmitting}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">
                    Email
                  </label>

                  <input
                    id="contact-email"
                    className="contact-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="you@example.com"
                    autoComplete="email"
                    maxLength={255}
                    required
                    disabled={isSubmitting}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-phone">
                    Phone number
                    <span> (optional)</span>
                  </label>

                  <input
                    id="contact-phone"
                    className="contact-input"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    placeholder="+66 99 247 8892"
                    autoComplete="tel"
                    maxLength={30}
                    disabled={isSubmitting}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-subject">
                    Subject
                    <span> (optional)</span>
                  </label>

                  <input
                    id="contact-subject"
                    className="contact-input"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    placeholder="What is this about?"
                    maxLength={150}
                    disabled={isSubmitting}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="contact-field contact-field--full">
                  <label htmlFor="contact-message">
                    Message
                  </label>

                  <textarea
                    id="contact-message"
                    className="contact-textarea"
                    name="message"
                    value={formData.message}
                    placeholder="Tell us how we can help..."
                    minLength={10}
                    maxLength={3000}
                    required
                    disabled={isSubmitting}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {successMessage && (
                <p
                  className="contact-form-message contact-form-message--success"
                  role="status"
                >
                  {successMessage}
                </p>
              )}

              {errorMessage && (
                <p
                  className="contact-form-message contact-form-message--error"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

              <button
                className="contact-button"
                type="submit"
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting ? (
                    <>
                      <Send
                        size={18}
                        aria-hidden="true"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight
                        size={18}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </span>
              </button>

              <p className="contact-privacy">
                <LockKeyhole
                  size={14}
                  aria-hidden="true"
                />

                Your information is secure and
                will never be shared.
              </p>
            </form>

            <aside className="contact-card contact-details-card">
              <h2 className="contact-details-title">
                Need a quick answer?
              </h2>

              <div className="contact-details-list">
                <a
                  className="contact-detail-item"
                  href="mailto:waterfallpartyphangan@gmail.com"
                >
                  <span
                    className="contact-detail-icon"
                    aria-hidden="true"
                  >
                    <Mail size={21} />
                  </span>

                  <span className="contact-detail-content">
                    <strong>Email</strong>

                    <span className="contact-detail-value">
                      waterfallpartyphangan@gmail.com
                    </span>

                    <small>
                      We will get back to you as
                      soon as possible.
                    </small>
                  </span>
                </a>

                <a
                  className="contact-detail-item"
                  href="tel:+66992478892"
                >
                  <span
                    className="contact-detail-icon"
                    aria-hidden="true"
                  >
                    <Phone size={21} />
                  </span>

                  <span className="contact-detail-content">
                    <strong>Phone</strong>

                    <span className="contact-detail-value">
                      +66 99 247 8892
                    </span>

                    <small>
                      Call or contact us through
                      WhatsApp.
                    </small>
                  </span>
                </a>

                <div className="contact-detail-item">
                  <span
                    className="contact-detail-icon"
                    aria-hidden="true"
                  >
                    <MapPin size={21} />
                  </span>

                  <span className="contact-detail-content">
                    <strong>Location</strong>

                    <span className="contact-detail-value">
                      Koh Phangan, Thailand
                    </span>

                    <small>
                      Home of the Waterfall
                      Festival.
                    </small>
                  </span>
                </div>

                <div className="contact-detail-item">
                  <span
                    className="contact-detail-icon"
                    aria-hidden="true"
                  >
                    <Clock3 size={21} />
                  </span>

                  <span className="contact-detail-content">
                    <strong>Response time</strong>

                    <span className="contact-detail-value">
                      Within 24–48 hours
                    </span>

                    <small>
                      Response times may vary
                      during event days.
                    </small>
                  </span>
                </div>
              </div>

              <div className="contact-socials">
                <a
                  href="#"
                  aria-label="Waterfall Festival on Instagram"
                >
                  <Instagram size={20} />
                </a>

                <a
                  href="#"
                  aria-label="Waterfall Festival on Facebook"
                >
                  <Facebook size={20} />
                </a>

                <a
                  href="#"
                  aria-label="Waterfall Festival on YouTube"
                >
                  <Youtube size={20} />
                </a>
              </div>
            </aside>
          </div>

          <div className="contact-footer-message">
            <div
              className="contact-footer-icon"
              aria-hidden="true"
            >
              <MessageSquareText size={22} />
            </div>

            <h2>We’re here to help</h2>

            <p>
              Whether it is about tickets,
              collaborations, or anything else,
              we are just a message away.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;