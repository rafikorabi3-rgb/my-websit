"use client";

import { useState, type FormEvent } from "react";

export function ContactForm({
  labels,
}: {
  labels: {
    name: string;
    email: string;
    message: string;
    submit: string;
    success: string;
    error: string;
  };
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-line-strong bg-bg px-4 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-gold focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        name="name"
        required
        placeholder={labels.name}
        className={fieldClass}
      />
      <input
        type="email"
        name="email"
        required
        placeholder={labels.email}
        className={fieldClass}
      />
      <textarea
        name="message"
        required
        rows={5}
        placeholder={labels.message}
        className={fieldClass}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="self-start rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {labels.submit}
      </button>
      {status === "success" && (
        <p className="text-sm text-bull">{labels.success}</p>
      )}
      {status === "error" && <p className="text-sm text-bear">{labels.error}</p>}
    </form>
  );
}
