import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MOVIES } from "@/lib/movies";
import { getTotalWaitlistCount } from "@/lib/seats";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SeatSync — Bengaluru Cinema Waitlist Terminal" },
      {
        name: "description",
        content:
          "Every show is sold out. Join the waitlist for the seat you want and get notified the moment it opens up. Live seat status across Bengaluru cinemas.",
      },
      { property: "og:title", content: "SeatSync — Bengaluru Cinema Waitlist Terminal" },
      {
        property: "og:description",
        content: "Every show is sold out. Join the waitlist for the seat you want and get notified the moment it opens up. Live seat status across Bengaluru cinemas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MovieBrowser,
});

function MovieBrowser() {
  const { data: waitTotal = 0 } = useQuery({
    queryKey: ["waitlist-total"],
    queryFn: getTotalWaitlistCount,
    refetchInterval: 5000,
  });

  return (
    <div className="min-h-screen text-foreground">
      <header className="border-b border-neon-cyan/15 px-6 md:px-12 py-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-[0.3em] glow-cyan">
            SEAT<span className="text-neon-violet" style={{ textShadow: "0 0 10px #bf00ff" }}>SYNC</span>
          </h1>
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mt-1">
            Bengaluru // Live Ticket Waitlist Terminal
          </div>
        </div>
        <div className="text-right font-mono text-[11px] uppercase tracking-widest flex items-center gap-4">
          <div>
            <div className="text-neon-cyan/80">System</div>
            <div className="glow-green">ONLINE</div>
          </div>
          <Link
            to="/admin"
            className="px-3 py-1.5 border border-neon-amber text-neon-amber hover:bg-neon-amber/10 text-[10px]"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="px-6 md:px-12 py-10">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-neon-cyan/70">
              Now Showing
            </div>
            <h2 className="font-display text-3xl md:text-4xl mt-1 glow-cyan">
              SOLD OUT IN BENGALURU
            </h2>
            <p className="text-muted-foreground font-mono text-sm mt-2 max-w-xl">
              Every seat is booked. Pick a showtime, tap the seat you want, and join the queue.
              When someone cancels, the first person in line gets in.
            </p>
          </div>
          <div className="panel px-4 py-3 font-mono text-xs">
            <span className="text-muted-foreground uppercase tracking-widest">Global Queue </span>
            <span className="glow-cyan">{waitTotal}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOVIES.map((m, idx) => (
            <MovieCard key={m.slug} movie={m} waitBase={idx * 3 + 7} />
          ))}
        </div>
      </section>

      <footer className="border-t border-neon-cyan/15 mt-8 px-6 md:px-12 py-6 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        SeatSync // Demo Build // Simulated Cancellation & Load Management
      </footer>
    </div>
  );
}

function MovieCard({ movie, waitBase }: { movie: (typeof MOVIES)[number]; waitBase: number }) {
  return (
    <div className="panel overflow-hidden transition-all hover:box-glow-cyan group">
      <div
        className="h-40 relative"
        style={{ background: movie.poster }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, #0d0d0d 100%)" }} />
        <div className="absolute top-2 right-2 font-mono text-[10px] tracking-widest bg-black/70 border border-neon-cyan/40 px-2 py-0.5 text-neon-cyan">
          {movie.rating}
        </div>
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="font-display text-lg tracking-widest glow-cyan">{movie.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          <span>{movie.genre}</span>
          <span>{movie.duration}</span>
        </div>
        <div className="font-mono text-[10px] text-neon-violet/80 mb-3 uppercase tracking-widest">
          {movie.language}
        </div>
        <div className="space-y-2">
          {movie.showtimes.map((st, i) => {
            const waiting = waitBase + i * 2;
            return (
              <Link
                key={st.id}
                to="/show/$showId"
                params={{ showId: st.id }}
                className="flex items-center justify-between px-3 py-2 border border-neon-cyan/20 hover:border-neon-cyan hover:box-glow-cyan transition-all font-mono text-xs"
              >
                <div>
                  <div className="text-neon-cyan">{st.time}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                    {st.theatre}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-neon-amber text-[10px] uppercase tracking-widest">
                    Sold Out
                  </div>
                  <div className="text-[9px] text-muted-foreground">{waiting} waiting</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
