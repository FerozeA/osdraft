"use client";

import { useState } from "react";
import { PRODUCTS } from "@/lib/products";

export default function CreateTagPage() {
  const [tagId, setTagId] = useState("");
  const [product, setProduct] = useState(PRODUCTS[0]?.slug ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdUrl, setCreatedUrl] = useState("");

  const canSubmit = tagId.trim() !== "" && product !== "" && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    setCreatedUrl("");

    try {
      const res = await fetch("/api/admin/create-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tagId.trim(), product }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setCreatedUrl(`${window.location.origin}/tag/${data.id}`);
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

          <div className="field">
            <label htmlFor="product">Product</label>
            <select
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            >
              {PRODUCTS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn" disabled={!canSubmit}>
            {submitting ? "Creating…" : "Create tag"}
          </button>

          {error && <p className="message error">{error}</p>}
          {createdUrl && (
            <p className="message">
              Tag created. Program the NFC tag with:
              <br />
              <strong>{createdUrl}</strong>
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
