"use client";

import { useState } from "react";

export default function UpdateForm({ tagId }: { tagId: string }) {
  const [name, setName] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "phone">(
    "email"
  );
  const [contact, setContact] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit =
    name.trim() !== "" &&
    contact.trim() !== "" &&
    destinationUrl.trim() !== "" &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `/api/tags/${encodeURIComponent(tagId)}/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: contactMethod === "email" ? contact.trim() : null,
            phone: contactMethod === "phone" ? contact.trim() : null,
            destination_url: destinationUrl.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess("Destination updated. This tag now points to your new link.");
      setSubmitting(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </div>

      <div className="field">
        <div className="toggle">
          <button
            type="button"
            className={contactMethod === "email" ? "active" : ""}
            onClick={() => {
              setContactMethod("email");
              setContact("");
            }}
          >
            Email
          </button>
          <button
            type="button"
            className={contactMethod === "phone" ? "active" : ""}
            onClick={() => {
              setContactMethod("phone");
              setContact("");
            }}
          >
            Phone
          </button>
        </div>
        <input
          id="contact"
          type={contactMethod === "email" ? "email" : "tel"}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={
            contactMethod === "email" ? "you@example.com" : "555 123 4567"
          }
          autoComplete={contactMethod === "email" ? "email" : "tel"}
        />
      </div>

      <div className="field">
        <label htmlFor="destination">New destination URL</label>
        <input
          id="destination"
          type="text"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          placeholder="https://"
          inputMode="url"
        />
      </div>

      <button type="submit" className="btn" disabled={!canSubmit}>
        {submitting ? "Saving…" : "Confirm update"}
      </button>

      {error && <p className="message error">{error}</p>}
      {success && <p className="message">{success}</p>}
    </form>
  );
}
