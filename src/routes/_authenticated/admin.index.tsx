import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listShowsWithCounts } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function StatChip({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="panel-2 px-3 py-2 min-w-[80px]">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-lg" style={{ color: tone, textShadow: `0 0 8px ${tone}88` }}>
        {value}
      </div>
    </div>
  );
}

function DashboardPage() {
  const fn = useServerFn(listShowsWithCounts);
  const navigate = useNavigate();
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin", "shows"],
    queryFn: () => fn(),
    refetchInterval: 15000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-shows")
      .on("postgres_changes", { event: "*", schema: "public", table: "seats" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "waitlist" }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const c = data?.counts;
  const shows = data?.shows ?? [];

  return (
    <div className="px-4 md:px-8 py-8">
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
          Control Room
        </div>
        <h1 className="font-display text-2xl md:text-3xl glow-cyan mt-1">SHOW LIST</h1>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        <StatChip label="Seats" value={c?.total ?? 0} tone="#00f0ff" />
        <StatChip label="Available" value={c?.available ?? 0} tone="#00ff88" />
        <StatChip label="Locked" value={c?.locked ?? 0} tone="#ffcc00" />
        <StatChip label="Booked" value={c?.booked ?? 0} tone="#bf00ff" />
        <StatChip label="Waitlisted" value={c?.waitlisted ?? 0} tone="#00f0ff" />
      </div>

      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        Note: this venue uses a shared seat pool — counts above reflect the whole cinema.
      </div>

      {isLoading ? (
        <div className="font-mono text-sm text-muted-foreground">Loading shows…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shows.map((s: any) => (
            <button
              key={s.id}
              onClick={() => navigate({ to: "/admin/shows/$showId", params: { showId: s.id } })}
              className="panel text-left overflow-hidden hover:box-glow-cyan transition-all"
            >
              <div className="h-24 relative" style={{ background: s.movie?.poster ?? "#111" }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, #0d0d0d 100%)" }} />
                <div className="absolute bottom-2 left-3 right-3">
                  <div className="font-display text-sm tracking-widest glow-cyan truncate">
                    {s.movie?.title ?? s.movie_slug}
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between">
                  <span>{s.time}</span>
                  <span className="text-neon-amber">{s.screen}</span>
                </div>
                <div className="font-mono text-[10px] text-neon-cyan/80 truncate">
                  {s.theatre}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
