import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listWaitlist, removeWaitlistEntry } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/waitlist")({
  component: WaitlistPage,
});

function WaitlistPage() {
  const listFn = useServerFn(listWaitlist);
  const removeFn = useServerFn(removeWaitlistEntry);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data = [], refetch } = useQuery({
    queryKey: ["admin", "waitlist"],
    queryFn: () => listFn(),
    refetchInterval: 20000,
  });

  useEffect(() => {
    const ch = supabase
      .channel("admin-waitlist")
      .on("postgres_changes", { event: "*", schema: "public", table: "waitlist" }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refetch]);

  const remove = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries();
      refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return data;
    return data.filter(
      (w: any) =>
        w.phone.includes(q) ||
        w.seat_id.toLowerCase().includes(q.toLowerCase()),
    );
  }, [data, search]);

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
            Control Room
          </div>
          <h1 className="font-display text-2xl md:text-3xl glow-cyan mt-1">WAITLIST</h1>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search phone or seat…"
          className="px-3 py-2 bg-black border border-neon-cyan/30 font-mono text-sm text-foreground focus:outline-none focus:border-neon-cyan focus:box-glow-cyan min-w-[240px]"
        />
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="border-b border-neon-cyan/15 text-neon-cyan/80 uppercase tracking-widest text-[10px]">
              <th className="text-left px-3 py-2">Seat</th>
              <th className="text-left px-3 py-2">Phone</th>
              <th className="text-left px-3 py-2">Position</th>
              <th className="text-left px-3 py-2">Joined</th>
              <th className="text-left px-3 py-2">Notified</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground italic">
                  No entries
                </td>
              </tr>
            )}
            {filtered.map((w: any) => (
              <tr key={w.id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                <td className="px-3 py-2 text-neon-cyan">{w.seat_id}</td>
                <td className="px-3 py-2">{w.phone}</td>
                <td className="px-3 py-2 text-neon-amber">#{w.position}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {new Date(w.joined_at).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  {w.notified ? (
                    <span className="text-neon-green">✓</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${w.phone} from waitlist for ${w.seat_id}?`))
                        remove.mutate(w.id);
                    }}
                    className="px-2 py-1 text-[10px] uppercase tracking-widest border border-destructive/60 text-destructive hover:bg-destructive/10"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {filtered.length} of {data.length} entries
      </div>
    </div>
  );
}
