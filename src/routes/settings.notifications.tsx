import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  loadPrefs,
  savePrefs,
  DEFAULT_PREFS,
  KIND_META,
  CHANNEL_META,
  getPushPermission,
  requestPushPermission,
  type NotificationPrefs,
  type NotificationChannel,
} from "@/lib/notification-settings";
import type { NotificationKind } from "@/lib/applications";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notification settings — ROOMIE" },
      {
        name: "description",
        content:
          "Choose how ROOMIE alerts you when a landlord accepts, declines, or reopens an application — in-app, email, or push.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationSettingsPage,
});

const KINDS: NotificationKind[] = ["accepted", "declined", "reopened"];
const CHANNELS: NotificationChannel[] = ["in_app", "email", "push"];

function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [pushPerm, setPushPerm] = useState<
    NotificationPermission | "unsupported"
  >("default");

  useEffect(() => {
    setPrefs(loadPrefs());
    setPushPerm(getPushPermission());
  }, []);

  const anyPushOn = CHANNELS.some(() => false) || KINDS.some((k) => prefs[k].push);

  const toggle = (kind: NotificationKind, channel: NotificationChannel) => {
    const next: NotificationPrefs = {
      ...prefs,
      [kind]: { ...prefs[kind], [channel]: !prefs[kind][channel] },
    };
    setPrefs(next);
    savePrefs(next);
  };

  const enablePush = async () => {
    const result = await requestPushPermission();
    setPushPerm(result);
    if (result === "granted") {
      toast.success("Push enabled", {
        description: "Browser push alerts are now on.",
      });
    } else if (result === "denied") {
      toast.error("Push blocked", {
        description:
          "Enable notifications for this site in your browser settings.",
      });
    }
  };

  const resetDefaults = () => {
    setPrefs(DEFAULT_PREFS);
    savePrefs(DEFAULT_PREFS);
    toast("Defaults restored");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="size-7 rounded-full bg-primary" />
            <span className="font-display text-2xl font-bold tracking-tight">
              roomie
            </span>
          </Link>
          <div className="hidden gap-8 text-sm font-medium md:flex">
            <Link to="/browse" className="hover:text-primary">
              Find a Room
            </Link>
            <Link to="/applications" className="hover:text-primary">
              Applications
            </Link>
            <Link to="/landlord" className="hover:text-primary">
              Landlord
            </Link>
          </div>
          <button className="rounded-full border border-border px-5 py-2 text-sm font-medium">
            Login
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Settings · Notifications
          </p>
          <h1 className="font-display text-4xl md:text-5xl">
            How should we reach you?
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Pick a channel for each landlord action. Changes save instantly.
          </p>
        </header>

        {anyPushOn && pushPerm !== "granted" && pushPerm !== "unsupported" && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-4">
            <div>
              <p className="text-sm font-medium">Push isn't enabled yet</p>
              <p className="text-xs text-muted-foreground">
                Grant browser permission so we can actually deliver push alerts.
              </p>
            </div>
            <button
              onClick={enablePush}
              className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
            >
              Enable push
            </button>
          </div>
        )}
        {pushPerm === "unsupported" && (
          <div className="mb-6 rounded-2xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
            This browser doesn't support push notifications — in-app and email
            will still work.
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="hidden grid-cols-[1.4fr_repeat(3,1fr)] gap-4 border-b border-border p-4 text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground sm:grid">
            <span>Action</span>
            {CHANNELS.map((c) => (
              <span key={c} className="text-center">
                {CHANNEL_META[c].label}
              </span>
            ))}
          </div>
          <ul className="divide-y divide-border">
            {KINDS.map((k) => (
              <li
                key={k}
                className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[1.4fr_repeat(3,1fr)] sm:items-center"
              >
                <div>
                  <p className="font-display text-lg">{KIND_META[k].label}</p>
                  <p className="text-xs text-muted-foreground">
                    {KIND_META[k].description}
                  </p>
                </div>
                {CHANNELS.map((c) => {
                  const on = prefs[k][c];
                  return (
                    <label
                      key={c}
                      className="flex items-center justify-between gap-3 rounded-full border border-border px-3 py-2 text-xs sm:justify-center sm:border-0 sm:p-0"
                    >
                      <span className="sm:hidden">{CHANNEL_META[c].label}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label={`${CHANNEL_META[c].label} for ${KIND_META[k].label}`}
                        onClick={() => toggle(k, c)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                          on ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block size-5 transform rounded-full bg-background shadow transition-transform ${
                            on ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </label>
                  );
                })}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Email is sent to the address on each application. Push uses your
            browser's native notifications.
          </p>
          <button
            onClick={resetDefaults}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
          >
            Reset to defaults
          </button>
        </div>

        <div className="mt-8">
          <Link
            to="/applications"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to applications
          </Link>
        </div>
      </main>
    </div>
  );
}
