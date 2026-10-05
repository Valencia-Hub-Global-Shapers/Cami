"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";

const MIN_LENGTH = 8;

export default function AccountPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_LENGTH) {
      setMessage(`Use at least ${MIN_LENGTH} characters.`);
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setMessage("The two passwords do not match.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setStatus("error");
      return;
    }
    setPassword("");
    setConfirm("");
    setMessage("");
    setStatus("saved");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-8">
      <AdminNav active="account" />
      <div className="flex max-w-sm flex-col gap-6">
        <h1 className="font-serif text-3xl font-semibold">Change password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">New password</span>
            <input
              type="password"
              required
              minLength={MIN_LENGTH}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Confirm new password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input"
            />
          </label>
          <button
            type="submit"
            disabled={status === "saving"}
            className="btn-primary"
          >
            {status === "saving" ? "Saving..." : "Change password"}
          </button>
          {status === "saved" && (
            <p role="status" className="text-sm text-muted">
              Password updated.
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="text-sm text-danger">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
