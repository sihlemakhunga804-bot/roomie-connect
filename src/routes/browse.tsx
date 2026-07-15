import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import roomObservatory from "@/assets/room-observatory.jpg";
import roomBraamfontein from "@/assets/room-braamfontein.jpg";
import roomMusgrave from "@/assets/room-musgrave.jpg";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Rooms — ROOMIE | South Africa" },
      {
        name: "description",
        content:
          "Browse verified rooms across all 9 South African provinces. Filter by city, suburb, budget, room type and amenities.",
      },
      { property: "og:title", content: "Browse Rooms — ROOMIE" },
      {
        property: "og:description",
        content:
          "Filter verified rooms by province, city, suburb, budget, type and amenities.",
      },
    ],
  }),
  component: BrowsePage,
});

type Room = {
  id: string;
  img: string;
  title: string;
  province: string;
  city: string;
  suburb: string;
  price: number;
  type: "Private Room" | "Shared Room" | "Studio" | "Entire Flat";
  amenities: string[];
  match: number;
  tag: string;
};

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  Gauteng: ["Johannesburg", "Pretoria", "Sandton"],
  "Western Cape": ["Cape Town", "Stellenbosch"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg"],
  "Eastern Cape": ["Gqeberha", "East London"],
  "Free State": ["Bloemfontein"],
  Limpopo: ["Polokwane"],
  Mpumalanga: ["Nelspruit"],
  "North West": ["Rustenburg"],
  "Northern Cape": ["Kimberley"],
};

const ROOM_TYPES: Room["type"][] = [
  "Private Room",
  "Shared Room",
  "Studio",
  "Entire Flat",
];

const AMENITIES = [
  "Wi-Fi",
  "Furnished",
  "Parking",
  "Pet Friendly",
  "Solar",
  "Washer",
  "Pool",
  "Security",
];

const ROOMS: Room[] = [
  {
    id: "1",
    img: roomObservatory,
    title: "Heritage Loft Room",
    province: "Western Cape",
    city: "Cape Town",
    suburb: "Observatory",
    price: 6500,
    type: "Private Room",
    amenities: ["Wi-Fi", "Furnished", "Pet Friendly"],
    match: 95,
    tag: "Pet Friendly",
  },
  {
    id: "2",
    img: roomBraamfontein,
    title: "Artistic Inner-City Studio",
    province: "Gauteng",
    city: "Johannesburg",
    suburb: "Braamfontein",
    price: 4200,
    type: "Studio",
    amenities: ["Wi-Fi", "Security"],
    match: 92,
    tag: "Student Friendly",
  },
  {
    id: "3",
    img: roomMusgrave,
    title: "Garden Cottage Wing",
    province: "KwaZulu-Natal",
    city: "Durban",
    suburb: "Musgrave",
    price: 5800,
    type: "Private Room",
    amenities: ["Solar", "Parking", "Furnished"],
    match: 98,
    tag: "Verified Landlord",
  },
  {
    id: "4",
    img: roomObservatory,
    title: "Sunny Sandton Share",
    province: "Gauteng",
    city: "Sandton",
    suburb: "Rivonia",
    price: 7200,
    type: "Shared Room",
    amenities: ["Wi-Fi", "Pool", "Security", "Parking"],
    match: 88,
    tag: "Young Pro",
  },
  {
    id: "5",
    img: roomBraamfontein,
    title: "Stellenbosch Student Flat",
    province: "Western Cape",
    city: "Stellenbosch",
    suburb: "Dennesig",
    price: 3800,
    type: "Shared Room",
    amenities: ["Wi-Fi", "Furnished", "Washer"],
    match: 90,
    tag: "Student Friendly",
  },
  {
    id: "6",
    img: roomMusgrave,
    title: "Menlo Park Entire Flat",
    province: "Gauteng",
    city: "Pretoria",
    suburb: "Menlo Park",
    price: 9500,
    type: "Entire Flat",
    amenities: ["Wi-Fi", "Furnished", "Parking", "Security"],
    match: 85,
    tag: "Verified Landlord",
  },
  {
    id: "7",
    img: roomObservatory,
    title: "Bloem Garden Room",
    province: "Free State",
    city: "Bloemfontein",
    suburb: "Universitas",
    price: 3500,
    type: "Private Room",
    amenities: ["Wi-Fi", "Pet Friendly", "Parking"],
    match: 82,
    tag: "Student Friendly",
  },
  {
    id: "8",
    img: roomMusgrave,
    title: "Umhlanga Beachside Studio",
    province: "KwaZulu-Natal",
    city: "Durban",
    suburb: "Umhlanga",
    price: 8200,
    type: "Studio",
    amenities: ["Wi-Fi", "Pool", "Security", "Furnished"],
    match: 93,
    tag: "Sea View",
  },
];

