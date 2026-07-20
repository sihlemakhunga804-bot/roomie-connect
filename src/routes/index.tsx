import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-roommates.jpg";
import roomObservatory from "@/assets/room-observatory.jpg";
import roomBraamfontein from "@/assets/room-braamfontein.jpg";
import roomMusgrave from "@/assets/room-musgrave.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

const provinces = [
  { code: "GP", name: "Gauteng" },
  { code: "WC", name: "Western Cape" },
  { code: "KZN", name: "KwaZulu-Natal" },
  { code: "EC", name: "Eastern Cape" },
  { code: "FS", name: "Free State" },
  { code: "LP", name: "Limpopo" },
  { code: "MP", name: "Mpumalanga" },
  { code: "NW", name: "North West" },
  { code: "NC", name: "Northern Cape" },
];

const rooms = [
  {
    img: roomObservatory,
    title: "Heritage Loft Room",
    suburb: "Observatory, Cape Town",
    price: "R6,500",
    specs: "2 Bed · 1 Bath · Furnished · Wi-Fi",
    match: "95%",
    tag: "Pet Friendly",
  },
  {
    img: roomBraamfontein,
    title: "Artistic Inner-City Studio",
    suburb: "Braamfontein, Johannesburg",
    price: "R4,200",
    specs: "3 Bed · 2 Bath · Shared Kitchen",
    match: "92%",
    tag: "Student Friendly",
  },
  {
    img: roomMusgrave,
    title: "Garden Cottage Wing",
    suburb: "Musgrave, Durban",
    price: "R5,800",
    specs: "1 Bed · Private Bath · Solar",
    match: "98%",
    tag: "Verified Landlord",
  },
];

