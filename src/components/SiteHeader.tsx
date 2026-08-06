import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Gift,
  HelpCircle,
  Heart,
  LayoutDashboard,
  MapPin,
  Menu,
  Search,
  Settings,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CITIES, cityByKey, moviesForCity, showtimesFor, type CityKey } from "@/lib/movies";
import { eventsFor, venueFor } from "@/lib/events";

type Suggestion = {
  key: string;
  title: string;
  subtitle: string;
  image: string;
  href?: { showId: string };
};

export function SiteHeader({
  city,
  onCityChange,
  query,
  onQueryChange,
}: {
  city?: CityKey;
  onCityChange?: (c: CityKey) => void;
  query?: string;
  onQueryChange?: (q: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState(query ?? "");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const activeCity = cityByKey(city ?? "bengaluru");

  useEffect(() => setTerm(query ?? ""), [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pool = useMemo<Suggestion[]>(() => {
    const key = activeCity.key;
    const movies = moviesForCity(key).map((m) => {
      const first = showtimesFor(m, key)[0];
      return {
        key: `m-${m.slug}`,
        title: m.title,
        subtitle: `${m.genre} · ${m.duration}`,
        image: m.poster,
        href: first ? { showId: first.id } : undefined,
      };
    });
    const events = eventsFor(key).map((e) => ({
      key: `e-${e.slug}`,
      title: e.title,
      subtitle: `${e.tag} · ${venueFor(e, key)}`,
      image: e.image,
    }));
    return [...movies, ...events];
  }, [activeCity.key]);

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return pool.slice(0, 6);
    return pool
      .filter((s) => (s.title + " " + s.subtitle).toLowerCase().includes(q))
      .slice(0, 8);
  }, [term, pool]);

  const commit = (value: string) => {
    setTerm(value);
    onQueryChange?.(value);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-3">
        <button
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="w-9 h-9 shrink-0 rounded-full border border-border bg-surface flex items-center justify-center text-foreground hover:bg-surface-2 transition-colors"
        >
          <Menu size={18} />
        </button>

        <Link to="/" className="text-xl font-bold tracking-tight text-foreground shrink-0">
          Seat<span className="text-primary">Sync</span>
        </Link>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative" ref={searchRef}>
          <div
            className={`flex items-center gap-2 rounded-full border border-border bg-surface transition-all ${
              searchOpen ? "w-[min(60vw,340px)] px-4" : "w-9 justify-center"
            } h-9`}
          >
            <button
              aria-label="Search movies and events"
              onClick={() => setSearchOpen(true)}
              className="text-foreground"
            >
              <Search size={16} />
            </button>
            {searchOpen && (
              <input
                autoFocus
                value={term}
                onChange={(e) => commit(e.target.value)}
                placeholder="Search movies, events, plays"
                className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
            )}
            {searchOpen && term && (
              <button aria-label="Clear search" onClick={() => commit("")}>
                <X size={14} className="text-muted-foreground" />
              </button>
            )}
          </div>

          {searchOpen && (
            <div className="absolute right-0 mt-2 w-[min(90vw,380px)] rounded-2xl bg-card border border-border shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] p-2 z-50 max-h-[70vh] overflow-y-auto">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {term.trim() ? "Results" : "Recommended for you"}
              </p>
              {results.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground">
                  Nothing matches “{term}” in {activeCity.name}.
                </p>
              )}
              {results.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    commit(r.title);
                    setSearchOpen(false);
                    if (r.href) navigate({ to: "/show/$showId", params: r.href });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface text-left transition-colors"
                >
                  <img
                    src={r.image}
                    alt=""
                    loading="lazy"
                    className="w-10 h-14 rounded-lg object-cover shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground truncate">
                      {r.title}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {r.subtitle}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* City picker — right, next to search */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-surface border border-border text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
          >
            <MapPin size={14} className="text-primary" />
            <span className="hidden sm:inline">{activeCity.name}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {open && (
            <div
              role="listbox"
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] p-1.5 z-50"
            >
              {CITIES.map((c) => (
                <button
                  key={c.key}
                  role="option"
                  aria-selected={c.key === activeCity.key}
                  onClick={() => {
                    onCityChange?.(c.key);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    c.key === activeCity.key
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <div>{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.localLanguage} prints</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <ThemeToggle />
      </div>

      {menuOpen && <SideMenu onClose={() => setMenuOpen(false)} cityName={activeCity.name} />}
    </header>
  );
}

function SideMenu({ onClose, cityName }: { onClose: () => void; cityName: string }) {
  const items = [
    { icon: Bell, label: "Notifications", sub: "Seat alerts and waitlist updates" },
    { icon: Ticket, label: "Your Orders", sub: "View all your bookings & waitlists" },
    { icon: Heart, label: "Your Wishlist", sub: "Movies and events you saved" },
    { icon: Gift, label: "Rewards", sub: "View your rewards & unlock new ones" },
    { icon: HelpCircle, label: "Help & Support", sub: "Common queries and chat" },
    { icon: Settings, label: "Accounts & Settings", sub: `Location · ${cityName} · Permissions` },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <aside className="absolute right-0 top-0 h-full w-[min(88vw,380px)] bg-card border-l border-border overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-2xl font-bold text-foreground">Hey!</h2>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl border border-border p-3">
          <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift size={18} className="text-primary" />
          </span>
          <p className="flex-1 text-sm font-medium text-primary leading-tight">
            Unlock special offers &amp; great benefits
          </p>
          <Link
            to="/auth"
            onClick={onClose}
            className="shrink-0 px-3 py-1.5 rounded-full border border-primary text-primary text-xs font-semibold"
          >
            Login / Register
          </Link>
        </div>

        <nav className="divide-y divide-border border-y border-border mt-2">
          {items.map(({ icon: Icon, label, sub }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface transition-colors"
            >
              <Icon size={18} className="text-muted-foreground shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{label}</span>
                <span className="block text-xs text-muted-foreground truncate">{sub}</span>
              </span>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
          <Link
            to="/admin"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-surface transition-colors"
          >
            <LayoutDashboard size={18} className="text-muted-foreground shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">Admin Dashboard</span>
              <span className="block text-xs text-muted-foreground">
                Manage shows, seats and queues
              </span>
            </span>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </Link>
        </nav>
      </aside>
    </div>
  );
}
