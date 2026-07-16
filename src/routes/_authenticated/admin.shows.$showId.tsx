import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  bookSeat,
  getShowDetail,
  listShowsWithCounts,
  lockSeatForCustomer,
  releaseSeatAdmin,
} from "@/lib/admin.functions";
import { SeatCell } from "@/components/admin/SeatCell";

export const Route = createFileRoute("/_authenticated/admin/shows/$showId")({
  component: SeatManagement,
});

function SeatManagement() {
  const { showId } = useParams({ from: "/_authenticated/admin/shows/$showId" });
  const qc = useQueryClient();
  const fn = useServerFn(getShowDetail);
  const lockFn = useServerFn(lockSeatForCustomer);
  const bookFn = useServerFn(bookSeat);
  const releaseFn = useServerFn(releaseSeatAdmin);

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ["admin", "show", showId],
    queryFn: () => fn({ data: { showId } }),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const ch = supabase
      .channel(`admin-show-${showId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "seats" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "waitlist" }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [showId, refetch]);

  const seats = data?.seats ?? [];
  const waitlist = data?.waitlist ?? [];
  const show = data?.show;

  const waitBySeat = useMemo(() => {
    const m = new Map<string, any[]>();
    for (const w of waitlist) {
      if (!m.has(w.seat_id)) m.set(w.seat_id, []);
      m.get(w.seat_id)!.push(w);
    }
    return m;
  }, [waitlist]);

  const rows = useMemo(() => {
    const g = new Map<string, any[]>();
    for (const s of seats) {
      if (!g.has(s.row_label)) g.set(s.row_label, []);
      g.get(s.row_label)!.push(s);
    }
    return Array.from(g.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const currentSeat = seats.find((s: any) => s.id === selectedSeat);
  const currentQueue = selectedSeat ? waitBySeat.get(selectedSeat) ?? [] : [];

  const lockMut = useMutation({
    mutationFn: (phone: string) =>
      lockFn({ data: { seatId: selectedSeat!, showId, phone } }),
    onSuccess: () => {
      toast.success("Seat locked");
      qc.invalidateQueries();
      refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const bookMut = useMutation({
    mutationFn: (phone: string | null) =>
      bookFn({ data: { seatId: selectedSeat!, showId, phone } }),
    onSuccess: () => {
      toast.success("Booked");
      qc.invalidateQueries();
      refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const releaseMut = useMutation({
    mutationFn: () => releaseFn({ data: { seatId: selectedSeat!, showId } }),
    onSuccess: () => {
      toast.success("Released — next in queue notified");
      qc.invalidateQueries();
      refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="px-4 md:px-8 py-6">
      <Link to="/admin" className="font-mono text-[10px] tracking-widest text-neon-cyan/70 hover:glow-cyan uppercase">
        ← Back to shows
      </Link>

      <div className="mt-3 mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl glow-cyan tracking-[0.2em]">
            {show?.movie?.title ?? show?.movie_slug ?? showId}
          </h1>
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mt-1">
            {show?.theatre} · {show?.time} · {show?.screen}
          </div>
        </div>
        <div className="flex gap-3 font-mono text-[10px] uppercase tracking-widest">
          <span className="text-neon-green">■ AVAIL</span>
          <span className="text-neon-amber">■ LOCKED</span>
          <span className="text-neon-violet">■ BOOKED</span>
          <span className="text-neon-cyan">● queue</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="panel p-4 md:p-6 overflow-x-auto">
          <div className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
            ▲ SCREEN ▲
          </div>
          <div className="space-y-1.5 min-w-fit">
            {rows.map(([row, list]) => (
              <div key={row} className="flex items-center gap-1.5">
                <div className="w-4 font-mono text-[10px] text-muted-foreground text-center">
                  {row}
                </div>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${list.length}, minmax(28px, 1fr))` }}>
                  {list.map((s: any) => {
                    const queue = waitBySeat.get(s.id) ?? [];
                    return (
                      <SeatCell
                        key={s.id}
                        id={s.id}
                        status={s.status}
                        expiresAt={s.expires_at}
                        queueLength={queue.length}
                        selected={s.id === selectedSeat}
                        onClick={() => setSelectedSeat(s.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel p-5 h-fit sticky top-4">
          {!currentSeat ? (
            <div className="font-mono text-xs text-muted-foreground text-center py-8">
              Tap a seat to open its control panel
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-display text-lg tracking-[0.2em] glow-cyan">
                  {currentSeat.id}
                </h2>
                <span
                  className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border"
                  style={{
                    color:
                      currentSeat.status === "locked"
                        ? "#ffcc00"
                        : currentSeat.status === "booked"
                        ? "#bf00ff"
                        : "#00ff88",
                    borderColor:
                      currentSeat.status === "locked"
                        ? "#ffcc00"
                        : currentSeat.status === "booked"
                        ? "#bf00ff"
                        : "#00ff88",
                  }}
                >
                  {currentSeat.status}
                </span>
              </div>

              {currentSeat.locked_by && (
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                  Held for: <span className="text-neon-cyan">{currentSeat.locked_by}</span>
                </div>
              )}

              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Waitlist ({currentQueue.length})
              </div>
              <div className="space-y-1.5 mb-4 max-h-64 overflow-y-auto">
                {currentQueue.length === 0 && (
                  <div className="font-mono text-xs italic text-muted-foreground">
                    No one waiting
                  </div>
                )}
                {currentQueue.map((w: any, i: number) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between panel-2 px-2 py-1.5 font-mono text-[11px]"
                  >
                    <div>
                      <span className="text-neon-cyan">#{w.position}</span>{" "}
                      <span className="text-foreground">{w.phone}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => lockMut.mutate(w.phone)}
                        disabled={lockMut.isPending || currentSeat.status !== "available"}
                        className="px-2 py-0.5 text-[9px] uppercase tracking-widest border border-neon-amber text-neon-amber hover:bg-neon-amber/10 disabled:opacity-30"
                        title="Lock seat for this customer"
                      >
                        Lock
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-neon-cyan/15">
                {currentSeat.status === "locked" && (
                  <button
                    onClick={() => bookMut.mutate(currentSeat.locked_by ?? null)}
                    disabled={bookMut.isPending}
                    className="w-full py-2 font-display tracking-[0.2em] uppercase text-[11px]"
                    style={{
                      background: "rgba(191,0,255,0.1)",
                      border: "1px solid #bf00ff",
                      color: "#bf00ff",
                      boxShadow: "0 0 12px rgba(191,0,255,0.4)",
                    }}
                  >
                    Confirm Booking
                  </button>
                )}
                {currentSeat.status !== "available" && (
                  <button
                    onClick={() => releaseMut.mutate()}
                    disabled={releaseMut.isPending}
                    className="w-full py-2 font-display tracking-[0.2em] uppercase text-[11px]"
                    style={{
                      background: "rgba(0,255,136,0.08)",
                      border: "1px solid #00ff88",
                      color: "#00ff88",
                      boxShadow: "0 0 12px rgba(0,255,136,0.35)",
                    }}
                  >
                    Release Seat
                  </button>
                )}
                {currentSeat.status === "available" && currentQueue.length === 0 && (
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center py-2">
                    Available — no queue
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
