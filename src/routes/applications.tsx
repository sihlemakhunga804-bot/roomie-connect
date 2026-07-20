import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  listApplications,
  withdrawApplication,
  STATUS_META,
  STATUS_ORDER,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  type Application,
  type ApplicationStatus,
  type AppNotification,
} from "@/lib/applications";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Your applications — ROOMIE" },
      {
        name: "description",
        content:
          "Track the status of every room you've applied to on ROOMIE — from submitted through to accepted.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApplicationsPage,
});

const FILTERS: { key: "all" | ApplicationStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under review" },
  { key: "landlord_contacted", label: "In touch" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
];

function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const seenIds = useRef<Set<string>>(new Set());
  const hydrated = useRef(false);

  useEffect(() => {
    const syncApps = () => setApps(listApplications());
    const syncNotifs = () => {
      const next = listNotifications();
      if (hydrated.current) {
        for (const n of next) {
          if (!seenIds.current.has(n.id)) {
            const fn =
              n.kind === "accepted"
                ? toast.success
                : n.kind === "declined"
                  ? toast.error
                  : toast;
            fn(n.title, { description: n.body });
          }
        }
      }
      seenIds.current = new Set(next.map((n) => n.id));
      setNotifs(next);
      hydrated.current = true;
    };
    syncApps();
    syncNotifs();
    window.addEventListener("roomie:applications:changed", syncApps);
    window.addEventListener("roomie:notifications:changed", syncNotifs);
    window.addEventListener("storage", syncApps);
    window.addEventListener("storage", syncNotifs);
    return () => {
      window.removeEventListener("roomie:applications:changed", syncApps);
      window.removeEventListener("roomie:notifications:changed", syncNotifs);
      window.removeEventListener("storage", syncApps);
      window.removeEventListener("storage", syncNotifs);
    };
  }, []);

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="size-7 rounded-full bg-primary" />
            <span className="font-display text-2xl font-bold tracking-tight">roomie</span>
          </Link>
          <div className="hidden gap-8 text-sm font-medium md:flex">
            <Link to="/browse" className="hover:text-primary">Find a Room</Link>
            <Link to="/applications" className="text-primary">Applications</Link>
            <Link to="/landlord" className="hover:text-primary">Landlord</Link>
          </div>
          <button className="rounded-full border border-border px-5 py-2 text-sm font-medium">
            Login
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-8">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Your applications
          </p>
          <h1 className="font-display text-4xl md:text-5xl">Where you're at</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Every room you've applied to, in one place. Statuses update as landlords
            review your details.
          </p>
        </header>

        {notifs.length > 0 && (
          <section
            aria-label="Landlord updates"
            className="mb-8 overflow-hidden rounded-3xl border border-border bg-card"
          >
            <header className="flex items-center justify-between gap-3 border-b border-border p-4">
              <div className="flex items-center gap-2">
                <span className="relative inline-flex size-2 rounded-full bg-primary">
                  {unreadCount > 0 && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                  )}
                </span>
                <h2 className="font-display text-lg">
                  Updates from landlords
                </h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] text-primary-foreground">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="rounded-full border border-border px-3 py-1 text-[11px] font-medium hover:bg-muted"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => clearNotifications()}
                  className="rounded-full border border-border px-3 py-1 text-[11px] font-medium hover:bg-muted"
                >
                  Clear
                </button>
              </div>
            </header>
            <ul className="divide-y divide-border">
              {notifs.slice(0, 6).map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 p-4 ${
                    n.read ? "opacity-70" : ""
                  }`}
                >
                  <span
                    className={`mt-1 inline-block size-2 shrink-0 rounded-full ${
                      n.kind === "accepted"
                        ? "bg-primary"
                        : n.kind === "declined"
                          ? "bg-destructive"
                          : "bg-secondary"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString("en-ZA", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Link
                    to="/rooms/$roomId"
                    params={{ roomId: n.roomId }}
                    onClick={() => markNotificationRead(n.id)}
                    className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] font-medium hover:bg-muted"
                  >
                    View room
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}



        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === "all" ? apps.length : apps.filter((a) => a.status === f.key).length;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                }`}
              >
                {f.label}
                <span className="ml-2 font-mono opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <h2 className="mb-2 font-display text-2xl">Nothing here yet</h2>
            <p className="mb-6 text-muted-foreground">
              When you apply for a room, you'll see it (and its status) here.
            </p>
            <Link
              to="/browse"
              className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Browse rooms
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((app) => (
              <ApplicationRow
                key={app.id}
                app={app}
                onWithdraw={() => withdrawApplication(app.id)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function ApplicationRow({
  app,
  onWithdraw,
}: {
  app: Application;
  onWithdraw: () => void;
}) {
  const meta = STATUS_META[app.status];
  const isDeclined = app.status === "declined";

  return (
    <li className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <Link
          to="/rooms/$roomId"
          params={{ roomId: app.roomId }}
          className="block sm:w-48 sm:shrink-0"
        >
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
            <img src={app.roomImg} alt={app.roomTitle} className="h-full w-full object-cover" />
          </div>
        </Link>

        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link
                to="/rooms/$roomId"
                params={{ roomId: app.roomId }}
                className="font-display text-xl hover:text-primary"
              >
                {app.roomTitle}
              </Link>
              <p className="text-xs text-muted-foreground">
                Applied{" "}
                {new Date(app.submittedAt).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · Move-in {new Date(app.moveInDate).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                isDeclined
                  ? "bg-destructive/10 text-destructive"
                  : app.status === "accepted"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/40 text-foreground"
              }`}
            >
              {meta.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-2">
            {STATUS_ORDER.map((s, i) => {
              const done = STATUS_META[s].step <= meta.step && !isDeclined;
              return (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full ${
                    done ? "bg-primary" : "bg-muted"
                  }`}
                  title={STATUS_META[s].label}
                  aria-label={`Step ${i + 1}: ${STATUS_META[s].label}`}
                />
              );
            })}
          </div>
          <p className="mt-2 text-sm text-foreground/80">{meta.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/rooms/$roomId"
              params={{ roomId: app.roomId }}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:bg-muted"
            >
              View room
            </Link>
            <button
              onClick={onWithdraw}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:bg-destructive hover:text-destructive-foreground"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
