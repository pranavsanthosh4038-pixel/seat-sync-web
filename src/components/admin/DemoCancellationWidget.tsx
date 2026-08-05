import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchSeats, lockSeat, releaseSeat, type Seat } from "@/lib/seats";

export function DemoCancellationWidget() {
  const qc = useQueryClient();
  const { data: seats = [] } = useQuery({
    queryKey: ["demo-widget", "seats"],
    queryFn: fetchSeats,
    refetchInterval: 5000,
  });

  const [selectedId, setSelectedId] = useState<string>("");
  const [remaining, setRemaining] = useState<number>(0);

  const selected: Seat | undefined = seats.find((s) => s.id === selectedId);

  useEffect(() => {
    if (!selected || selected.status !== "locked" || !selected.expires_at) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const ms = new Date(selected.expires_at!).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(ms / 1000)));
    };
    tick();
    const int = setInterval(tick, 1000);
    return () => clearInterval(int);
  }, [selected]);

  const lockMut = useMutation({
    mutationFn: () => lockSeat(selectedId, "admin-demo"),
    onSuccess: () => {
      toast.success(`Locked ${selectedId} for 2 min`);
      qc.invalidateQueries({ queryKey: ["demo-widget", "seats"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Lock failed"),
  });

  const releaseMut = useMutation({
    mutationFn: () => releaseSeat(selectedId),
    onSuccess: (next) => {
      toast.success(
        next ? `Released — notified next in queue (${next.phone})` : `Released ${selectedId}`,
      );
      qc.invalidateQueries({ queryKey: ["demo-widget", "seats"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Release failed"),
  });

  const isLocked = selected?.status === "locked";
  const mmss = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
    remaining % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="pastel-card p-5 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div
          className="font-mono text-[11px] uppercase tracking-[0.25em]"
          style={{ color: "#6b4d09" }}
        >
          Admin // Demo
        </div>
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#f8cf6b", boxShadow: "0 0 8px #f8cf6b" }}
        />
      </div>

      <label
        className="font-mono text-[10px] uppercase tracking-widest block mb-1"
        style={{ color: "#6b7a92" }}
      >
        Select seat
      </label>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full mb-3 px-3 py-2 pastel-inset text-sm focus:outline-none"
        style={{ color: "#2a3547" }}
      >
        <option value="">— pick a seat —</option>
        {seats.map((s) => (
          <option key={s.id} value={s.id}>
            {s.id} — {s.status}
            {s.locked_by ? ` (${s.locked_by})` : ""}
          </option>
        ))}
      </select>

      {lockedSeats.length > 0 && (
        <div className="mb-4">
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-1"
            style={{ color: "#6b7a92" }}
          >
            Held by users ({lockedSeats.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lockedSeats.slice(0, 12).map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className="px-2 py-1 rounded-lg text-[11px] font-mono"
                style={{
                  background: s.id === selectedId ? "#f8cf6b" : "#fdf0cf",
                  color: "#6b4d09",
                }}
                title={s.locked_by ? `Locked by ${s.locked_by}` : "Locked"}
              >
                {s.id}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        disabled={!selected || isLocked || lockMut.isPending}
        onClick={() => lockMut.mutate()}
        className="w-full py-2.5 mb-3 pastel-btn-amber font-mono text-xs uppercase tracking-[0.2em] disabled:opacity-40"
      >
        {isLocked ? `Locked · ${mmss}` : "Lock Seat (2 min)"}
      </button>

      <button
        disabled={!selected || selected.status === "available" || releaseMut.isPending}
        onClick={() => releaseMut.mutate()}
        className="w-full py-2.5 pastel-btn-green font-mono text-xs uppercase tracking-[0.2em] disabled:opacity-40"
      >
        {isLocked && selected?.locked_by ? "Force Release (user hold)" : "Release Seat Now"}
      </button>

      <div
        className="mt-4 font-mono text-[10px] uppercase tracking-widest text-center"
        style={{ color: "#8a97ad" }}
      >
        Manual override · notifies next in queue
      </div>

    </div>
  );
}
