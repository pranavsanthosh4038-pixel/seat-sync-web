import { Link } from "@tanstack/react-router";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CITIES, cityByKey, type CityKey } from "@/lib/movies";

export function SiteHeader({
  city,
  onCityChange,
}: {
  city?: CityKey;
  onCityChange?: (c: CityKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = cityByKey(city ?? "bengaluru");

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
          Seat<span className="text-primary">Sync</span>
        </Link>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface border border-border text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
          >
            <MapPin size={14} className="text-primary" />
            {active.name}
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {open && (
            <div
              role="listbox"
              className="absolute left-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] p-1.5 z-50"
            >
              {CITIES.map((c) => (
                <button
                  key={c.key}
                  role="option"
                  aria-selected={c.key === active.key}
                  onClick={() => {
                    onCityChange?.(c.key);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    c.key === active.key
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

        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            className="w-9 h-9 rounded-full border border-border bg-surface flex items-center justify-center text-foreground hover:bg-surface-2 transition-colors"
          >
            <Search size={16} />
          </button>
          <ThemeToggle />
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