function BrowsePage() {
  const [province, setProvince] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [suburb, setSuburb] = useState<string>("");
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(15000);
  const [types, setTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);

  const cityOptions = province ? CITIES_BY_PROVINCE[province] ?? [] : [];

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const filtered = useMemo(() => {
    return ROOMS.filter((r) => {
      if (province && r.province !== province) return false;
      if (city && r.city !== city) return false;
      if (suburb && !r.suburb.toLowerCase().includes(suburb.toLowerCase())) return false;
      if (r.price < minBudget || r.price > maxBudget) return false;
      if (types.length && !types.includes(r.type)) return false;
      if (amenities.length && !amenities.every((a) => r.amenities.includes(a)))
        return false;
      return true;
    });
  }, [province, city, suburb, minBudget, maxBudget, types, amenities]);

  const clearAll = () => {
    setProvince("");
    setCity("");
    setSuburb("");
    setMinBudget(0);
    setMaxBudget(15000);
    setTypes([]);
    setAmenities([]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="size-7 rounded-full bg-primary" />
            <span className="font-display text-2xl font-bold tracking-tight">roomie</span>
          </Link>
          <div className="hidden gap-8 text-sm font-medium md:flex">
            <Link to="/browse" className="text-primary">Find a Room</Link>
            <Link to="/" hash="landlords" className="hover:text-primary">List a Space</Link>
            <Link to="/" hash="how" className="hover:text-primary">How it Works</Link>
            <Link to="/" hash="faq" className="hover:text-primary">FAQ</Link>
          </div>
          <button className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-all hover:bg-foreground hover:text-background">
            Login
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-10 max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Browse · {filtered.length} of {ROOMS.length} rooms
          </p>
          <h1 className="mb-4 font-display text-5xl leading-[1.05] md:text-6xl">
            Find a room that <span className="italic text-primary">fits</span>.
          </h1>
          <p className="text-muted-foreground">
            Filter by province, city, suburb, budget, room type and the amenities
            that matter to you.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl">Filters</h2>
                <button
                  onClick={clearAll}
                  className="text-xs font-medium underline decoration-primary underline-offset-4"
                >
                  Clear all
                </button>
              </div>

              <FilterGroup label="Province">
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setCity("");
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">All provinces</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </FilterGroup>

              <FilterGroup label="City">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!province}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
                >
                  <option value="">{province ? "All cities" : "Pick a province first"}</option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </FilterGroup>

              <FilterGroup label="Suburb">
                <input
                  type="text"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  placeholder="e.g. Observatory"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              </FilterGroup>

              <FilterGroup label={`Budget · R${minBudget.toLocaleString()} – R${maxBudget.toLocaleString()}`}>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Min
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={15000}
                      step={500}
                      value={minBudget}
                      onChange={(e) =>
                        setMinBudget(Math.min(Number(e.target.value), maxBudget))
                      }
                      className="w-full accent-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Max
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={15000}
                      step={500}
                      value={maxBudget}
                      onChange={(e) =>
                        setMaxBudget(Math.max(Number(e.target.value), minBudget))
                      }
                      className="w-full accent-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </FilterGroup>

              <FilterGroup label="Room type">
                <div className="flex flex-wrap gap-2">
                  {ROOM_TYPES.map((t) => {
                    const active = types.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => setTypes(toggle(types, t))}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:border-primary"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </FilterGroup>

              <FilterGroup label="Amenities">
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((a) => {
                    const active = amenities.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => setAmenities(toggle(amenities, a))}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          active
                            ? "border-primary bg-secondary text-secondary-foreground"
                            : "border-border bg-background hover:border-primary"
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </FilterGroup>
            </div>
          </aside>

          {/* Results */}
          <section>
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
                <h3 className="mb-2 font-display text-2xl">No rooms match your filters</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Try widening your budget or clearing a few filters.
                </p>
                <button
                  onClick={clearAll}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2">
                {filtered.map((r) => (
                  <article key={r.id} className="group">
                    <div className="mb-5 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted">
                      <img
                        src={r.img}
                        alt={r.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <h3 className="text-lg font-medium">{r.title}</h3>
                      <span className="whitespace-nowrap font-mono text-primary">
                        R{r.price.toLocaleString()}
                        <small className="ml-1 text-[10px] uppercase text-muted-foreground">/pm</small>
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {r.suburb}, {r.city} · {r.type}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-secondary/40 px-3 py-1 text-[10px] font-bold uppercase text-foreground">
                        {r.match}% Match
                      </span>
                      {r.amenities.slice(0, 3).map((a) => (
                        <span
                          key={a}
                          className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase text-muted-foreground"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </h3>
      {children}
    </div>
  );
}
