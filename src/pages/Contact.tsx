import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

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
    <section className="contact-page">
      <div className="contact-container">
        <p className="contact-label">
          Contact
        </p>

        <h1 className="contact-title">
          Get in Touch
        </h1>

        <p className="contact-description">
          Questions about tickets, events,
          partnerships, or the venue? Send us
          a message and the Waterfall Festival
          team will help you.
        </p>

        <div className="contact-grid">
          <div className="contact-card">
            <h2 className="contact-card-title">
              Contact Details
            </h2>

            <div className="contact-details">
              <p>
                Email:
                {" "}
                waterfallpartyphangan@gmail.com
              </p>

              <p>
                Phone: +66 99 247 8892
              </p>

              <p>
                Location: Koh Phangan, Thailand
              </p>
            </div>
          </div>

          <form
            className="contact-card"
            onSubmit={(event) =>
              void handleSubmit(event)
            }
          >
            <h2 className="contact-card-title">
              Send Message
            </h2>

            <input
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

            <input
              className="contact-input"
              type="email"
              name="email"
              value={formData.email}
              placeholder="Your email"
              autoComplete="email"
              maxLength={255}
              required
              disabled={isSubmitting}
              onChange={handleInputChange}
            />

            <input
              className="contact-input"
              type="tel"
              name="phone"
              value={formData.phone}
              placeholder="Phone number (optional)"
              autoComplete="tel"
              maxLength={30}
              disabled={isSubmitting}
              onChange={handleInputChange}
            />

            <input
              className="contact-input"
              type="text"
              name="subject"
              value={formData.subject}
              placeholder="Subject (optional)"
              maxLength={150}
              disabled={isSubmitting}
              onChange={handleInputChange}
            />

            <textarea
              className="contact-textarea"
              name="message"
              value={formData.message}
              placeholder="Your message"
              minLength={10}
              maxLength={3000}
              required
              disabled={isSubmitting}
              onChange={handleInputChange}
            />

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
              {isSubmitting
                ? "Sending..."
                : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;