const faqs = [
  {
    q: "Is the compatibility score accurate?",
    a: "Our algorithm was built around real shared-living dynamics in South Africa — sleep schedule, cleaning, guests, work-from-home patterns and more.",
  },
  {
    q: "Which provinces do you cover?",
    a: "All 9 South African provinces, from the Cape to Limpopo. Listings are verified by our local team.",
  },
  {
    q: "How do you verify users?",
    a: "We use SA ID verification, selfie checks, and landlord proof-of-ownership so every profile is a real, accountable person.",
  },
  {
    q: "Does it cost anything to list a room?",
    a: "Listing your room on ROOMIE is free. We only make money on optional promoted placements — never on placement fees.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="size-7 rounded-full bg-primary" />
            <span className="font-display text-2xl font-bold tracking-tight">roomie</span>
          </a>
          <div className="hidden gap-8 text-sm font-medium md:flex">
            <Link to="/browse" className="transition-colors hover:text-primary">Find a Room</Link>
            <a href="#landlords" className="transition-colors hover:text-primary">List a Space</a>
            <a href="#how" className="transition-colors hover:text-primary">How it Works</a>
            <a href="#faq" className="transition-colors hover:text-primary">FAQ</a>
          </div>
          <Link
            to="/login"
            className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-all hover:bg-foreground hover:text-background"
          >
            Login
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6">
        {/* Hero */}
        <section className="grid items-center gap-16 pb-24 pt-16 lg:grid-cols-2 lg:pb-32 lg:pt-20">
          <div className="animate-roomie-in">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              South Africa · All 9 Provinces
            </p>
            <h1 className="mb-8 text-balance font-display text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
              Find your{" "}
              <span className="italic text-primary underline decoration-secondary decoration-[6px] underline-offset-8">
                people
              </span>
              , not just a place.
            </h1>
            <p className="mb-10 max-w-[45ch] text-pretty text-lg text-muted-foreground md:text-xl">
              The roommate-matching rental platform for South Africa. Compatibility scores, verified
              landlords, and rooms that actually feel like home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/browse"
                className="rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                I need a room
              </Link>
              <Link
                to="/landlord/signup"
                className="rounded-full bg-secondary px-8 py-4 text-lg font-medium text-secondary-foreground transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                I have a room
              </Link>
            </div>
          </div>

          <div className="relative animate-roomie-in [animation-delay:200ms]">
            <img
              src={heroImg}
              alt="Two roommates enjoying coffee on a sunlit Cape Town balcony"
              width={800}
              height={1000}
              className="aspect-[4/5] w-full rounded-[40px] object-cover shadow-2xl"
            />
            <div className="absolute -bottom-8 -left-8 z-20 animate-roomie-float rounded-3xl border border-border bg-card p-7 shadow-2xl">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Compatibility
              </div>
              <div className="font-display text-5xl font-bold text-primary">98%</div>
              <div className="mt-1 text-sm font-medium">Perfect Match</div>
              <div className="mt-4 flex gap-1">
                <div className="h-1.5 w-12 rounded-full bg-primary" />
                <div className="h-1.5 w-4 rounded-full bg-primary/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Provinces */}
        <section id="browse" className="py-20">
          <div className="mb-14 text-center">
            <h2 className="mb-4 font-display text-4xl">Where are we headed?</h2>
            <p className="text-muted-foreground">
              Verified rooms across every South African province.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
            {provinces.map((p) => (
              <button
                key={p.code}
                className="group rounded-2xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-1 hover:border-primary hover:bg-primary/5"
              >
                <span className="mb-2 block font-mono text-xs text-muted-foreground group-hover:text-primary">
                  {p.code}
                </span>
                <span className="block text-sm font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="my-16 rounded-[48px] bg-foreground px-8 py-20 text-background md:px-12">
          <div className="mb-14 max-w-2xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-background/50">
              How ROOMIE works
            </p>
            <h2 className="font-display text-4xl md:text-5xl">
              Three steps from stranger to housemate.
            </h2>
          </div>
          <div className="grid gap-12 lg:grid-cols-3">
            {[
              { n: "01", t: "Vibe Check", d: "Take our compatibility quiz. Morning person? Laundry habits? Braai on weekends? We ask the stuff that actually matters." },
              { n: "02", t: "Room Browse", d: "See spaces matched to your score across all 9 provinces. Every listing is verified by our local team for safety." },
              { n: "03", t: "Move In", d: "Message directly, meet the roommates, sign securely. The relief of finding the right fit on the first try." },
            ].map((s) => (
              <div key={s.n}>
                <div className="mb-6 grid size-12 place-items-center rounded-full border border-background/20 font-mono text-sm">
                  {s.n}
                </div>
                <h3 className="mb-4 font-display text-3xl">{s.t}</h3>
                <p className="text-background/60">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured rooms */}
        <section className="py-24">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-2 font-display text-4xl">Featured homes</h2>
              <p className="text-muted-foreground">Highly compatible spaces available now.</p>
            </div>
            <button className="hidden text-sm font-medium underline decoration-primary underline-offset-4 sm:block">
              View all rooms
            </button>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {rooms.map((r, i) => (
              <article
                key={r.title}
                className="group animate-roomie-in"
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="mb-6 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted">
                  <img
                    src={r.img}
                    alt={r.title}
                    loading="lazy"
                    width={683}
                    height={512}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h3 className="text-xl font-medium">{r.title}</h3>
                  <span className="whitespace-nowrap font-mono text-primary">
                    {r.price}
                    <small className="ml-1 text-[10px] uppercase text-muted-foreground">/pm</small>
                  </span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  {r.suburb} · {r.specs}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary/40 px-3 py-1 text-[10px] font-bold uppercase text-foreground">
                    {r.match} Match
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase text-muted-foreground">
                    {r.tag}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Landlord band */}
        <section id="landlords" className="py-16">
          <div className="flex flex-col items-center gap-12 rounded-[40px] bg-secondary/30 p-10 md:flex-row md:p-14">
            <div className="flex-1">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                For landlords
              </p>
              <h2 className="mb-6 font-display text-4xl md:text-5xl">
                List your extra space in minutes.
              </h2>
              <p className="mb-8 max-w-[52ch] text-muted-foreground">
                We vet tenants so you don't have to. Find someone who respects your home and your
                routine — and pays rent on time.
              </p>
              <Link
                to="/landlord/signup"
                className="inline-block rounded-full bg-foreground px-6 py-3 font-medium text-background transition-transform hover:scale-105"
              >
                Become a Landlord
              </Link>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-4">
              {[
                { k: "0%", v: "Placement fee" },
                { k: "24h", v: "Average match" },
                { k: "SA ID", v: "Verified tenants" },
                { k: "9/9", v: "Provinces covered" },
              ].map((s) => (
                <div key={s.v} className="flex h-40 flex-col justify-end rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="block font-mono text-3xl text-primary">{s.k}</span>
                  <span className="text-xs uppercase text-muted-foreground">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24">
          <div className="mb-14 text-center">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Community
            </p>
            <h2 className="font-display text-4xl">Real matches, real homes.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <blockquote className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <p className="mb-6 font-display text-2xl italic leading-snug">
                "The compatibility score was spot on. I'm living with my best friends now, and we
                found each other through a single search on ROOMIE."
              </p>
              <footer className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-secondary" />
                <div>
                  <div className="font-medium">Sarah Miller</div>
                  <div className="text-xs text-muted-foreground">Tenant · Rondebosch, WC</div>
                </div>
              </footer>
            </blockquote>
            <blockquote className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <p className="mb-6 font-display text-2xl italic leading-snug">
                "As a landlord, ROOMIE saved me hours. I didn't just find a tenant — I found someone
                who actually fits with my existing housemates."
              </p>
              <footer className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-primary/30" />
                <div>
                  <div className="font-medium">Themba Khumalo</div>
                  <div className="text-xs text-muted-foreground">Landlord · Sandton, GP</div>
                </div>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl py-24">
          <h2 className="mb-14 text-center font-display text-4xl">You asked, we answered</h2>
          <div className="space-y-2">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-border py-6 [&_summary]:list-none">
                <summary className="flex cursor-pointer items-center justify-between gap-6">
                  <span className="font-medium">{f.q}</span>
                  <span className="font-mono text-xl text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 bg-foreground px-6 py-24 text-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 md:grid-cols-4">
          <div className="col-span-2">
            <a href="#" className="mb-6 flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary" />
              <span className="font-display text-2xl font-bold tracking-tight">roomie</span>
            </a>
            <p className="max-w-[32ch] text-background/40">
              South Africa's most human roommate-matching rental platform.
            </p>
          </div>
          <div>
            <h3 className="mb-6 font-mono text-[10px] uppercase tracking-widest text-background/30">
              Platform
            </h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#browse" className="hover:text-primary">Find rooms</a></li>
              <li><a href="#landlords" className="hover:text-primary">List a space</a></li>
              <li><a href="#how" className="hover:text-primary">Safety</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-6 font-mono text-[10px] uppercase tracking-widest text-background/30">
              Company
            </h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-primary">About</a></li>
              <li><a href="#" className="hover:text-primary">Careers</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-7xl flex-col justify-between gap-6 border-t border-background/10 pt-8 text-xs text-background/40 md:flex-row">
          <p>© 2026 ROOMIE ZA. Built for home seekers.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
