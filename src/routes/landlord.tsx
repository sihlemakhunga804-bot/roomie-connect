import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  listApplications,
  updateStatus,
  STATUS_META,
  type Application,
  type ApplicationStatus,
} from "@/lib/applications";

export const Route = createFileRoute("/landlord")({
  head: () => ({
    meta: [
      { title: "Landlord dashboard — ROOMIE" },
      {
        name: "description",
        content:
          "Review, approve or decline tenant applications for your rooms on ROOMIE.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LandlordPage,
});

const TABS: { key: "pending" | "decided" | "all"; label: string }[] = [
  { key: "pending", label: "Needs action" },
  { key: "decided", label: "Decided" },
  { key: "all", label: "All" },
];

function LandlordPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [tab, setTab] = useState<"pending" | "decided" | "all">("pending");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setApps(listApplications());
    sync();
    window.addEventListener("roomie:applications:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("roomie:applications:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const grouped = useMemo(() => {
    const filtered = apps.filter((a) => {
      if (tab === "pending")
        return a.status === "submitted" || a.status === "under_review" || a.status === "landlord_contacted";
      if (tab === "decided") return a.status === "accepted" || a.status === "declined";
      return true;
    });
    const map = new Map<string, { title: string; img: string; items: Application[] }>();
    for (const a of filtered) {
      if (!map.has(a.roomId))
        map.set(a.roomId, { title: a.roomTitle, img: a.roomImg, items: [] });
      map.get(a.roomId)!.items.push(a);
    }
    return Array.from(map.entries()).map(([roomId, v]) => ({ roomId, ...v }));
  }, [apps, tab]);

  const counts = useMemo(() => {
    const pending = apps.filter(
      (a) => a.status !== "accepted" && a.status !== "declined",
    ).length;
    const accepted = apps.filter((a) => a.status === "accepted").length;
    const declined = apps.filter((a) => a.status === "declined").length;
    return { pending, accepted, declined, total: apps.length };
  }, [apps]);

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
            <Link to="/applications" className="hover:text-primary">Applications</Link>
            <Link to="/landlord" className="text-primary">Landlord</Link>
          </div>
          <button className="rounded-full border border-border px-5 py-2 text-sm font-medium">
            Login
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-8">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Landlord dashboard
          </p>
          <h1 className="font-display text-4xl md:text-5xl">Your inbox of applicants</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Review each applicant, then approve or decline. Your decision syncs to their
            tracker instantly.
          </p>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total" value={counts.total} />
          <Stat label="Needs action" value={counts.pending} accent />
          <Stat label="Accepted" value={counts.accepted} />
          <Stat label="Declined" value={counts.declined} />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {grouped.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <h2 className="mb-2 font-display text-2xl">No applications here</h2>
            <p className="text-muted-foreground">
              When tenants apply, they'll show up in this dashboard for review.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map((room) => (
              <section
                key={room.roomId}
                className="overflow-hidden rounded-3xl border border-border bg-card"
              >
                <header className="flex items-center gap-4 border-b border-border p-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <img
                      src={room.img}
                      alt={room.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      to="/rooms/$roomId"
                      params={{ roomId: room.roomId }}
                      className="font-display text-xl hover:text-primary"
                    >
                      {room.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {room.items.length}{" "}
                      {room.items.length === 1 ? "applicant" : "applicants"}
                    </p>
                  </div>
                </header>
                <ul className="divide-y divide-border">
                  {room.items.map((app) => (
                    <ApplicantRow
                      key={app.id}
                      app={app}
                      open={expanded === app.id}
                      onToggle={() =>
                        setExpanded(expanded === app.id ? null : app.id)
                      }
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}

function ApplicantRow({
  app,
  open,
  onToggle,
}: {
  app: Application;
  open: boolean;
  onToggle: () => void;
}) {
  const meta = STATUS_META[app.status];
  const decided = app.status === "accepted" || app.status === "declined";

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-start gap-4">
        <button
          onClick={onToggle}
          className="flex flex-1 items-center gap-4 text-left"
          aria-expanded={open}
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary/40 font-display text-lg">
            {app.fullName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{app.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {app.occupation} · Move-in{" "}
              {new Date(app.moveInDate).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
          <StatusPill status={app.status} label={meta.label} />
        </button>

        <div className="flex flex-wrap gap-2">
          {!decided && (
            <>
              {app.status === "submitted" && (
                <button
                  onClick={() => updateStatus(app.id, "under_review")}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Mark reviewing
                </button>
              )}
              <button
                onClick={() => updateStatus(app.id, "accepted")}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(app.id, "declined")}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-destructive hover:text-destructive-foreground"
              >
                Decline
              </button>
            </>
          )}
          {decided && (
            <button
              onClick={() => updateStatus(app.id, "under_review")}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              Reopen
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-background/40 p-4 md:grid-cols-2">
          <Detail label="Email" value={app.email} />
          <Detail label="Phone" value={app.phone} />
          <Detail label="Occupation" value={app.occupation} />
          <Detail
            label="Applied"
            value={new Date(app.submittedAt).toLocaleString("en-ZA", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <div className="md:col-span-2">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Message
            </p>
            <p className="whitespace-pre-wrap text-sm text-foreground/90">
              {app.message}
            </p>
          </div>
        </div>
      )}
    </li>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function StatusPill({
  status,
  label,
}: {
  status: ApplicationStatus;
  label: string;
}) {
  const cls =
    status === "accepted"
      ? "bg-primary text-primary-foreground"
      : status === "declined"
        ? "bg-destructive/10 text-destructive"
        : "bg-secondary/40 text-foreground";
  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${cls}`}
    >
      {label}
    </span>
  );
}
