import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listShowsWithCounts } from "@/lib/admin.functions";
import { DemoCancellationWidget } from "@/components/admin/DemoCancellationWidget";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function StatChip({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div
      className="pastel-card px-4 py-3 min-w-[92px]"
      style={{ borderTop: `3px solid ${tone}` }}
    >
      <div
        className="font-mono text-[9px] uppercase tracking-widest"
        style={{ color: "#6b7a92" }}
      >
        {label}
      </div>
      <div
        className="text-xl font-semibold"
        style={{ color: "#2a3547", fontFamily: "var(--font-display)" }}
      >
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
        <div
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: "#6b7a92" }}
        >
          Control Room
        </div>
        <h1
          className="text-2xl md:text-3xl mt-1"
          style={{ color: "#2a3547", fontFamily: "var(--font-display)" }}
        >
          Show List
        </h1>
      </div>

      <div className="flex gap-3 flex-wrap mb-6">
        <StatChip label="Seats" value={c?.total ?? 0} tone="#87CEEB" />
        <StatChip label="Available" value={c?.available ?? 0} tone="#90EE90" />
        <StatChip label="Locked" value={c?.locked ?? 0} tone="#F0E68C" />
        <StatChip label="Booked" value={c?.booked ?? 0} tone="#DDA0DD" />
        <StatChip label="Waitlisted" value={c?.waitlisted ?? 0} tone="#FFB6C1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-6">
        <div
          className="pastel-surface px-4 py-3 font-mono text-[11px]"
          style={{ color: "#4a5b74" }}
        >
          Note: this venue uses a shared seat pool — counts reflect the whole cinema.
        </div>
        <DemoCancellationWidget />
      </div>

      {isLoading ? (
        <div className="font-mono text-sm" style={{ color: "#6b7a92" }}>Loading shows…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shows.map((s: any) => (
            <button
              key={s.id}
              onClick={() => navigate({ to: "/admin/shows/$showId", params: { showId: s.id } })}
              className="pastel-card text-left overflow-hidden hover:-translate-y-0.5 transition-all"
            >
              <div className="h-24 relative" style={{ background: s.movie?.poster ?? "#dde6f2" }}>
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 30%, rgba(255,255,255,0.85) 100%)" }}
                />
                <div className="absolute bottom-2 left-3 right-3">
                  <div
                    className="text-sm font-semibold truncate"
                    style={{ color: "#2a3547", fontFamily: "var(--font-display)" }}
                  >
                    {s.movie?.title ?? s.movie_slug}
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-1">
                <div
                  className="font-mono text-[10px] uppercase tracking-widest flex justify-between"
                  style={{ color: "#6b7a92" }}
                >
                  <span>{s.time}</span>
                  <span style={{ color: "#a97a1a" }}>{s.screen}</span>
                </div>
                <div className="font-mono text-[10px] truncate" style={{ color: "#4a5b74" }}>
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
