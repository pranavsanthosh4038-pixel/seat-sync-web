import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchSeats, joinWaitlist, type Seat } from "@/lib/seats";
import { findMovieByShowtime } from "@/lib/movies";
import { supabase } from "@/integrations/supabase/client";
import { SeatGrid } from "@/components/SeatGrid";
import { AdminPanel } from "@/components/AdminPanel";

export const Route = createFileRoute("/show/$showId")({
  head: ({ params }) => ({
    meta: [
      { title: `SeatSync // ${params.showId}` },
      { name: "description", content: "Live seat map. Join the waitlist for sold-out seats." },
    ],
  }),
  component: SeatPicker,
});

function neonToastStyle(color: string) {
  return {
    background: "#0d0d0d",
    border: `1px solid ${color}`,
    color,
    boxShadow: `0 0 20px ${color}66`,
    fontFamily: "Space Mono, monospace",
    letterSpacing: "0.05em",
  };
}

function SeatPicker() {
  const { showId } = useParams({ from: "/show/$showId" });
  const found = findMovieByShowtime(showId);
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: seats = [] } = useQuery({
    queryKey: ["seats"],
    queryFn: fetchSeats,
    refetchInterval: 15000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("seats-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seats" },
        (payload) => {
          const oldSeat = payload.old as Partial<Seat> | undefined;
          const newSeat = payload.new as Partial<Seat> | undefined;
          qc.invalidateQueries({ queryKey: ["seats"] });

          if (
            newSeat &&
            oldSeat &&
            oldSeat.status === "available" &&
            newSeat.status === "locked"
          ) {
            toast(`Seat ${newSeat.id} locked — releases in 2 min`, {
              style: neonToastStyle("#ffcc00"),
            });
          }
          if (
            newSeat &&
            oldSeat &&
            oldSeat.status === "locked" &&
            newSeat.status === "available"
          ) {
            toast(`Seat ${newSeat.id} is now FREE!`, {
              style: neonToastStyle("#00ff88"),
            });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 8) {
          toast("Max 8 seats per waitlist entry", { style: neonToastStyle("#ffcc00") });
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const validPhone = /^\d{10}$/.test(phone);
  const canSubmit = selected.size > 0 && validPhone && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const results = await joinWaitlist(Array.from(selected), phone);
      for (const r of results) {
        toast(`You're #${r.position} in queue for ${r.seatId}`, {
          style: neonToastStyle("#00f0ff"),
        });
      }
      setSelected(new Set());
      setPhone("");
    } catch (e) {
      toast.error(String((e as Error).message));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedList = useMemo(() => Array.from(selected).sort(), [selected]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-neon-cyan/15 px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="font-mono text-xs tracking-widest text-neon-cyan/70 hover:glow-cyan uppercase"
          >
            ← Back
          </Link>
          <div>
            <h1 className="font-display text-lg tracking-[0.25em] glow-cyan">
              {found?.movie.title ?? "SHOW"}
            </h1>
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              {found?.showtime.theatre} · {found?.showtime.time} · {found?.showtime.screen}
            </div>
          </div>
        </div>
        <div className="font-mono text-[10px] tracking-widest text-neon-amber uppercase">
          Show Status: <span className="glow-amber">SOLD OUT</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 px-6 md:px-12 py-8">
        <div>
          <SeatGrid seats={seats} selected={selected} onToggle={toggle} />
        </div>

        <aside
          className="panel p-5 h-fit sticky top-6"
          style={{ boxShadow: "0 0 20px rgba(0,240,255,0.15)" }}
        >
          <h2 className="font-display text-sm tracking-[0.25em] glow-cyan mb-4">
            JOIN WAITLIST
          </h2>

          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Selected Seats
          </div>
          {selectedList.length === 0 ? (
            <div className="text-muted-foreground font-mono text-xs italic mb-4">
              Tap a green seat to select
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedList.map((id) => (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className="px-2 py-1 font-mono text-xs border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                  style={{ boxShadow: "0 0 8px rgba(0,240,255,0.4)" }}
                >
                  {id} ×
                </button>
              ))}
            </div>
          )}

          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Phone Number
          </div>
          <div className="flex mb-4">
            <span className="px-3 py-2 bg-panel-2 border border-neon-cyan/30 border-r-0 font-mono text-sm text-neon-cyan/70">
              +91
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile"
              inputMode="numeric"
              className="flex-1 px-3 py-2 bg-black border border-neon-cyan/30 font-mono text-sm text-foreground focus:outline-none focus:border-neon-cyan focus:box-glow-cyan"
            />
          </div>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full py-3 font-display tracking-[0.25em] uppercase text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{
              background: canSubmit ? "rgba(0,240,255,0.1)" : "transparent",
              border: "1px solid #00f0ff",
              color: "#00f0ff",
              boxShadow: canSubmit
                ? "0 0 16px rgba(0,240,255,0.6), inset 0 0 8px rgba(0,240,255,0.2)"
                : "none",
            }}
          >
            {submitting ? "Joining…" : "Join Waitlist"}
          </button>

          <div className="mt-6 pt-4 border-t border-neon-cyan/15 font-mono text-[10px] leading-relaxed text-muted-foreground uppercase tracking-widest">
            Amber pulse = locked · Green = available · Cyan = your pick · Max 8 seats
          </div>
        </aside>
      </div>

      <AdminPanel seats={seats} />
    </div>
  );
}
