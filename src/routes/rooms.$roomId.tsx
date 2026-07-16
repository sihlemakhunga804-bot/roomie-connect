import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getRoom, type Room } from "@/data/rooms";
import { ApplyDialog } from "@/components/ApplyDialog";
import {
  getApplicationForRoom,
  withdrawApplication,
  STATUS_META,
  STATUS_ORDER,
  type Application,
} from "@/lib/applications";


export const Route = createFileRoute("/rooms/$roomId")({
  loader: ({ params }) => {
    const room = getRoom(params.roomId);
    if (!room) throw notFound();
    return { room };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Room not found — ROOMIE" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const r = loaderData.room;
    const title = `${r.title} — ${r.suburb}, ${r.city} | ROOMIE`;
    const desc = `${r.type} in ${r.suburb}, ${r.city}. R${r.price.toLocaleString()}/pm. ${r.description}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: r.img },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: r.img },
      ],
    };
  },
  component: RoomDetailsPage,
  notFoundComponent: RoomNotFound,
  errorComponent: RoomError,
});

function RoomNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mb-4 font-display text-5xl">This room has flown the nest.</h1>
        <p className="mb-8 text-muted-foreground">
          The listing you're looking for isn't available anymore.
        </p>
        <Link
          to="/browse"
          className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          Browse other rooms
        </Link>
      </div>
    </div>
  );
}

function RoomError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-background p-16 text-center">
      <h1 className="mb-4 font-display text-4xl">Something went wrong.</h1>
      <button
        onClick={reset}
        className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}

function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="size-7 rounded-full bg-primary" />
          <span className="font-display text-2xl font-bold tracking-tight">roomie</span>
        </Link>
        <div className="hidden gap-8 text-sm font-medium md:flex">
          <Link to="/browse" className="hover:text-primary">Find a Room</Link>
          <Link to="/" hash="landlords" className="hover:text-primary">List a Space</Link>
          <Link to="/" hash="how" className="hover:text-primary">How it Works</Link>
          <Link to="/" hash="faq" className="hover:text-primary">FAQ</Link>
        </div>
        <button className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-all hover:bg-foreground hover:text-background">
          Login
        </button>
      </div>
    </nav>
  );
}

function RoomDetailsPage() {
  const { room } = Route.useLoaderData() as { room: Room };
  const [active, setActive] = useState(0);
  const [applyOpen, setApplyOpen] = useState(false);
  const [application, setApplication] = useState<Application | undefined>(undefined);

  useEffect(() => {
    const sync = () => setApplication(getApplicationForRoom(room.id));
    sync();
    window.addEventListener("roomie:applications:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("roomie:applications:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [room.id]);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/browse" className="hover:text-primary">Browse</Link>
          <span className="mx-2">/</span>
          <span>{room.province}</span>
          <span className="mx-2">/</span>
          <span>{room.city}</span>
        </div>

        {/* Gallery */}
        <section className="mb-10 grid gap-3 md:grid-cols-[2fr_1fr]">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-muted md:aspect-[3/2]">
            <img
              src={room.gallery[active]}
              alt={room.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
            {room.gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`aspect-square overflow-hidden rounded-2xl bg-muted transition-all md:aspect-[3/2] ${
                  i === active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          {/* Main */}
          <div>
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {room.suburb}, {room.city} · {room.province}
                </p>
                <h1 className="font-display text-4xl leading-tight md:text-5xl">
                  {room.title}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">{room.type}</p>
              </div>
              <div className="text-right">
                <div className="font-mono text-3xl text-primary">
                  R{room.price.toLocaleString()}
                  <span className="ml-1 text-xs uppercase text-muted-foreground">/pm</span>
                </div>
                <span className="mt-2 inline-block rounded-full bg-secondary/40 px-3 py-1 text-[10px] font-bold uppercase">
                  {room.tag}
                </span>
              </div>
            </div>

            <p className="mb-10 text-lg leading-relaxed text-foreground/80">
              {room.description}
            </p>

            {/* Amenities */}
            <section className="mb-10">
              <h2 className="mb-4 font-display text-2xl">What's included</h2>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </section>

            {/* Lease details */}
            <section className="mb-10">
              <h2 className="mb-4 font-display text-2xl">Lease details</h2>
              <dl className="grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2">
                <LeaseRow label="Available from" value={room.lease.available} />
                <LeaseRow label="Minimum stay" value={room.lease.minStay} />
                <LeaseRow
                  label="Deposit"
                  value={`R${room.lease.deposit.toLocaleString()}`}
                />
                <LeaseRow label="Utilities" value={room.lease.utilities} />
                <LeaseRow
                  label="Furnishing"
                  value={room.lease.furnished ? "Fully furnished" : "Unfurnished"}
                />
                <LeaseRow label="Listing ID" value={`ROOM-${room.id.padStart(4, "0")}`} />
              </dl>
            </section>

            {/* Landlord */}
            <section className="mb-10">
              <h2 className="mb-4 font-display text-2xl">Meet the landlord</h2>
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground">
                    {room.landlord.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl">{room.landlord.name}</h3>
                      {room.landlord.verified && (
                        <span className="rounded-full bg-secondary/40 px-2 py-0.5 text-[10px] font-bold uppercase">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Member since {room.landlord.memberSince}
                    </p>
                    <p className="mt-3 text-sm text-foreground/80">{room.landlord.bio}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                      <div>
                        <div className="font-mono text-lg text-primary">
                          {room.landlord.responseRate}%
                        </div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">
                          Response rate
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-lg text-primary">
                          {room.landlord.responseTime}
                        </div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">
                          Typically replies
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar: compatibility + CTA */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Your compatibility
              </p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-display text-6xl text-primary">{room.match}</span>
                <span className="font-mono text-sm text-muted-foreground">/ 100</span>
              </div>

              <div className="mb-6 space-y-4">
                <CompatibilityBar label="Lifestyle" value={room.compatibility.lifestyle} />
                <CompatibilityBar label="Schedule" value={room.compatibility.schedule} />
                <CompatibilityBar label="Cleanliness" value={room.compatibility.cleanliness} />
                <CompatibilityBar label="Social vibe" value={room.compatibility.social} />
              </div>

              <button className="mb-2 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90">
                Request to move in
              </button>
              <button className="w-full rounded-full border border-border px-6 py-3 text-sm font-medium transition-all hover:bg-foreground hover:text-background">
                Message {room.landlord.name.split(" ")[0]}
              </button>

              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                No booking fees. Cancel free within 24 hrs.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function LeaseRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

function CompatibilityBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-mono text-muted-foreground">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
