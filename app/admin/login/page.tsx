"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`
      }
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-8 py-24">
      <h1 className="font-serif text-3xl font-semibold">Admin sign in</h1>
      {status === "sent" ? (
        <p className="text-muted">
          Check your inbox for a sign-in link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-white px-4 py-2.5"
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-pill bg-terracotta px-6 py-2.5 font-medium text-cream hover:bg-terracotta-hover"
          >
            {status === "sending" ? "Sending..." : "Send sign-in link"}
          </button>
          {status === "error" && (
            <p className="text-sm text-[#9C4A3A]">
              Could not send the link. Check the address and try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
