"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  not_admin:
    "This account is signed in but is not an admin yet. Ask the Valencia Hub team to grant access.",
  link_invalid: "That sign-in link has expired or was already used. Request a new one."
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = ERROR_MESSAGES[searchParams.get("error") ?? ""];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();

    if (usePassword) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        setErrorDetail(error.message);
        setStatus("error");
        return;
      }
      window.location.assign("/admin");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        shouldCreateUser: true
      }
    });
    setErrorDetail(error ? error.message : "");
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-24 sm:px-8">
      <h1 className="font-serif text-3xl font-semibold">Admin sign in</h1>
      {urlError && status !== "sent" && (
        <p role="alert" className="rounded-card border border-border bg-sand p-4 text-sm text-muted">
          {urlError}
        </p>
      )}
      {status === "sent" ? (
        <p className="text-muted" role="status">
          Check <strong className="text-ink">{email}</strong> for a sign-in
          link. You can close this tab.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </label>
          {usePassword && (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </label>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-primary"
          >
            {status === "sending"
              ? usePassword
                ? "Signing in..."
                : "Sending..."
              : usePassword
                ? "Sign in"
                : "Send sign-in link"}
          </button>
          <button
            type="button"
            onClick={() => {
              setUsePassword(!usePassword);
              setStatus("idle");
              setErrorDetail("");
            }}
            className="text-sm text-muted underline"
          >
            {usePassword ? "Use an email link instead" : "Use a password instead"}
          </button>
          {status === "error" && (
            <p role="alert" className="text-sm text-danger">
              {usePassword
                ? "Could not sign in. Check your email and password."
                : "Could not send the link. Check the address and try again."}
              {errorDetail && (
                <span className="mt-1 block text-muted">
                  Details: {errorDetail}
                </span>
              )}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
