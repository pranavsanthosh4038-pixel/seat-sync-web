import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listActivity } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  component: ActivityPage,
});

const ACTION_COLORS: Record<string, string> = {
  lock: "#ffcc00",
  book: "#bf00ff",
  release: "#00ff88",
  waitlist_remove: "#ff2e5b",
};

function ActivityPage() {
  const fn = useServerFn(listActivity);
  const { data = [], refetch } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: () => fn(),
    refetchInterval: 15000,
  });

  useEffect(() => {
    const ch = supabase
      .channel("admin-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_activity" }, () =>
        refetch(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refetch]);

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
          Control Room
        </div>
        <h1 className="font-display text-2xl md:text-3xl glow-cyan mt-1">ACTIVITY LOG</h1>
      </div>

      <div className="panel">
        {data.length === 0 && (
          <div className="p-6 text-center text-muted-foreground font-mono text-xs italic">
            No activity yet
          </div>
        )}
        <ul>
          {data.map((a: any) => {
            const color = ACTION_COLORS[a.action] ?? "#00f0ff";
            return (
              <li
                key={a.id}
                className="border-b border-neon-cyan/10 px-4 py-3 flex items-start gap-4 font-mono text-xs"
              >
                <span
                  className="uppercase tracking-widest text-[10px] px-2 py-0.5 border shrink-0"
                  style={{ color, borderColor: color }}
                >
                  {a.action}
                </span>
                <div className="flex-1 min-w-0">
                  <div>
                    {a.seat_id && (
                      <span className="text-neon-cyan mr-3">SEAT {a.seat_id}</span>
                    )}
                    {a.target_phone && (
                      <span className="text-foreground mr-3">→ {a.target_phone}</span>
                    )}
                    {a.show_id && (
                      <span className="text-muted-foreground">show {a.show_id}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                    {a.actor_email ?? "unknown"} · {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
