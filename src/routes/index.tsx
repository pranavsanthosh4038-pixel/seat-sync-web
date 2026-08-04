import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MOVIES } from "@/lib/movies";
import { getTotalWaitlistCount } from "@/lib/seats";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SeatSync — Bengaluru Movie Waitlists, Sold-Out Shows" },
      {
        name: "description",
        content:
          "Every show is sold out. Join the waitlist for the exact seat you want in Bengaluru cinemas and get an SMS the moment it opens up.",
      },
      { property: "og:title", content: "SeatSync — Bengaluru Movie Waitlists" },
      {
        property: "og:description",
        content:
          "Join the waitlist for sold-out shows across Bengaluru cinemas and get notified the second a seat frees up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MovieBrowser,
});

const CATEGORIES = ["Movies", "Events", "Plays", "Sports", "Comedy"];

function MovieBrowser() {
  const [category, setCategory] = useState("Movies");
  const { data: waitTotal = 0 } = useQuery({
    queryKey: ["waitlist-total"],
    queryFn: getTotalWaitlistCount,
    refetchInterval: 5000,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Hero */}
        <section className="pt-12 pb-8">
          <p className="label-caps text-xs text-primary mb-3">Bengaluru · Tonight</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-2xl">
            What&apos;s showing tonight
          </h1>
          <p className="mt-3 text-muted-foreground text-base max-w-xl">
            Every show below is sold out. Pick a showtime, tap the seat you want, and join the
            queue — we&apos;ll text you the moment it frees up.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-sm">
            <span className="w-2 h-2 rounded-full bg-[#2ecc71]" />
            <span className="text-muted-foreground">People in queue right now</span>
            <span className="font-bold text-foreground">{waitTotal}</span>
          </div>
        </section>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-6 -mx-1 px-1">
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {MOVIES.map((m, idx) => (
            <MovieCard key={m.slug} movie={m} waitBase={idx * 3 + 7} />
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-sm text-muted-foreground">
          SeatSync · Bengaluru · Smart cancellation & waitlist management
        </div>
      </footer>
    </div>
  );
}

function MovieCard({ movie, waitBase }: { movie: (typeof MOVIES)[number]; waitBase: number }) {
  const [open, setOpen] = useState(false);
  const shown = open ? movie.showtimes : movie.showtimes.slice(0, 2);

  return (
    <article className="card-soft card-lift overflow-hidden">
      <div className="h-44 relative" style={{ background: movie.poster }}>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.65) 100%)" }}
        />
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-[#1c1c1c] text-[11px] font-semibold">
          {movie.rating}
        </span>
        <h3 className="absolute bottom-3 left-4 right-4 text-xl font-bold text-white">
          {movie.title}
        </h3>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{movie.genre}</span>
          <span className="text-muted-foreground">{movie.duration}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{movie.language}</p>

        <div className="mt-4 space-y-2">
          {shown.map((st, i) => {
            const waiting = waitBase + i * 2;
            return (
              <Link
                key={st.id}
                to="/show/$showId"
                params={{ showId: st.id }}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-surface border border-border hover:border-primary transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{st.time}</div>
                  <div className="text-xs text-muted-foreground truncate">{st.theatre}</div>
                </div>
                <span className="shrink-0 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  {waiting} waiting
                </span>
              </Link>
            );
          })}
        </div>

        {movie.showtimes.length > 2 && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-3 text-sm font-semibold text-primary"
          >
            {open ? "Show less" : `+${movie.showtimes.length - 2} more showtimes`}
          </button>
        )}
      </div>
    </article>
  );
}
