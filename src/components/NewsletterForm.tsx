"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm({
  placeholder,
  buttonLabel,
  successMessage,
  errorMessage,
}: {
  placeholder: string;
  buttonLabel: string;
  successMessage: string;
  errorMessage: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <input
        type="email"
        name="email"
        required
        placeholder={placeholder}
        className="w-full flex-1 rounded-full border border-line-strong bg-bg px-4 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-gold focus:outline-none sm:max-w-xs"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {buttonLabel}
      </button>
      {status === "success" && (
        <p className="text-sm text-bull sm:basis-full">{successMessage}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-bear sm:basis-full">{errorMessage}</p>
      )}
    </form>
  );
}
