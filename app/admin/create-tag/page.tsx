"use client";

import { useState } from "react";

export default function CreateTagPage() {
  const [tagId, setTagId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");

  const canSubmit = tagId.trim() !== "" && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    setCreatedId("");

    try {
      const res = await fetch("/api/admin/create-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tagId.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setCreatedId(data.id);
      setTagId("");
      setSubmitting(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <div className="card">
        <h1>Create tag</h1>
        <p className="subtext">Register a new NFC tag</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="tagId">Unique tag ID</label>
            <input
              id="tagId"
              type="text"
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
              placeholder="e.g. a1b2c3"
              autoComplete="off"
            />
          </div>

          <button type="submit" className="btn" disabled={!canSubmit}>
            {submitting ? "Creating…" : "Create tag"}
          </button>

          {error && <p className="message error">{error}</p>}
          {createdId && (
            <p className="message">
              Tag created. Program the NFC tag with:
              <br />
              <strong>https://osdraft.com/tag/{createdId}</strong>
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
