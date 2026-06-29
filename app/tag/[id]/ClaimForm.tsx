"use client";

import { useEffect, useState } from "react";

const COUNTDOWN_SECONDS = 10;

export default function ClaimForm({
  tagId,
  product,
}: {
  tagId: string;
  product: string | null;
}) {
  const [name, setName] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "phone">(
    "email"
  );
  const [contact, setContact] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  // Product docs to send the customer to after setup. Falls back to the docs
  // index if a tag somehow has no product set.
  const docsUrl = product ? `/osdocs/${product}` : "/osdocs";

  // After a successful setup, count down and then redirect this tab to the
  // product's open-source documentation.
  useEffect(() => {
    if (!done) return;
    if (seconds <= 0) {
      window.location.href = docsUrl;
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [done, seconds, docsUrl]);

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

    try {
      const res = await fetch(`/api/tags/${encodeURIComponent(tagId)}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: contactMethod === "email" ? contact.trim() : null,
          phone: contactMethod === "phone" ? contact.trim() : null,
          destination_url: destinationUrl.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div>
        <p className="message">
          Setup complete. Your tag is now active and will redirect to your link
          on every future tap.
        </p>
        <p className="countdown">
          Opening the documentation in <strong>{seconds}</strong> second
          {seconds === 1 ? "" : "s"}…
        </p>
        <a
          className="btn"
          href={docsUrl}
          style={{ textDecoration: "none", textAlign: "center" }}
        >
          Open now
        </a>
      </div>
    );
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
        <label htmlFor="destination">Destination URL</label>
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
        {submitting ? "Saving…" : "Submit"}
      </button>

      {error && <p className="message error">{error}</p>}
    </form>
  );
}
